import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS not allowed'));
    },
  })
);
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Database connection failed' });
  }
});

// ==================== USER ROUTES ====================

// Register new user
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, username, password, phone, id } = req.body;
    
    // Check if email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR id = ?',
      [email, id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email or Staff ID already registered' });
    }
    
    await pool.execute(
      'INSERT INTO users (id, email, username, password, phone) VALUES (?, ?, ?, ?, ?)',
      [id, email, username, password, phone]
    );
    
    res.json({ message: 'User registered successfully', userId: id });
  } catch (error) {
    console.error('Error registering user:  server_new.js:35 - server.js:35', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { id, password, role } = req.body;
    
    if (role === 'staff') {
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND password = ?',
        [id, password]
      );
      
      if (users.length > 0) {
        return res.json({ 
          success: true, 
          user: users[0],
          role: 'staff'
        });
      }
    } else if (role === 'admin') {
      // Hardcoded admin credentials (no registration required)
      if (id === 'admin' && password === 'admin123') {
        return res.json({ 
          success: true, 
          user: {
            id: 'admin',
            name: 'Admin',
            email: 'admin@xerox.com',
            department: 'Admin',
            role: 'admin'
          },
          role: 'admin'
        });
      }
      
      // Also check database for admin users
      const [admins] = await pool.execute(
        'SELECT * FROM users WHERE id = ? AND password = ? AND role = "admin"',
        [id, password]
      );
      
      if (admins.length > 0) {
        return res.json({ 
          success: true, 
          user: admins[0],
          role: 'admin'
        });
      }
    }
    
    res.status(401).json({ error: 'Invalid ID or Password' });
  } catch (error) {
    console.error('Error logging in:  server_new.js:91 - server.js:91', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:  server_new.js:102 - server.js:102', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:  server_new.js:121 - server.js:121', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user password
app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { password } = req.body;
    
    await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [password, req.params.id]
    );
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:  server_new.js:138 - server.js:138', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;
    
    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, department = ? WHERE id = ?',
      [name, email, phone, department, req.params.id]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:  server_new.js:155 - server.js:155', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==================== PRINT JOB ROUTES ====================

// Create print job
app.post('/api/print-jobs', async (req, res) => {
  try {
    const { userName, userId, printType, orientation, color, copies, pages, fileName } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO print_jobs (user_name, user_id, print_type, orientation, color, copies, pages, file_name, date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'Pending')`,
      [userName, userId, printType, orientation, color, copies, pages, fileName]
    );
    
    res.json({ message: 'Print job submitted successfully', jobId: result.insertId });
  } catch (error) {
    console.error('Error creating print job:  server_new.js:175 - server.js:175', error);
    res.status(500).json({ error: 'Failed to create print job' });
  }
});

// Get all print jobs (for admin)
app.get('/api/print-jobs', async (req, res) => {
  try {
    const [jobs] = await pool.execute('SELECT * FROM print_jobs ORDER BY date DESC');
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching print jobs:  server_new.js:186 - server.js:186', error);
    res.status(500).json({ error: 'Failed to fetch print jobs' });
  }
});

// Get print jobs by user ID
app.get('/api/print-jobs/user/:userId', async (req, res) => {
  try {
    const [jobs] = await pool.execute(
      'SELECT * FROM print_jobs WHERE user_id = ? ORDER BY date DESC',
      [req.params.userId]
    );
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching print jobs:  server_new.js:200 - server.js:200', error);
    res.status(500).json({ error: 'Failed to fetch print jobs' });
  }
});

// Update print job status
app.put('/api/print-jobs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE print_jobs SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    res.json({ message: 'Print job status updated successfully' });
  } catch (error) {
    console.error('Error updating print job status:  server_new.js:217 - server.js:217', error);
    res.status(500).json({ error: 'Failed to update print job status' });
  }
});

// ==================== PAPER REQUEST ROUTES ====================

// Create paper request
app.post('/api/paper-requests', async (req, res) => {
  try {
    const { userName, userId, paperType, quantity } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO paper_requests (user_name, user_id, paper_type, quantity, date, status) 
       VALUES (?, ?, ?, ?, CURDATE(), 'Pending')`,
      [userName, userId, paperType, quantity]
    );
    
    res.json({ message: 'Paper request submitted successfully', requestId: result.insertId });
  } catch (error) {
    console.error('Error creating paper request:  server_new.js:237 - server.js:237', error);
    res.status(500).json({ error: 'Failed to create paper request' });
  }
});

// Get all paper requests (for admin)
app.get('/api/paper-requests', async (req, res) => {
  try {
    const [requests] = await pool.execute('SELECT * FROM paper_requests ORDER BY date DESC');
    res.json(requests);
  } catch (error) {
    console.error('Error fetching paper requests:  server_new.js:248 - server.js:248', error);
    res.status(500).json({ error: 'Failed to fetch paper requests' });
  }
});

// Get paper requests by user ID
app.get('/api/paper-requests/user/:userId', async (req, res) => {
  try {
    const [requests] = await pool.execute(
      'SELECT * FROM paper_requests WHERE user_id = ? ORDER BY date DESC',
      [req.params.userId]
    );
    res.json(requests);
  } catch (error) {
    console.error('Error fetching paper requests:  server_new.js:262 - server.js:262', error);
    res.status(500).json({ error: 'Failed to fetch paper requests' });
  }
});

// Update paper request status
app.put('/api/paper-requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    await pool.execute(
      'UPDATE paper_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    
    res.json({ message: 'Paper request status updated successfully' });
  } catch (error) {
    console.error('Error updating paper request status:  server_new.js:279 - server.js:279', error);
    res.status(500).json({ error: 'Failed to update paper request status' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
