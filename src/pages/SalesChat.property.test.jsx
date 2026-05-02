// Feature: synthesized-ether-full-functionality, Property 6: SalesChat disables input during API call

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalesChat from './SalesChat';
import useAppStore from '../store/useAppStore';

/**
 * Validates: Requirements 2.4, 15.4
 *
 * Property 6: SalesChat disables input during API call
 * For any user message sent while an API call is in progress, the input field
 * and send button remain disabled until the call resolves or rejects.
 */

// Mock aiService so we can control when the promise resolves
vi.mock('../services/aiService', () => ({
  sendChatMessage: vi.fn(),
}));

import { sendChatMessage } from '../services/aiService';

// Helper: render SalesChat with a seeded session in the store
function renderSalesChat() {
  useAppStore.setState({
    session: { token: 'test-token', user: { name: 'Test', email: 'test@example.com', avatarUrl: '' } },
    aiPreferences: {
      salesModel: 'gpt-4o',
      sandboxModel: 'llama-3-70b',
      temperature: 0.7,
      maxTokens: 1024,
      openaiKey: 'sk-test',
      groqKey: 'gsk-test',
    },
  });

  return render(
    <MemoryRouter>
      <SalesChat />
    </MemoryRouter>
  );
}

describe('SalesChat – property-based tests', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('Property 6: input and send button are disabled while an API call is in progress', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary non-empty message strings
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        (message) => {
          // Each run gets a fresh never-resolving promise so the loading state persists
          let resolveCall;
          const neverResolving = new Promise((resolve) => {
            resolveCall = resolve; // keep reference so we can clean up after
          });
          sendChatMessage.mockReturnValue(neverResolving);

          const { unmount } = renderSalesChat();

          const input = screen.getByRole('textbox', { name: /message input/i });
          const sendButton = screen.getByRole('button', { name: /send message/i });

          // Type the generated message into the input
          act(() => {
            fireEvent.change(input, { target: { value: message } });
          });

          // Click send — this triggers the API call (which never resolves)
          act(() => {
            fireEvent.click(sendButton);
          });

          // While the API call is in progress, both input and send button must be disabled
          expect(input).toBeDisabled();
          expect(sendButton).toBeDisabled();

          // Resolve the dangling promise to avoid unhandled rejection warnings, then unmount
          resolveCall({ content: 'ok' });
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });
});
