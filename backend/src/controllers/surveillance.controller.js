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

module.exports = { getAllCases, reportCase };