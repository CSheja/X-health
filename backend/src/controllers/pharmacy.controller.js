require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllPrescriptions = async (req, res) => {
  try {
    const { dispensed, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (dispensed !== undefined) where.dispensed = dispensed === 'true';

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          visit: {
            include: {
              clinician: { include: { user: true } },
              ehr: {
                include: {
                  patient: { include: { user: true } }
                }
              }
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.prescription.count({ where })
    ]);

    res.json({
      success: true,
      data: prescriptions,
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

const dispensePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.update({
      where: { id },
      data: { dispensed: true },
      include: {
        visit: {
          include: {
            ehr: { include: { patient: { include: { user: true } } } }
          }
        }
      }
    });

    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPrescription = async (req, res) => {
  try {
    const { visitId, medication, dose, frequency, duration } = req.body;

    if (!visitId || !medication || !dose || !frequency || !duration) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const prescription = await prisma.prescription.create({
      data: { visitId, medication, dose, frequency, duration }
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllPrescriptions, dispensePrescription, createPrescription };