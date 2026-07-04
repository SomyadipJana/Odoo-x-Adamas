import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import db from '../db/schema.js';

const router = Router();

// ─── Multer config for profile picture uploads ──────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'server', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed.'));
    }
  },
});

// ─── GET / — List employees ─────────────────────────────────────────────────

router.get('/', authenticate, (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin: return all employees with user data
      const employees = db.prepare(`
        SELECT e.*, u.email, u.employee_id, u.role
        FROM employees e
        JOIN users u ON u.id = e.user_id
        ORDER BY e.id
      `).all();

      res.json({ employees });
    } else {
      // Employee: return only self
      const employee = db.prepare(`
        SELECT e.*, u.email, u.employee_id, u.role
        FROM employees e
        JOIN users u ON u.id = e.user_id
        WHERE e.id = ?
      `).get(req.user.employeeId);

      res.json({ employees: employee ? [employee] : [] });
    }
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /:id — Get single employee ────────────────────────────────────────

router.get('/:id', authenticate, (req, res) => {
  try {
    const empId = parseInt(req.params.id);

    // Employees can only view themselves
    if (req.user.role !== 'admin' && req.user.employeeId !== empId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const employee = db.prepare(`
      SELECT e.*, u.email, u.employee_id, u.role
      FROM employees e
      JOIN users u ON u.id = e.user_id
      WHERE e.id = ?
    `).get(empId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    res.json({ employee });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PUT /:id — Update employee ─────────────────────────────────────────────

router.put('/:id', authenticate, (req, res) => {
  try {
    const empId = parseInt(req.params.id);

    // Employees can only edit themselves
    if (req.user.role !== 'admin' && req.user.employeeId !== empId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Check employee exists
    const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(empId);
    if (!existing) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const { first_name, last_name, phone, address, department, designation, join_date, profile_picture } = req.body;

    if (req.user.role === 'admin') {
      // Admin can edit all fields
      db.prepare(`
        UPDATE employees SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          department = COALESCE(?, department),
          designation = COALESCE(?, designation),
          join_date = COALESCE(?, join_date),
          profile_picture = COALESCE(?, profile_picture)
        WHERE id = ?
      `).run(
        first_name || null, last_name || null,
        phone || null, address || null,
        department || null, designation || null,
        join_date || null, profile_picture || null,
        empId
      );
    } else {
      // Employee can only edit phone, address, profile_picture
      db.prepare(`
        UPDATE employees SET
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          profile_picture = COALESCE(?, profile_picture)
        WHERE id = ?
      `).run(phone || null, address || null, profile_picture || null, empId);
    }

    // Return updated employee
    const updated = db.prepare(`
      SELECT e.*, u.email, u.employee_id, u.role
      FROM employees e
      JOIN users u ON u.id = e.user_id
      WHERE e.id = ?
    `).get(empId);

    res.json({ employee: updated });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── POST /:id/picture — Upload profile picture ────────────────────────────

router.post('/:id/picture', authenticate, upload.single('profile_picture'), (req, res) => {
  try {
    const empId = parseInt(req.params.id);

    // Employees can only upload for themselves
    if (req.user.role !== 'admin' && req.user.employeeId !== empId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const filename = req.file.filename;

    // Save filename to employee record
    db.prepare('UPDATE employees SET profile_picture = ? WHERE id = ?').run(filename, empId);

    res.json({
      message: 'Profile picture uploaded successfully.',
      filename,
    });
  } catch (error) {
    console.error('Upload picture error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
