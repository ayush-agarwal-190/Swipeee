// server/routes/gemini.js - Fixed Gemini API integration
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/validate', async (req, res) => {
  const { question, answer, role = 'Full Stack (React/Node)' } = req.body;
  
  if (!question || typeof answer === 'undefined') {
    return res.status(400).json({ error: 'question and answer are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an experienced technical interviewer for a ${role} position. 
Evaluate the candidate's answer below and provide a JSON response with:
- score (0-10 integer): Based on accuracy, completeness, and relevance
- feedback (short one-sentence evaluation)
- detail (2-3 sentence detailed reasoning)
- correct (boolean): Whether the answer is fundamentally correct)

Question: """${question}"""
Candidate's Answer: """${answer}"""

Return ONLY valid JSON format:
{
  "score": number,
  "feedback": "string",
  "detail": "string",
  "correct": boolean
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean the response text
    const cleanedText = text.replace(/```json|```/g, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', cleanedText);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        raw: cleanedText 
      });
    }

    res.json(parsed);
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ 
      error: 'Gemini request failed', 
      details: err.message 
    });
  }
});

module.exports = router;