async function run() {
  try {
    const res = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: 'EMP' + Date.now(), email: `test${Date.now()}@example.com`, password: 'Password123!', first_name: 'Test', last_name: 'User', role: 'employee' })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
run();
