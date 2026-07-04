import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import db from '../db/schema.js';

const router = Router();

// ─── POST /check-in ─────────────────────────────────────────────────────────

router.post('/check-in', authenticate, (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const now = new Date().toISOString(); // Full ISO datetime

    // Check if already checked in today
    const existing = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?'
    ).get(employeeId, today);

    if (existing && existing.check_in) {
      return res.status(400).json({ error: 'Already checked in today.', record: existing });
    }

    if (existing) {
      // Update existing record (e.g., status was pre-set)
      db.prepare(
        'UPDATE attendance SET check_in = ?, status = ? WHERE id = ?'
      ).run(now, 'present', existing.id);
    } else {
      // Insert new attendance record
      db.prepare(
        'INSERT INTO attendance (employee_id, date, check_in, status) VALUES (?, ?, ?, ?)'
      ).run(employeeId, today, now, 'present');
    }

    const record = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?'
    ).get(employeeId, today);

    res.json({ message: 'Checked in successfully.', record });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /check-out ────────────────────────────────────────────────────────

router.post('/check-out', authenticate, (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const existing = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?'
    ).get(employeeId, today);

    if (!existing || !existing.check_in) {
      return res.status(400).json({ error: 'No check-in record found for today. Please check in first.' });
    }

    if (existing.check_out) {
      return res.status(400).json({ error: 'Already checked out today.', record: existing });
    }

    db.prepare(
      'UPDATE attendance SET check_out = ? WHERE id = ?'
    ).run(now, existing.id);

    const record = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?'
    ).get(employeeId, today);

    res.json({ message: 'Checked out successfully.', record });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /today ─────────────────────────────────────────────────────────────

router.get('/today', authenticate, (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const today = new Date().toISOString().split('T')[0];

    const record = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?'
    ).get(employeeId, today);

    res.json({ record: record || null });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /daily?date=YYYY-MM-DD ─────────────────────────────────────────────

router.get('/daily', authenticate, (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD).' });
    }

    if (req.user.role === 'admin') {
      const records = db.prepare(`
        SELECT a.*, e.first_name, e.last_name, u.employee_id as emp_code
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        JOIN users u ON u.id = e.user_id
        WHERE a.date = ?
        ORDER BY a.employee_id
      `).all(date);

      res.json({ records });
    } else {
      const records = db.prepare(
        'SELECT * FROM attendance WHERE employee_id = ? AND date = ?'
      ).all(req.user.employeeId, date);

      res.json({ records });
    }
  } catch (error) {
    console.error('Get daily attendance error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /weekly?start=YYYY-MM-DD&end=YYYY-MM-DD ───────────────────────────

router.get('/weekly', authenticate, (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters are required (YYYY-MM-DD).' });
    }

    if (req.user.role === 'admin') {
      const records = db.prepare(`
        SELECT a.*, e.first_name, e.last_name, u.employee_id as emp_code
        FROM attendance a
        JOIN employees e ON e.id = a.employee_id
        JOIN users u ON u.id = e.user_id
        WHERE a.date BETWEEN ? AND ?
        ORDER BY a.date, a.employee_id
      `).all(start, end);

      res.json({ records });
    } else {
      const records = db.prepare(
        'SELECT * FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ?'
      ).all(req.user.employeeId, start, end);

      res.json({ records });
    }
  } catch (error) {
    console.error('Get weekly attendance error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /monthly/:empId?month=M&year=Y ────────────────────────────────────

router.get('/monthly/:empId', authenticate, (req, res) => {
  try {
    const empId = parseInt(req.params.empId);
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'month and year query parameters are required.' });
    }

    // Employees can only query their own attendance
    if (req.user.role !== 'admin' && req.user.employeeId !== empId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Build date range for the month
    const m = String(month).padStart(2, '0');
    const startDate = `${year}-${m}-01`;

    // Compute last day of month
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;

    const records = db.prepare(
      'SELECT * FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? ORDER BY date'
    ).all(empId, startDate, endDate);

    res.json({ records });
  } catch (error) {
    console.error('Get monthly attendance error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
