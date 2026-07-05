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

module.exports = app;