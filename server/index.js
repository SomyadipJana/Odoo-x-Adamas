import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Import database (triggers schema creation & seeding)
import db from './db/schema.js';

// Import route modules
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import attendanceRoutes from './routes/attendance.js';
import leaveRoutes from './routes/leave.js';
import payrollRoutes from './routes/payroll.js';

// Import authentication middleware
import { authenticate } from './middleware/auth.js';

const app = express();
const PORT = 3001;

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─── Create uploads directory ───────────────────────────────────────────────

const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Serve uploaded files as static ─────────────────────────────────────────

app.use('/uploads', express.static(uploadsDir));

// ─── Mount Routes ───────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/employees', authenticate, employeeRoutes);
app.use('/api/attendance', authenticate, attendanceRoutes);
app.use('/api/leave', authenticate, leaveRoutes);
app.use('/api/payroll', authenticate, payrollRoutes);

// ─── Health check ───────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`HRMS API server running on port ${PORT}`);
});

export default app;
