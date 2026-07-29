require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN'
      ? { facilityId: req.user.facilityId }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        status: true,
        facilityId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFacilityStats = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Facility Admin access only' });
    }

    const facilityId = req.user.facilityId;
    if (!facilityId) {
      return res.status(400).json({ success: false, error: 'This admin account has no facility assigned' });
    }

    const [staffCount, appointmentsToday, appointmentsTotal, clinicianIds] = await Promise.all([
      prisma.user.count({ where: { facilityId } }),
      prisma.appointment.count({
        where: {
          facilityId,
          scheduledAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          }
        }
      }),
      prisma.appointment.count({ where: { facilityId } }),
      prisma.clinician.findMany({ where: { facilityId }, select: { id: true } }),
    ]);

    const visitCount = await prisma.visit.count({
      where: { clinicianId: { in: clinicianIds.map(c => c.id) } }
    });

    res.json({
      success: true,
      data: {
        staffCount,
        appointmentsToday,
        appointmentsTotal,
        visitCount,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getClinicianByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const clinician = await prisma.clinician.findUnique({
      where: { userId: id },
    });
    if (!clinician) {
      return res.status(404).json({ success: false, error: 'Clinician profile not found' });
    }
    res.json({ success: true, data: clinician });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllUsers, getFacilityStats, updateUserStatus, deleteUser, getClinicianByUserId };