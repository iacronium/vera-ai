const express = require('express');
const db = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { authenticateToken } = require('../middleware/auth');

// --- Leads ---
router.get('/leads', authenticateToken, (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads WHERE userId = ? ORDER BY timestamp DESC').all(req.user.id);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leads', authenticateToken, (req, res) => {
  const { name, email, status } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO leads (userId, name, email, status) VALUES (?, ?, ?, ?)');
    const info = stmt.run(req.user.id, name, email, status || 'nuevo');
    res.status(201).json({ id: info.lastInsertRowid, name, email, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Metrics ---
router.get('/metrics', authenticateToken, (req, res) => {
  try {
    const metrics = db.prepare('SELECT * FROM metrics WHERE userId = ? ORDER BY timestamp DESC LIMIT 1').get(req.user.id);
    if (metrics) {
      // Transform database format to frontend format
      const result = {
        totalInteractions: metrics.totalInteractions || 0,
        conversionRate: metrics.conversionRate || 0,
        avgSessionTime: metrics.avgSessionTime || 0,
        sentimentDistribution: {
          positive: metrics.sentimentPositive || 0,
          neutral: metrics.sentimentNeutral || 0,
          negative: metrics.sentimentNegative || 0
        }
      };
      res.json(result);
    } else {
      res.json({ 
        totalInteractions: 0, 
        conversionRate: 0, 
        avgSessionTime: 0,
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/metrics', authenticateToken, (req, res) => {
  const { totalInteractions, conversionRate, avgSessionTime, sentimentDistribution } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO metrics (userId, totalInteractions, conversionRate, avgSessionTime, sentimentPositive, sentimentNeutral, sentimentNegative) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const positive = sentimentDistribution?.positive || 0;
    const neutral = sentimentDistribution?.neutral || 0;
    const negative = sentimentDistribution?.negative || 0;
    
    stmt.run(req.user.id, totalInteractions, conversionRate, avgSessionTime, positive, neutral, negative);
    res.status(201).json({ message: 'Metrics updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
