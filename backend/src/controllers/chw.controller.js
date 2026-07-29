require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMyChwProfile = async (req) => {
  return prisma.cHW.findUnique({ where: { userId: req.user.id } });
};

const logVisit = async (req, res) => {
  try {
    const { patientName, visitType, notes } = req.body;

    if (!patientName || !visitType) {
      return res.status(400).json({ success: false, error: 'Patient name and visit type are required' });
    }

    const chw = await getMyChwProfile(req);
    if (!chw) {
      return res.status(404).json({ success: false, error: 'CHW profile not found' });
    }

    const visit = await prisma.cHWVisitLog.create({
      data: {
        chwId: chw.id,
        patientName,
        visitType,
        notes: notes || null,
        synced: false,
      }
    });

    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllVisits = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    // Scope to the logged-in CHW's own visits, unless they're an admin role
    if (req.user.role === 'CHW') {
      const chw = await getMyChwProfile(req);
      if (!chw) {
        return res.status(404).json({ success: false, error: 'CHW profile not found' });
      }
      where.chwId = chw.id;
    }

    const [visits, total] = await Promise.all([
      prisma.cHWVisitLog.findMany({
        where,
        include: { chw: { include: { user: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.cHWVisitLog.count({ where })
    ]);

    res.json({
      success: true,
      data: visits,
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

const reportCase = async (req, res) => {
  try {
    const { conditionCode, districtId } = req.body;

    if (!conditionCode) {
      return res.status(400).json({ success: false, error: 'Condition code is required' });
    }

    const chw = await getMyChwProfile(req);
    if (!chw) {
      return res.status(404).json({ success: false, error: 'CHW profile not found' });
    }

    const surveillanceCase = await prisma.surveillanceCase.create({
      data: {
        chwId: chw.id,
        conditionCode,
        districtId: districtId || null,
        status: 'REPORTED',
      }
    });

    res.status(201).json({ success: true, data: surveillanceCase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMyCases = async (req, res) => {
  try {
    const chw = await getMyChwProfile(req);
    if (!chw) {
      return res.status(404).json({ success: false, error: 'CHW profile not found' });
    }

    const cases = await prisma.surveillanceCase.findMany({
      where: { chwId: chw.id },
      orderBy: { reportedAt: 'desc' }
    });

    res.json({ success: true, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { logVisit, getAllVisits, reportCase, getMyCases };