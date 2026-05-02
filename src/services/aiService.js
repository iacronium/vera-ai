/**
 * aiService.js
 * Thin wrappers over our local backend proxy.
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Sends a chat completion request to our backend proxy.
 */
export async function sendChatMessage({ messages, model, temperature, maxTokens, provider, token, apiKey }) {
  const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      provider,
      messages,
      model,
      temperature,
      maxTokens,
      apiKey,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    // Groq returns { error: { message: '...', type: '...' } }
    // OpenAI returns { error: { message: '...' } }
    // Our backend returns { error: 'string' }
    const errMsg = typeof errorBody.error === 'string'
      ? errorBody.error
      : errorBody.error?.message || `Error ${response.status}`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new Error('Unexpected response shape from Backend.');
  }

  return { content };
}

/**
 * Sandbox wrapper (points to the same proxy but uses groq explicitly)
 */
export async function sendSandboxMessage({ messages, context, model, temperature, maxTokens, token, apiKey }) {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful assistant. Use the following document context to answer questions:\n\n${context}`,
  };

  const messagesWithContext = [systemMessage, ...messages];

  return sendChatMessage({
    messages: messagesWithContext,
    model,
    temperature,
    maxTokens,
    provider: 'groq',
    token,
    apiKey,
  });
}
