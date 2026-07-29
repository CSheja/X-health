require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllCases = async (req, res) => {
  try {
    const cases = await prisma.surveillanceCase.findMany({
      include: { chw: { include: { user: true } } },
      orderBy: { reportedAt: 'desc' }
    });
    res.json({ success: true, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const reportCase = async (req, res) => {
  try {
    const { conditionCode, districtId, status } = req.body;
    const userId = req.user.id;
    const chw = await prisma.cHW.findUnique({ where: { userId } });
    if (!chw) {
      return res.status(404).json({ success: false, error: 'CHW profile not found. Only CHWs can report cases.' });
    }

    const newCase = await prisma.surveillanceCase.create({
      data: {
        chwId: chw.id,
        conditionCode,
        districtId: districtId || null,
        status: status || 'REPORTED',
      }
    });

    res.status(201).json({ success: true, data: newCase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSurveillanceStats = async (req, res) => {
  try {
    const cases = await prisma.surveillanceCase.findMany();

    // Group by district
    const districtMap = {};
    for (const c of cases) {
      const district = c.districtId || 'Unknown';
      districtMap[district] = (districtMap[district] || 0) + 1;
    }
    const districtBreakdown = Object.entries(districtMap)
      .map(([district, count]) => ({ district, cases: count }))
      .sort((a, b) => b.cases - a.cases);

    // Simple outbreak alert: 3+ cases of the same condition in the same district
    const conditionDistrictMap = {};
    for (const c of cases) {
      const key = `${c.districtId || 'Unknown'}::${c.conditionCode}`;
      conditionDistrictMap[key] = (conditionDistrictMap[key] || 0) + 1;
    }
    const alerts = Object.entries(conditionDistrictMap)
      .filter(([, count]) => count >= 3)
      .map(([key, count]) => {
        const [district, conditionCode] = key.split('::');
        return { district, conditionCode, count };
      });

    // Real trend: cases grouped by the actual date reported
    const dateMap = {};
    for (const c of cases) {
      const dateKey = new Date(c.reportedAt).toISOString().split('T')[0]; // YYYY-MM-DD
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    }
    const trend = Object.entries(dateMap)
      .map(([date, count]) => ({ date, cases: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        totalCases: cases.length,
        totalDistricts: Object.keys(districtMap).length,
        districtBreakdown,
        alerts,
        trend,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllCases, reportCase, getSurveillanceStats };