import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import db from '../db/schema.js';

const router = Router();

// ─── GET /my — Get my payroll records ───────────────────────────────────────

router.get('/my', authenticate, (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const payrolls = db.prepare(
      'SELECT * FROM payroll WHERE employee_id = ? ORDER BY year DESC, month DESC'
    ).all(employeeId);

    res.json({ payrolls });
  } catch (error) {
    console.error('Get my payroll error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── GET /all — Admin: get all payroll records ──────────────────────────────

router.get('/all', authenticate, requireAdmin, (req, res) => {
  try {
    const payrolls = db.prepare(`
      SELECT p.*, e.first_name, e.last_name, u.employee_id as emp_code, e.department, e.designation
      FROM payroll p
      JOIN employees e ON e.id = p.employee_id
      JOIN users u ON u.id = e.user_id
      ORDER BY p.year DESC, p.month DESC, e.first_name
    `).all();

    res.json({ payrolls });
  } catch (error) {
    console.error('Get all payroll error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── PUT /:empId — Admin: update/insert payroll record ──────────────────────

router.put('/:empId', authenticate, requireAdmin, (req, res) => {
  try {
    const empId = parseInt(req.params.empId);
    const { basic_salary, hra, da, deductions, month, year } = req.body;

    if (basic_salary == null || hra == null || da == null || deductions == null || !month || !year) {
      return res.status(400).json({ error: 'basic_salary, hra, da, deductions, month, and year are required.' });
    }

    // Verify employee exists
    const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(empId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Compute net salary
    const net_salary = parseFloat(basic_salary) + parseFloat(hra) + parseFloat(da) - parseFloat(deductions);

    // Insert or replace payroll record
    db.prepare(`
      INSERT INTO payroll (employee_id, basic_salary, hra, da, deductions, net_salary, month, year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(employee_id, month, year) DO UPDATE SET
        basic_salary = excluded.basic_salary,
        hra = excluded.hra,
        da = excluded.da,
        deductions = excluded.deductions,
        net_salary = excluded.net_salary
    `).run(empId, parseFloat(basic_salary), parseFloat(hra), parseFloat(da), parseFloat(deductions), net_salary, parseInt(month), parseInt(year));

    const payroll = db.prepare(
      'SELECT * FROM payroll WHERE employee_id = ? AND month = ? AND year = ?'
    ).get(empId, parseInt(month), parseInt(year));

    res.json({ message: 'Payroll record saved.', payroll });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
