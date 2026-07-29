require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllPrescriptions = async (req, res) => {
  try {
    const { dispensed, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (dispensed !== undefined) where.dispensed = dispensed === 'true';

    // Scope by facility for ADMIN/PHARMACIST — SYSADMIN sees everything
    if (req.user.role !== 'SYSADMIN') {
      where.visit = {
        clinician: { facilityId: req.user.facilityId }
      };
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          visit: {
            include: {
              clinician: { include: { user: true, facility: true } },
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

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        visit: {
          include: {
            clinician: true,
            ehr: { include: { patient: { include: { user: true } } } }
          }
        }
      }
    });

    if (!prescription) {
      return res.status(404).json({ success: false, error: 'Prescription not found' });
    }
    if (prescription.dispensed) {
      return res.status(400).json({ success: false, error: 'Already dispensed' });
    }

    const facilityId = prescription.visit.clinician.facilityId;

    const updated = await prisma.$transaction(async (tx) => {
      const dispensedRx = await tx.prescription.update({
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

      // Auto-decrement stock if this facility tracks this medication
      if (facilityId) {
        const stock = await tx.stock.findUnique({
          where: {
            facilityId_medication: {
              facilityId,
              medication: prescription.medication
            }
          }
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: Math.max(0, stock.quantity - 1) }
          });
        }
      }

      return dispensedRx;
    });

    res.json({ success: true, data: updated });
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

// ── Stock management ────────────────────────────────────────

const getStock = async (req, res) => {
  try {
    let stock;

    if (req.user.role === 'SYSADMIN') {
      // System-wide view, grouped implicitly by facility via include
      stock = await prisma.stock.findMany({
        include: { facility: true },
        orderBy: [{ facility: { name: 'asc' } }, { medication: 'asc' }]
      });
    } else {
      if (!req.user.facilityId) {
        return res.status(400).json({ success: false, error: 'This account has no facility assigned' });
      }
      stock = await prisma.stock.findMany({
        where: { facilityId: req.user.facilityId },
        include: { facility: true },
        orderBy: { medication: 'asc' }
      });
    }

    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const upsertStock = async (req, res) => {
  try {
    const { medication, quantity, unit, reorderLevel, mode } = req.body;

    if (!medication || quantity === undefined) {
      return res.status(400).json({ success: false, error: 'Medication and quantity are required' });
    }

    if (req.user.role === 'SYSADMIN') {
      return res.status(400).json({ success: false, error: 'Super Admin cannot directly edit facility stock' });
    }

    if (!req.user.facilityId) {
      return res.status(400).json({ success: false, error: 'This account has no facility assigned' });
    }

    const existing = await prisma.stock.findUnique({
      where: {
        facilityId_medication: {
          facilityId: req.user.facilityId,
          medication
        }
      }
    });

    const incomingQty = parseInt(quantity);
    const finalQty = (mode === 'add' && existing)
      ? existing.quantity + incomingQty
      : incomingQty;

    const stock = await prisma.stock.upsert({
      where: {
        facilityId_medication: {
          facilityId: req.user.facilityId,
          medication
        }
      },
      update: {
        quantity: finalQty,
        unit: unit || undefined,
        reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel) : undefined,
      },
      create: {
        facilityId: req.user.facilityId,
        medication,
        quantity: incomingQty,
        unit: unit || null,
        reorderLevel: reorderLevel !== undefined ? parseInt(reorderLevel) : 10,
      }
    });

    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllPrescriptions,
  dispensePrescription,
  createPrescription,
  getStock,
  upsertStock,
};