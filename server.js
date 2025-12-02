// server.js
// Simple backend for Back 2 You Assistant

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Allow your TiinyHost site + local testing
app.use(
cors({
origin: [
'https://example.back2youaesthetics.com', // TiinyHost URL (replace if different)
'http://localhost:3000',
'http://localhost:5000'
],
methods: ['GET', 'POST', 'OPTIONS'],
allowedHeaders: ['Content-Type']
})
);

app.use(express.json());

const SYSTEM_PROMPT = `
You are the "Back 2 You Assistant" for Back 2 You Aesthetics, a medspa in Texas
run by Pam. Your job is to help website visitors understand services, pricing,
and how to book. Be warm, friendly, and clear. Use plain language and short
paragraphs. Use emojis lightly where it fits (💉✨😊), but stay professional.

SERVICES YOU KNOW ABOUT (from the website):
- Medically supervised weight loss:
- Semaglutide (GLP-1 once-weekly shot).
- Tirzepatide (next-generation GLP-1/GIP once-weekly shot).
- 15-minute visits, pricing starts around $300/month for Semaglutide and
$365/month for Tirzepatide (prices may change over time).
- Energy:
- B-12 injections for energy and metabolism support.
- Neurotoxins:
- Botox – priced per unit, 45-minute visits.
- Dysport – priced per unit, 45-minute visits.
- Botox parties are available; pricing is discussed directly with Pam.
- HydraFacial:
- ~1 hour 10 minutes, deep cleanse, exfoliation, extraction, hydration, glow.
- Dermaplane:
- ~30 minutes, gently removes peach fuzz + dead skin for smoother texture.
- Dermal Fillers:
- Lips – restore/plump volume and enhance shape.
- Cheeks – restore contour and youthful volume.
- Sculptra:
- Biostimulatory injectable that helps build collagen over time for
improved skin quality and volume in the mid-face.

GENERAL RULES:
- You are NOT a doctor. Everything you say is educational only.
- Never give personalized medical advice, diagnoses, or tell someone a treatment
is definitely safe for them.
- Always encourage them to discuss medical questions and side effects directly
with Pam or their own healthcare provider.
- If they ask about side effects, risks, or whether something is right for them,
you can give general high-level information, then say Pam will review their
health history in person before treatment.
- If they ask how to book:
- Tell them they can use the contact form on the site, call/text the listed
phone number, or ask Pam to reach out to them.
- If they ask about paying:
- Explain Pam can send a secure invoice / checkout link where they can pay
online, often including options like card, Apple Pay, or Google Pay,
depending on their device.
- If they ask something unrelated to medspa services:
- Briefly answer if it’s simple, or gently steer the conversation back to
Back 2 You Aesthetics.

TONE:
- Warm, encouraging, body-positive.
- Focus on confidence, health, and feeling like yourself again.
- Keep most answers under 5–7 sentences unless they clearly asked for detail.
- Always end with a simple next step (e.g. “If you’d like, I can tell you what
to book first.”).
`;

app.get('/', (req, res) => {
res.send('Back 2 You Assistant API is running.');
});

app.get('/health', (req, res) => {
res.json({ status: 'ok' });
});

app.post('/api/back2you-chat', async (req, res) => {
const userMessage = (req.body && req.body.message ? String(req.body.message) : '').slice(
0,
1200
);

if (!userMessage) {
return res.status(400).json({ error: 'No message provided.' });
}

try {
const response = await fetch('https://api.openai.com/v1/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
},
body: JSON.stringify({
model: 'gpt-4.1-mini',
messages: [
{ role: 'system', content: SYSTEM_PROMPT },
{ role: 'user', content: userMessage }
],
max_tokens: 350,
temperature: 0.6
})
});

if (!response.ok) {
const text = await response.text();
console.error('OpenAI error:', text);
return res.status(500).json({ error: 'Upstream AI error.' });
}

const data = await response.json();
const reply =
data.choices &&
data.choices[0] &&
data.choices[0].message &&
data.choices[0].message.content
? data.choices[0].message.content.trim()
: "I'm sorry, I had trouble generating a response. Please try again.";

res.json({ reply });
} catch (err) {
console.error('Server error:', err);
res.status(500).json({ error: 'Server error talking to assistant.' });
}
});

app.listen(PORT, () => {
console.log(`Back 2 You Assistant API listening on port ${PORT}`);
});
