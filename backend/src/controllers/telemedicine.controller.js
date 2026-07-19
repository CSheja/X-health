require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSessions = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { type: 'TELEMEDICINE' },
      include: {
        patient: { include: { user: true } },
        clinician: { include: { user: true } },
      },
      orderBy: { scheduledAt: 'desc' }
    });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const startSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
      include: {
        patient: { include: { user: true } },
        clinician: { include: { user: true } },
      }
    });

    // Generate a simple room ID based on appointment
    const roomId = `xhealth-${appointmentId.slice(0, 8)}`;

    res.json({ success: true, data: { appointment, roomId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { appointmentId, soapNotes, prescriptions } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
      include: {
        patient: { include: { ehr: true } },
        clinician: true,
      }
    });

    // Save SOAP notes as a visit
    if (soapNotes && appointment.patient.ehr) {
      const visit = await prisma.visit.create({
        data: {
          ehrId: appointment.patient.ehr.id,
          clinicianId: appointment.clinicianId,
          visitType: 'TELEMEDICINE',
          soapNotes,
        }
      });

      // Save prescriptions if any
      if (prescriptions && prescriptions.length > 0) {
        for (const rx of prescriptions) {
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

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getSessions, startSession, endSession };