require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const registerPatient = async (req, res) => {
  try {
    const { name, email, nationalId, dateOfBirth, gender, insuranceId, phone } = req.body;

    if (!name || !nationalId) {
      return res.status(400).json({ success: false, error: 'Name and National ID are required' });
    }

    const existing = await prisma.patient.findUnique({ where: { nationalId } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A patient with this National ID already exists' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email || `${nationalId}@xhealth.rw`,
        passwordHash: 'PATIENT_NO_LOGIN',
        role: 'PATIENT',
        phone: phone || null,
      }
    });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        nationalId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        insuranceId: insuranceId || null,
      },
      include: { user: true }
    });

    const ehr = await prisma.eHR.create({
      data: { patientId: patient.id, allergies: [] }
    });

    res.status(201).json({
      success: true,
      data: {
        id: patient.id,
        name: patient.user.name,
        email: patient.user.email,
        nationalId: patient.nationalId,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        insuranceId: patient.insuranceId,
        phone: patient.user.phone,
        ehrId: ehr.id,
        createdAt: patient.user.createdAt,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search ? {
      OR: [
        { nationalId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { insuranceId: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: { user: true, ehr: true },
        skip,
        take: parseInt(limit),
        orderBy: { user: { createdAt: 'desc' } }
      }),
      prisma.patient.count({ where })
    ]);

    const formatted = patients.map(p => ({
      id: p.id,
      name: p.user.name,
      email: p.user.email,
      phone: p.user.phone,
      nationalId: p.nationalId,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      insuranceId: p.insuranceId,
      ehrId: p.ehr?.id || null,
      createdAt: p.user.createdAt,
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: true,
        ehr: {
          include: {
            visits: {
              include: {
                clinician: { include: { user: true } },
                prescriptions: true,
              },
              orderBy: { visitDate: 'desc' }
            }
          }
        },
        appointments: {
          include: {
            clinician: { include: { user: true } },
            facility: true,
          },
          orderBy: { scheduledAt: 'desc' },
          take: 5,
        },
        referrals: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, insuranceId, gender, dateOfBirth } = req.body;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    await prisma.user.update({
      where: { id: patient.userId },
      data: {
        name: name || patient.user.name,
        phone: phone || patient.user.phone
      }
    });

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        insuranceId: insuranceId || patient.insuranceId,
        gender: gender || patient.gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : patient.dateOfBirth,
      },
      include: { user: true }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { registerPatient, getAllPatients, getPatient, updatePatient };