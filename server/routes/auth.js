import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/schema.js';
import { authenticate, generateToken } from '../middleware/auth.js';

const router = Router();

router.post('/signup', (req, res) => {
  try {
    const { employee_id, email, password, first_name, last_name, phone, address, department, designation, join_date } = req.body;

    // Validate required fields
    if (!employee_id || !email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'employee_id, email, password, first_name, and last_name are required.' });
    }

    // Check uniqueness of email
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    // Check uniqueness of employee_id
    const existingEmpId = db.prepare('SELECT id FROM users WHERE employee_id = ?').get(employee_id);
    if (existingEmpId) {
      return res.status(409).json({ error: 'Employee ID already exists.' });
    }

    // Hash password
    const password_hash = bcrypt.hashSync(password, 10);

    // Create user
    const userResult = db.prepare(
      'INSERT INTO users (employee_id, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(employee_id, email, password_hash, 'employee');

    const userId = Number(userResult.lastInsertRowid);

    // Create employee record
    const empResult = db.prepare(
      'INSERT INTO employees (user_id, first_name, last_name, phone, address, department, designation, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(userId, first_name, last_name, phone || null, address || null, department || null, designation || null, join_date || null);

    const employeeId = Number(empResult.lastInsertRowid);

    // Generate token
    const token = generateToken({
      id: userId,
      userId: userId,
      role: 'employee',
      employeeId: employeeId,
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        employeeId,
        email,
        role: 'employee',
        firstName: first_name,
        lastName: last_name,
        department: department || null,
        designation: designation || null,
        profilePicture: null,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

router.post('/signin', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Get employee details
    const employee = db.prepare('SELECT * FROM employees WHERE user_id = ?').get(user.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found.' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      userId: user.id,
      role: user.role,
      employeeId: employee.id,
    });

    res.json({
      token,
      user: {
        id: user.id,
        employeeId: employee.id,
        email: user.email,
        role: user.role,
        firstName: employee.first_name,
        lastName: employee.last_name,
        department: employee.department,
        designation: employee.designation,
        profilePicture: employee.profile_picture,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /me ─────────────────────────────────────────────────────────────────

router.get('/me', authenticate, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT 
        u.id, u.email, u.role, u.employee_id,
        e.id as employeeId, e.first_name, e.last_name,
        e.phone, e.address, e.department, e.designation,
        e.join_date, e.profile_picture
      FROM users u
      JOIN employees e ON e.user_id = u.id
      WHERE u.id = ?
    `).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        employeeCode: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        address: user.address,
        department: user.department,
        designation: user.designation,
        joinDate: user.join_date,
        profilePicture: user.profile_picture,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
