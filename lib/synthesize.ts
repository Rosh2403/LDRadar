import { GoogleGenerativeAI } from "@google/generative-ai";

export interface BriefingData {
  summary: string;
  patterns: string[];
  hotSectors: string[];
  activeLPs: string[];
  watchList: string[];
}

export async function synthesizeFindings(
  findings: Array<{
    institution: string;
    category: string;
    title: string;
    summary: string;
    date: string;
  }>
): Promise<BriefingData> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const findingsText = findings
    .map((f) => `[${f.institution} · ${f.category}] ${f.title}: ${f.summary}`)
    .join("\n");

  const prompt = `You are an institutional investor intelligence analyst. Here are ${findings.length} fresh findings scraped from major LPs and institutional investors:

${findingsText}

Analyze these findings and return JSON only (no markdown, no explanation):
{
  "summary": "2-3 sentence executive briefing on what is happening across institutional investors right now",
  "patterns": ["macro pattern 1", "macro pattern 2", "macro pattern 3"],
  "hotSectors": ["sector or theme getting increased LP attention"],
  "activeLPs": ["institution names that are most active or making moves"],
  "watchList": ["specific things fund managers should monitor closely based on these signals"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // fall through to default
  }

  return {
    summary: "Synthesis unavailable — check GEMINI_API_KEY.",
    patterns: [],
    hotSectors: [],
    activeLPs: [],
    watchList: [],
  };
}
