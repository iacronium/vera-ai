/**
 * calendarService.js
 * Wrappers over the backend Google Calendar API.
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Returns whether the current user has Google Calendar connected.
 */
export async function getCalendarStatus(token) {
  const res = await fetch(`${BACKEND_URL}/api/calendar/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { connected: false };
  return res.json();
}

/**
 * Opens a popup window to start the Google OAuth2 flow.
 * Resolves when the popup posts 'google-calendar-connected' or is closed.
 */
export function connectGoogleCalendar(token) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/calendar/auth-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { url } = await res.json();

      const popup = window.open(url, 'google-oauth', 'width=500,height=650');

      const handler = (e) => {
        if (e.data === 'google-calendar-connected') {
          window.removeEventListener('message', handler);
          clearInterval(timer);
          resolve(true);
        }
      };
      window.addEventListener('message', handler);

      // Fallback: detect popup closed manually
      const timer = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(timer);
          window.removeEventListener('message', handler);
          resolve(false);
        }
      }, 500);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Disconnects Google Calendar for the current user.
 */
export async function disconnectGoogleCalendar(token) {
  const res = await fetch(`${BACKEND_URL}/api/calendar/disconnect`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

/**
 * Creates a Google Calendar event.
 * @param {string} token - JWT auth token
 * @param {{ summary, description, startDateTime, endDateTime, attendeeEmail }} event
 */
export async function createCalendarEvent(token, event) {
  const res = await fetch(`${BACKEND_URL}/api/calendar/create-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(event),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear el evento.');
  }
  return res.json();
}
