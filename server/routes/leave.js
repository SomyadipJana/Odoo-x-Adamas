import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import db from '../db/schema.js';

const router = Router();

// ─── POST / — Apply for leave ───────────────────────────────────────────────

router.post('/', authenticate, (req, res) => {
  try {
    const { leave_type, start_date, end_date, remarks } = req.body;
    const employeeId = req.user.employeeId;

    if (!leave_type || !start_date || !end_date) {
      return res.status(400).json({ error: 'leave_type, start_date, and end_date are required.' });
    }

    // Validate leave_type
    if (!['paid', 'sick', 'unpaid'].includes(leave_type)) {
      return res.status(400).json({ error: 'leave_type must be one of: paid, sick, unpaid.' });
    }

    // Validate dates
    if (start_date > end_date) {
      return res.status(400).json({ error: 'start_date must be before or equal to end_date.' });
    }

    const result = db.prepare(
      'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks) VALUES (?, ?, ?, ?, ?)'
    ).run(employeeId, leave_type, start_date, end_date, remarks || null);

    const leaveRequest = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Leave request submitted.', leaveRequest });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /my — Get my leave requests ────────────────────────────────────────

router.get('/my', authenticate, (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const leaveRequests = db.prepare(
      'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC'
    ).all(employeeId);

    res.json({ leaveRequests });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /all — Admin: get all leave requests ──────────────────────────────

router.get('/all', authenticate, requireAdmin, (req, res) => {
  try {
    const leaveRequests = db.prepare(`
      SELECT lr.*, e.first_name, e.last_name, u.employee_id as emp_code
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN users u ON u.id = e.user_id
      ORDER BY lr.created_at DESC
    `).all();

    res.json({ leaveRequests });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PUT /:id/approve — Admin: approve leave ───────────────────────────────

router.put('/:id/approve', authenticate, requireAdmin, (req, res) => {
  try {
    const leaveId = parseInt(req.params.id);
    const { admin_comment } = req.body;

    // Find the leave request
    const leaveRequest = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ error: `Leave request is already ${leaveRequest.status}.` });
    }

    // Approve the leave
    db.prepare(
      'UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?'
    ).run('approved', admin_comment || null, leaveId);

    // Update attendance for each day in the leave range
    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);

    const upsertAttendance = db.prepare(`
      INSERT INTO attendance (employee_id, date, status)
      VALUES (?, ?, 'leave')
      ON CONFLICT(employee_id, date) DO UPDATE SET status = 'leave', check_in = NULL, check_out = NULL
    `);

    const updateTransaction = db.transaction(() => {
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        upsertAttendance.run(leaveRequest.employee_id, dateStr);
        current.setDate(current.getDate() + 1);
      }
    });

    updateTransaction();

    const updated = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId);

    res.json({ message: 'Leave request approved.', leaveRequest: updated });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PUT /:id/reject — Admin: reject leave ─────────────────────────────────

router.put('/:id/reject', authenticate, requireAdmin, (req, res) => {
  try {
    const leaveId = parseInt(req.params.id);
    const { admin_comment } = req.body;

    const leaveRequest = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId);
    if (!leaveRequest) {
      return res.status(404).json({ error: 'Leave request not found.' });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ error: `Leave request is already ${leaveRequest.status}.` });
    }

    db.prepare(
      'UPDATE leave_requests SET status = ?, admin_comment = ? WHERE id = ?'
    ).run('rejected', admin_comment || null, leaveId);

    const updated = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId);

    res.json({ message: 'Leave request rejected.', leaveRequest: updated });
  } catch (error) {
    console.error('Reject leave error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
