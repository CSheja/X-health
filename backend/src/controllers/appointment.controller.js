require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createAppointment = async (req, res) => {
  try {
    const { patientId, clinicianId, facilityId, scheduledAt, type } = req.body;

    if (!patientId || !clinicianId || !scheduledAt || !type) {
      return res.status(400).json({ success: false, error: 'Patient, clinician, date and type are required' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        clinicianId,
        facilityId: facilityId || null,
        scheduledAt: new Date(scheduledAt),
        type,
        status: 'SCHEDULED',
      },
      include: {
        patient: { include: { user: true } },
        clinician: { include: { user: true } },
        facility: true,
      }
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: { include: { user: true } },
          clinician: { include: { user: true } },
          facility: true,
        },
        skip,
        take: parseInt(limit),
        orderBy: { scheduledAt: 'asc' }
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({
      success: true,
      data: appointments,
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

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: { include: { user: true } },
        clinician: { include: { user: true } },
      }
    });

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        clinician: { include: { user: true } },
        facility: true,
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createAppointment, getAllAppointments, updateAppointmentStatus, getAppointment };