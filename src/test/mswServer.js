import { setupServer } from 'msw/node';
import { handlers } from './mswHandlers.js';

// Set up the MSW server with the defined handlers.
// This server intercepts fetch calls during tests without real network requests.
export const server = setupServer(...handlers);
