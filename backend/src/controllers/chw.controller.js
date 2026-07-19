require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logVisit = async (req, res) => {
  try {
    const { patientName, visitType, notes } = req.body;
    const userId = req.user.id;

    if (!patientName || !visitType) {
      return res.status(400).json({ success: false, error: 'Patient name and visit type are required' });
    }

    const chw = await prisma.cHW.findUnique({ where: { userId } });
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

    const [visits, total] = await Promise.all([
      prisma.cHWVisitLog.findMany({
        include: { chw: { include: { user: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.cHWVisitLog.count()
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

module.exports = { logVisit, getAllVisits };