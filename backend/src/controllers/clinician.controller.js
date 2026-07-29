require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMyClinicianProfile = async (req) => {
  return prisma.clinician.findUnique({ where: { userId: req.user.id } });
};

const getMyAppointments = async (req, res) => {
  try {
    const clinician = await getMyClinicianProfile(req);
    if (!clinician) {
      return res.status(400).json({ success: false, error: 'No clinician profile found for this account' });
    }

    const { today } = req.query;
    const where = { clinicianId: clinician.id };

    if (today === 'true') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      where.scheduledAt = { gte: start, lte: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: true } },
        facility: true,
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMyPatients = async (req, res) => {
  try {
    const clinician = await getMyClinicianProfile(req);
    if (!clinician) {
      return res.status(400).json({ success: false, error: 'No clinician profile found for this account' });
    }

    const visits = await prisma.visit.findMany({
      where: { clinicianId: clinician.id },
      include: {
        ehr: { include: { patient: { include: { user: true } } } }
      },
      orderBy: { visitDate: 'desc' }
    });

    // De-duplicate patients (a clinician may have multiple visits with the same patient)
    const seen = new Set();
    const patients = [];
    for (const v of visits) {
      const p = v.ehr?.patient;
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        patients.push({
          id: p.id,
          name: p.user?.name,
          nationalId: p.nationalId,
          gender: p.gender,
          dateOfBirth: p.dateOfBirth,
          lastVisitDate: v.visitDate,
        });
      }
    }

    res.json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createVisit = async (req, res) => {
  try {
    const clinician = await getMyClinicianProfile(req);
    if (!clinician) {
      return res.status(400).json({ success: false, error: 'No clinician profile found for this account' });
    }

    const { patientId, visitType, soapNotes, icd10Code, prescriptions, appointmentId } = req.body;

    if (!patientId || !visitType) {
      return res.status(400).json({ success: false, error: 'Patient and visit type are required' });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { ehr: true }
    });

    if (!patient || !patient.ehr) {
      return res.status(404).json({ success: false, error: 'Patient or EHR not found' });
    }

    const visit = await prisma.visit.create({
      data: {
        ehrId: patient.ehr.id,
        clinicianId: clinician.id,
        visitType,
        soapNotes: soapNotes || null,
        icd10Code: icd10Code || null,
      }
    });

    if (prescriptions && prescriptions.length > 0) {
      for (const rx of prescriptions) {
        if (rx.medication && rx.dose && rx.frequency && rx.duration) {
          await prisma.prescription.create({
            data: {
              visitId: visit.id,
              medication: rx.medication,
              dose: rx.dose,
              frequency: rx.frequency,
              duration: rx.duration,
            }
          });
        }
      }
    }

    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' }
      }).catch(() => {}); // don't fail the visit if this side-update fails
    }

    const fullVisit = await prisma.visit.findUnique({
      where: { id: visit.id },
      include: { prescriptions: true }
    });

    res.status(201).json({ success: true, data: fullVisit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createReferral = async (req, res) => {
  try {
    const clinician = await getMyClinicianProfile(req);
    if (!clinician) {
      return res.status(400).json({ success: false, error: 'No clinician profile found for this account' });
    }

    const { patientId, toFacilityId, notes } = req.body;

    if (!patientId || !toFacilityId) {
      return res.status(400).json({ success: false, error: 'Patient and destination facility are required' });
    }

    const referral = await prisma.referral.create({
      data: {
        patientId,
        clinicianId: clinician.id,
        fromFacilityId: clinician.facilityId || null,
        toFacilityId,
        notes: notes || null,
        status: 'SENT',
      }
    });

    res.status(201).json({ success: true, data: referral });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFacilities = async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: facilities });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getMyAppointments, getMyPatients, createVisit, createReferral, getFacilities };