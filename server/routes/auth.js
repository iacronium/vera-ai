const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const { JWT_SECRET } = require('../middleware/auth');

// Registro de usuario
router.post('/register', async (req, res) => {
  const { email, password, agencyName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, agencyName) VALUES (?, ?, ?)');
    const info = stmt.run(email, hashedPassword, agencyName || 'My Agency');
    
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login de usuario (con auto-registro para demo)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    // Si el usuario no existe, lo creamos (Demo behavior)
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (email, password, agencyName) VALUES (?, ?, ?)');
      const info = stmt.run(email, hashedPassword, email.split('@')[0] + ' Agency');
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    } else {
      // Si existe, verificamos contraseña
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.agencyName,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
