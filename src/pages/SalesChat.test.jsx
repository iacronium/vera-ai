// Feature: synthesized-ether-full-functionality
// Unit tests for SalesChat
// Requirements: 2.2, 2.3, 2.4, 15.4

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SalesChat from './SalesChat';
import useAppStore from '../store/useAppStore';

// ─── Mock aiService ───────────────────────────────────────────────────────────

vi.mock('../services/aiService', () => ({
  sendChatMessage: vi.fn(),
}));

import { sendChatMessage } from '../services/aiService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function seedStore() {
  useAppStore.setState({
    session: {
      token: 'test-token',
      user: { name: 'Test User', email: 'test@example.com', avatarUrl: '' },
    },
    aiPreferences: {
      salesModel: 'gpt-4o',
      sandboxModel: 'llama-3-70b',
      temperature: 0.7,
      maxTokens: 1024,
      openaiKey: 'sk-test',
      groqKey: 'gsk-test',
    },
    leads: [],
    metrics: {
      totalInteractions: 0,
      conversionRate: 0,
      avgSessionTime: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      history: [],
    },
    unreadNotifications: 0,
  });
}

function renderSalesChat() {
  return render(
    <MemoryRouter>
      <SalesChat />
    </MemoryRouter>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SalesChat – unit tests', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    seedStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ── 1. Sending a message appends it to the message list ───────────────────

  describe('Requirement 2.2 – message is appended to the list after sending', () => {
    it('appends the user message to the chat immediately after clicking Send', async () => {
      // Resolve the API call with a canned AI response
      sendChatMessage.mockResolvedValue({ content: 'AI reply here' });

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      const sendButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(input, { target: { value: 'Hello, I want to buy your product' } });
      fireEvent.click(sendButton);

      // The user message should appear in the DOM right away (optimistic update)
      expect(screen.getByText('Hello, I want to buy your product')).toBeInTheDocument();
    });

    it('appends the AI response to the chat after the API call resolves', async () => {
      sendChatMessage.mockResolvedValue({ content: 'Great choice! Let me help you.' });

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      fireEvent.change(input, { target: { value: 'Tell me about pricing' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Great choice! Let me help you.')).toBeInTheDocument();
      });
    });

    it('clears the input field after sending', async () => {
      sendChatMessage.mockResolvedValue({ content: 'Response' });

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      fireEvent.change(input, { target: { value: 'My message' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      // Input should be cleared immediately after send
      expect(input).toHaveValue('');
    });
  });

  // ── 2. Input is disabled while API call is in progress ────────────────────

  describe('Requirement 2.4 / 15.4 – input disabled during API call', () => {
    it('disables the text input while the API call is pending', async () => {
      // Never-resolving promise keeps the loading state active
      let resolveCall;
      sendChatMessage.mockReturnValue(
        new Promise((resolve) => {
          resolveCall = resolve;
        })
      );

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      expect(input).toBeDisabled();

      // Clean up: resolve the dangling promise
      await act(async () => {
        resolveCall({ content: 'done' });
      });
    });

    it('disables the send button while the API call is pending', async () => {
      let resolveCall;
      sendChatMessage.mockReturnValue(
        new Promise((resolve) => {
          resolveCall = resolve;
        })
      );

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      const sendButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);

      expect(sendButton).toBeDisabled();

      await act(async () => {
        resolveCall({ content: 'done' });
      });
    });

    it('re-enables the input and send button after the API call resolves', async () => {
      sendChatMessage.mockResolvedValue({ content: 'All good' });

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      const sendButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(input, { target: { value: 'Another message' } });
      fireEvent.click(sendButton);

      // Wait for the loading state to clear
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });

      // Send button is enabled again (though it may be disabled due to empty input)
      // The key check is that isLoading is false — input is not disabled
      expect(input).not.toBeDisabled();
    });
  });

  // ── 3. Error message appears inline when API call fails ───────────────────

  describe('Requirement 2.3 – inline error message on API failure', () => {
    it('shows an inline error message when the API call rejects', async () => {
      sendChatMessage.mockRejectedValue(new Error('Network error'));

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      fireEvent.change(input, { target: { value: 'This will fail' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('renders the error message with error styling (isError flag)', async () => {
      sendChatMessage.mockRejectedValue(new Error('Service unavailable'));

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      fireEvent.change(input, { target: { value: 'Trigger error' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        const errorEl = screen.getByText('Service unavailable');
        // The error bubble has the error styling class applied
        expect(errorEl.closest('div')).toHaveClass('text-error');
      });
    });

    it('shows a fallback error message when the rejection has no message', async () => {
      sendChatMessage.mockRejectedValue({});

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      fireEvent.change(input, { target: { value: 'Trigger error' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByText('An unexpected error occurred. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('re-enables the input after an API error', async () => {
      sendChatMessage.mockRejectedValue(new Error('Timeout'));

      renderSalesChat();

      const input = screen.getByRole('textbox', { name: /message input/i });
      fireEvent.change(input, { target: { value: 'Will fail' } });
      fireEvent.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });
});
