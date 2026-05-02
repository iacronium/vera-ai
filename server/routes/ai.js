const express = require('express');
const router = express.Router();

const PROVIDER_URLS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
};

const { optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, async (req, res) => {
  const { provider, messages, model, temperature, maxTokens, apiKey: bodyApiKey } = req.body;
  const url = PROVIDER_URLS[provider];
  
  // Use key from body if provided (from frontend settings), otherwise fallback to server env
  const apiKey = bodyApiKey || (provider === 'openai' ? process.env.OPENAI_API_KEY : process.env.GROQ_API_KEY);

  if (!apiKey || apiKey === 'your_openai_key_here' || apiKey === 'your_groq_key_here') {
    return res.status(500).json({ error: `API Key for ${provider} not configured on server or in settings.` });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
