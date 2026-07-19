const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'X-Health Rwanda API is running' });
});

const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);

const patientRoutes = require('./routes/patient.routes');
app.use('/api/v1/patients', patientRoutes);

const appointmentRoutes = require('./routes/appointment.routes');
app.use('/api/v1/appointments', appointmentRoutes);

const adminRoutes = require('./routes/admin.routes');
app.use('/api/v1/admin', adminRoutes);

// Temporary seed route — remove after use
app.post('/api/v1/seed/clinician', async (req, res) => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const clinician = await prisma.clinician.create({
      data: { userId: '9e51b99c-e950-4ca5-804e-e05dec8def0c', specialty: 'General Medicine' }
    });
    const chw = await prisma.cHW.create({
      data: { userId: 'c2c01424-fea9-4110-8a6d-7a064529f67e' }
    });
    res.json({ success: true, clinician, chw });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = app;