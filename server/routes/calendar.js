const express = require('express');
const { google } = require('googleapis');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ─── OAuth2 Client ────────────────────────────────────────────────────────────

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retrieves stored Google tokens for a user from the DB.
 */
function getTokensForUser(userId) {
  const row = db.prepare(
    'SELECT google_tokens FROM users WHERE id = ?'
  ).get(userId);
  if (!row || !row.google_tokens) return null;
  try {
    return JSON.parse(row.google_tokens);
  } catch {
    return null;
  }
}

/**
 * Persists Google tokens for a user in the DB.
 */
function saveTokensForUser(userId, tokens) {
  db.prepare(
    'UPDATE users SET google_tokens = ? WHERE id = ?'
  ).run(JSON.stringify(tokens), userId);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/calendar/auth-url
 * Returns the Google OAuth2 authorization URL.
 */
router.get('/auth-url', authenticateToken, (req, res) => {
  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: String(req.user.id), // pass userId through OAuth flow
  });
  res.json({ url });
});

/**
 * GET /api/calendar/oauth/callback
 * Handles the OAuth2 redirect from Google, exchanges code for tokens.
 */
router.get('/oauth/callback', async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).send('Missing code or state.');
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    saveTokensForUser(Number(userId), tokens);
    // Close the popup / redirect to settings
    res.send(`
      <html><body>
        <script>
          window.opener && window.opener.postMessage('google-calendar-connected', '*');
          window.close();
        </script>
        <p>✅ Google Calendar conectado. Puedes cerrar esta ventana.</p>
      </body></html>
    `);
  } catch (err) {
    console.error('[calendar] OAuth callback error:', err.message);
    res.status(500).send('Error al conectar con Google Calendar.');
  }
});

/**
 * GET /api/calendar/status
 * Returns whether the current user has Google Calendar connected.
 */
router.get('/status', authenticateToken, (req, res) => {
  const tokens = getTokensForUser(req.user.id);
  res.json({ connected: !!tokens });
});

/**
 * POST /api/calendar/disconnect
 * Removes stored Google tokens for the current user.
 */
router.post('/disconnect', authenticateToken, (req, res) => {
  db.prepare('UPDATE users SET google_tokens = NULL WHERE id = ?').run(req.user.id);
  res.json({ success: true });
});

/**
 * POST /api/calendar/create-event
 * Creates a Google Calendar event for the authenticated user.
 *
 * Body: { summary, description, startDateTime, endDateTime, attendeeEmail }
 */
router.post('/create-event', authenticateToken, async (req, res) => {
  const { summary, description, startDateTime, endDateTime, attendeeEmail } = req.body;

  if (!summary || !startDateTime || !endDateTime) {
    return res.status(400).json({ error: 'summary, startDateTime y endDateTime son requeridos.' });
  }

  const tokens = getTokensForUser(req.user.id);
  if (!tokens) {
    return res.status(403).json({ error: 'Google Calendar no está conectado.' });
  }

  try {
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials(tokens);

    // Auto-refresh token if expired and persist new tokens
    oauth2Client.on('tokens', (newTokens) => {
      const merged = { ...tokens, ...newTokens };
      saveTokensForUser(req.user.id, merged);
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary,
      description: description || '',
      start: { dateTime: startDateTime, timeZone: 'America/Argentina/Buenos_Aires' },
      end:   { dateTime: endDateTime,   timeZone: 'America/Argentina/Buenos_Aires' },
      attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: attendeeEmail ? 'all' : 'none',
    });

    res.json({
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
    });
  } catch (err) {
    console.error('[calendar] create-event error:', err.message);
    res.status(500).json({ error: 'No se pudo crear el evento en Google Calendar.' });
  }
});

module.exports = router;
