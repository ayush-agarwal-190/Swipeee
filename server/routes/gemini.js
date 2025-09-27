// server/routes/gemini.js
const express = require('express');
const fetch = require('node-fetch'); // or global fetch on newer node versions
const router = express.Router();
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // set in server/.env

// Example endpoint: validate candidate answer (prompt engineering)
// We'll send the question + candidate answer and ask Gemini to score (0-10) + short reasoning + JSON-safe output.
router.post('/validate', async (req, res) => {
  const { question, answer, role = 'Full Stack (React/Node)' } = req.body;
  if (!question || typeof answer === 'undefined') {
    return res.status(400).json({ error: 'question and answer are required' });
  }

  try {
    const prompt = `
You are an interviewer for a ${role} role. Evaluate the candidate's answer to the following question.
Return a JSON object with keys: score (0-10 integer), feedback (one-sentence), detail (2-3 sentence reasoning).
Question: """${question}"""
Candidate Answer: """${answer}"""
Return only JSON.
`;

    // Using Gemini REST generate endpoint (quickstart from Google). Adapt model name as needed.
    const resp = await fetch('https://api.ai.google/v1/generateText?model=gemini-1.5', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        // depending on SDK/endpoint shape you may need to use generateContent or 'instances' -- this is a generic REST example
        maxOutputTokens: 250
      })
    });

    const data = await resp.json();

    // Try to parse JSON from response text (Gemini can be instructed to return JSON).
    const text = (data?.candidate || data?.output || (data?.results && data.results[0]?.content) || JSON.stringify(data));
    // If text contains JSON: parse
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) {
      // fallback: return raw text
      return res.json({ raw: text, debug: data });
    }

    return res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gemini request failed', details: err.message });
  }
});

module.exports = router;
