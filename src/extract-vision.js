import { GoogleGenAI, Type } from "@google/genai";

// Categorical taxonomies. Open-ended where comparison breaks down (microcopy).
const ILLUSTRATION_STYLES = [
  "minimalist",
  "isometric-flat",
  "hand-drawn",
  "abstract-geometric",
  "photographic-overlay",
  "gradient-heavy",
  "data-viz",
  "3d-render",
  "none",
];

const PHOTOGRAPHY_MOODS = [
  "human-centric",
  "product-focused",
  "lifestyle",
  "tech-stock",
  "warm-natural",
  "cool-clinical",
  "bold-editorial",
  "documentary",
  "none",
];

const COPYWRITING_VOICES = [
  "confident-technical",
  "playful-casual",
  "direct-utilitarian",
  "authoritative-corporate",
  "inspirational",
  "minimalist-cryptic",
  "warm-friendly",
  "irreverent-edgy",
];

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    illustration_style: {
      type: Type.STRING,
      enum: ILLUSTRATION_STYLES,
      description: "Dominant illustration style on the page. 'none' if no illustrations.",
    },
    photography_mood: {
      type: Type.STRING,
      enum: PHOTOGRAPHY_MOODS,
      description: "Dominant photography mood. 'none' if no photography.",
    },
    copywriting_voice: {
      type: Type.STRING,
      enum: COPYWRITING_VOICES,
      description: "Dominant copywriting tone across hero, headers, and CTAs.",
    },
    microcopy_patterns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "2-4 specific microcopy observations (button labels, error phrasing, hero CTA word choice).",
    },
    notes: {
      type: Type.STRING,
      description: "1-2 sentence summary of the visual identity beyond CSS.",
    },
  },
  required: [
    "illustration_style",
    "photography_mood",
    "copywriting_voice",
    "microcopy_patterns",
    "notes",
  ],
};

const PROMPT = `You analyze a website's visual brand identity beyond what CSS alone exposes.

Given a screenshot of a homepage and scraped page text, identify:
- illustration_style: dominant style of illustrations (or "none")
- photography_mood: dominant photography style (or "none")
- copywriting_voice: tone across the page
- microcopy_patterns: 2-4 specific button/CTA/error label observations (e.g., "uses 'Get started' instead of 'Sign up'", "error messages explain WHY")
- notes: 1-2 sentences summarizing the visual identity beyond CSS tokens

Be specific. Avoid generic adjectives.`;

export async function extractVision({ screenshotBase64, pageText, apiKey }) {
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: screenshotBase64,
            },
          },
          { text: `${PROMPT}\n\nScraped page text (selected headers + CTAs):\n${pageText}` },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned empty response");
  }
  return JSON.parse(text);
}
