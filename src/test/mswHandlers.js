import { http, HttpResponse } from 'msw';

const mockChatCompletionResponse = {
  id: 'chatcmpl-mock123',
  object: 'chat.completion',
  created: 1700000000,
  model: 'gpt-4o',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'This is a mock AI response.',
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 8,
    total_tokens: 18,
  },
};

export const handlers = [
  // OpenAI chat completions endpoint
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json(mockChatCompletionResponse);
  }),

  // Groq chat completions endpoint
  http.post('https://api.groq.com/openai/v1/chat/completions', () => {
    return HttpResponse.json({
      ...mockChatCompletionResponse,
      id: 'chatcmpl-groq-mock123',
      model: 'llama-3-70b',
    });
  }),
];
