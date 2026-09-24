import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Import database (triggers schema creation & seeding)
import db from './db/schema.js';

// Global crash logging
process.on('uncaughtException', (err) => {
  fs.appendFileSync(path.join(process.cwd(), 'crash.log'), `UNCAUGHT EXCEPTION: ${err.stack}\n`);
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  fs.appendFileSync(path.join(process.cwd(), 'crash.log'), `UNHANDLED REJECTION: ${reason}\n`);
});

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
// Global error handler
app.use((err, req, res, next) => {
  console.error('Express global error:', err);
  res.status(500).json({ error: 'Express Global Error: ' + err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`HRMS API server running on port ${PORT}`);
});

export default app;
