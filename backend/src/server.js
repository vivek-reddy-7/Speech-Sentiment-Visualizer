import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  timeout: Number(process.env.API_TIMEOUT),
});

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * POST /process_text
 * Body: { text: string }
 * Response: { sentimentScore: number, keywords: string[] }
 */
app.post("/process_text", async (req, res) => {
  const { text } = req.body || {};

  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Missing or empty 'text' field" });
  }

  try {
    const prompt = `
            You are a sentiment and keyword analysis service.

            Analyze the following text and return STRICT JSON with this exact schema:
            {
            "sentimentScore": number between -1 and 1,
            "keywords": string[]
            }

            Text:
            """${text}"""
                `.trim();

    const groqResponse = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: "You output only JSON following the requested schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content =
      groqResponse.output_text ||
      groqResponse.output?.[0]?.content?.[1]?.text ||
      "{}";

    //reponse format check
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse model JSON:", e);
      return res.status(502).json({
        error: "Model did not return valid JSON",
        raw: content,
      });
    }

    const sentimentScore = Number(parsed.sentimentScore ?? 0);
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.map(String)
      : [];

    return res.json({
      sentimentScore,
      keywords,
    });
  } catch (err) {
    if (err instanceof OpenAI.APIConnectionTimeoutError) {
      console.error("OpenAI request timed out");
      return res.status(504).json({ error: "LLM provider timeout" });
    }

    console.error(
      "Error in /process_text:",
      err.response?.data || err.message || err
    );
    return res.status(500).json({
      error: "Failed to process text",
      details: err.response?.data || err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Sentiment detection backend listening on ${port}`);
});
