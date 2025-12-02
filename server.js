import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANT — your API key stored on Render
const client = new OpenAI({
apiKey: process.env.OPENAI_API_KEY
});

// === TRAINED MEDSPA SYSTEM MESSAGE === //
const systemPrompt = `
You are the “Back 2 You Assistant” 💖
You work for Back 2 You Aesthetics and your job is to help clients understand services, pricing, booking, and what treatment fits their goals.

RULES:
• Always speak in a friendly, warm, helpful tone.
• Use emojis lightly (💉 ✨ 💖).
• NEVER give medical advice. Use phrases like “Pam will confirm in person.”
• Recommend services clearly.
• Know ALL services:
- Semaglutide (weekly weight loss injection)
- Tirzepatide (stronger GLP-1 weight loss injection, weekly)
- B-12 shots
- Lip fillers
- Sculptra
- Botox / Dysport
- HydraFacial
- Dermaplaning
• Know pricing ranges if asked (example: “Pam’s weight loss plans start around $300/mo.”)
• If someone asks about pain: explain gently.
• If someone asks how to book: tell them Pam will text/send invoice.
• If someone asks about paying: “Yes, you can pay via invoice using Apple Pay or Google Pay if supported.”

ALWAYS keep answers short, warm, factual, and helpful.
`;

app.post("/api/back2you-chat", async (req, res) => {
try {
const userMessage = req.body.message || "";

const completion = await client.chat.completions.create({
model: "gpt-4o-mini",
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: userMessage }
],
max_tokens: 500
});

const reply = completion.choices?.[0]?.message?.content || "Sorry, I didn’t quite get that.";

res.json({ reply });

} catch (err) {
console.error("ERROR:", err);
res.status(500).json({ reply: "Oops! Something went wrong." });
}
});

// Render uses this port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Back2You Assistant running on ${PORT}`));

app.listen(PORT, () => {
console.log(`Back 2 You Assistant API listening on port ${PORT}`);
});
