import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

// Open/create the database
const dbPath = path.join(process.cwd(), 'server', 'db', 'hrms.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Table Creation ─────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('admin','employee')),
    is_verified INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    department TEXT,
    designation TEXT,
    join_date TEXT,
    profile_picture TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    check_in TEXT,
    check_out TEXT,
    status TEXT DEFAULT 'present' CHECK(status IN ('present','absent','half-day','leave')),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE(employee_id, date)
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL CHECK(leave_type IN ('paid','sick','unpaid')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    remarks TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    admin_comment TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
  );

  CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    basic_salary REAL DEFAULT 0,
    hra REAL DEFAULT 0,
    da REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    net_salary REAL DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE(employee_id, month, year)
  );
`);

// ─── Seed Data ──────────────────────────────────────────────────────────────

const { count } = db.prepare('SELECT COUNT(*) as count FROM users').get();

if (count === 0) {
  console.log('Seeding database with initial data...');

  const insertUser = db.prepare(
    'INSERT INTO users (employee_id, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  const insertEmployee = db.prepare(
    'INSERT INTO employees (user_id, first_name, last_name, phone, address, department, designation, join_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertAttendance = db.prepare(
    'INSERT INTO attendance (employee_id, date, check_in, check_out, status) VALUES (?, ?, ?, ?, ?)'
  );
  const insertPayroll = db.prepare(
    'INSERT INTO payroll (employee_id, basic_salary, hra, da, deductions, net_salary, month, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertLeave = db.prepare(
    'INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks, status, admin_comment) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  // Hash passwords
  const adminHash = bcrypt.hashSync('Admin@123', 10);
  const employeeHash = bcrypt.hashSync('Employee@123', 10);

  // ── Users & Employees ───────────────────────────────────────────────────

  const seedTransaction = db.transaction(() => {
    // Admin
    const adminUser = insertUser.run('ADMIN001', 'admin@hrms.com', adminHash, 'admin');
    insertEmployee.run(
      adminUser.lastInsertRowid,
      'Rajesh', 'Kumar',
      '+91-9876543210', '123 MG Road, New Delhi',
      'Management', 'HR Director', '2022-01-15'
    );

    // Employee 1 - Priya Sharma
    const emp1 = insertUser.run('EMP001', 'priya@hrms.com', employeeHash, 'employee');
    insertEmployee.run(
      emp1.lastInsertRowid,
      'Priya', 'Sharma',
      '+91-9876543211', '456 Park Street, Mumbai',
      'Engineering', 'Software Engineer', '2023-03-10'
    );

    // Employee 2 - Amit Patel
    const emp2 = insertUser.run('EMP002', 'amit@hrms.com', employeeHash, 'employee');
    insertEmployee.run(
      emp2.lastInsertRowid,
      'Amit', 'Patel',
      '+91-9876543212', '789 Brigade Road, Bangalore',
      'Marketing', 'Marketing Manager', '2023-06-22'
    );

    // Employee 3 - Sneha Verma
    const emp3 = insertUser.run('EMP003', 'sneha@hrms.com', employeeHash, 'employee');
    insertEmployee.run(
      emp3.lastInsertRowid,
      'Sneha', 'Verma',
      '+91-9876543213', '321 Anna Salai, Chennai',
      'Design', 'UI/UX Designer', '2023-09-01'
    );

    // Employee 4 - Rahul Singh
    const emp4 = insertUser.run('EMP004', 'rahul@hrms.com', employeeHash, 'employee');
    insertEmployee.run(
      emp4.lastInsertRowid,
      'Rahul', 'Singh',
      '+91-9876543214', '654 Salt Lake, Kolkata',
      'Engineering', 'Backend Developer', '2024-01-15'
    );

    // Employee 5 - Ananya Gupta
    const emp5 = insertUser.run('EMP005', 'ananya@hrms.com', employeeHash, 'employee');
    insertEmployee.run(
      emp5.lastInsertRowid,
      'Ananya', 'Gupta',
      '+91-9876543215', '987 Banjara Hills, Hyderabad',
      'Finance', 'Financial Analyst', '2024-04-01'
    );

    // ── Attendance (last 30 days, weekdays only) ────────────────────────────

    // All employee IDs (in the employees table): 1=admin, 2-6=employees
    const allEmployeeIds = [1, 2, 3, 4, 5, 6];

    // Seed a simple pseudo-random based on employee id to pick absent days
    const today = new Date();
    for (const empId of allEmployeeIds) {
      // Pick 2-3 random weekday indices to mark as absent
      const absentDayOffsets = new Set();
      // Use a simple deterministic approach per employee
      absentDayOffsets.add(3 + empId);      // e.g., day offset 4-9
      absentDayOffsets.add(10 + empId * 2);  // e.g., day offset 12-22
      if (empId % 2 === 0) {
        absentDayOffsets.add(20 + empId);    // 3rd absent day for even IDs
      }

      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const d = new Date(today);
        d.setDate(d.getDate() - dayOffset);

        // Skip weekends (0 = Sunday, 6 = Saturday)
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

        if (absentDayOffsets.has(dayOffset)) {
          // Mark as absent — no check-in/check-out
          insertAttendance.run(empId, dateStr, null, null, 'absent');
        } else {
          // Generate reasonable check-in (8:30 - 9:30) and check-out (5:00 - 6:30)
          const checkInHour = 8;
          const checkInMinute = 30 + ((empId * 7 + dayOffset * 3) % 60); // 30-89 → clamp
          const ciMin = Math.min(checkInMinute, 30 + 60); // max 9:30
          const actualCiMin = 30 + ((empId * 7 + dayOffset * 3) % 61); // 0-60 → 8:30-9:30
          const ciH = 8 + Math.floor(actualCiMin / 60);
          const ciM = actualCiMin % 60;

          const checkOutBase = 300 + ((empId * 11 + dayOffset * 5) % 91); // 300-390 minutes after noon = 5:00 - 6:30 PM
          const coH = 17 + Math.floor((checkOutBase - 300) / 60);
          const coM = (checkOutBase - 300) % 60;

          const checkIn = `${dateStr}T${String(ciH).padStart(2, '0')}:${String(ciM).padStart(2, '0')}:00`;
          const checkOut = `${dateStr}T${String(coH).padStart(2, '0')}:${String(coM).padStart(2, '0')}:00`;

          insertAttendance.run(empId, dateStr, checkIn, checkOut, 'present');
        }
      }
    }

    // ── Payroll ───────────────────────────────────────────────────────────────

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Payroll config per employee id
    const payrollData = {
      1: { basic: 80000, hra: 32000, da: 16000, deductions: 12000 },  // Admin
      2: { basic: 65000, hra: 26000, da: 13000, deductions: 10000 },  // Priya - Engineering
      3: { basic: 55000, hra: 22000, da: 11000, deductions: 8000 },   // Amit - Marketing
      4: { basic: 60000, hra: 24000, da: 12000, deductions: 9000 },   // Sneha - Design
      5: { basic: 65000, hra: 26000, da: 13000, deductions: 10000 },  // Rahul - Engineering
      6: { basic: 50000, hra: 20000, da: 10000, deductions: 7500 },   // Ananya - Finance
    };

    for (const empId of allEmployeeIds) {
      const p = payrollData[empId];
      const net = p.basic + p.hra + p.da - p.deductions;

      // Current month
      insertPayroll.run(empId, p.basic, p.hra, p.da, p.deductions, net, currentMonth, currentYear);
      // Last month
      insertPayroll.run(empId, p.basic, p.hra, p.da, p.deductions, net, lastMonth, lastMonthYear);
    }

    // ── Leave Requests ────────────────────────────────────────────────────────

    // Pending leave - Priya (empId=2)
    insertLeave.run(2, 'paid', '2026-07-10', '2026-07-12', 'Family function', 'pending', null);

    // Approved leave - Amit (empId=3)
    insertLeave.run(3, 'sick', '2026-06-20', '2026-06-21', 'Fever and cold', 'approved', 'Get well soon. Approved.');

    // Rejected leave - Sneha (empId=4)
    insertLeave.run(4, 'unpaid', '2026-07-01', '2026-07-05', 'Personal trip', 'rejected', 'Cannot approve during project deadline.');
  });

  seedTransaction();
  console.log('Database seeded successfully.');
}

export default db;
