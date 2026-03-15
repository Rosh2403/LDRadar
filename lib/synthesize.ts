import Anthropic from "@anthropic-ai/sdk";

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
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const findingsText = findings
    .map((f) => `[${f.institution} · ${f.category}] ${f.title}: ${f.summary}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an institutional investor intelligence analyst. Here are ${findings.length} fresh findings scraped from major LPs and institutional investors:

${findingsText}

Analyze these findings and return JSON only (no markdown, no explanation):
{
  "summary": "2-3 sentence executive briefing on what is happening across institutional investors right now",
  "patterns": ["macro pattern 1", "macro pattern 2", "macro pattern 3"],
  "hotSectors": ["sector or theme getting increased LP attention"],
  "activeLPs": ["institution names that are most active or making moves"],
  "watchList": ["specific things fund managers should monitor closely based on these signals"]
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // fall through to default
  }

  return {
    summary: "Synthesis unavailable — check ANTHROPIC_API_KEY.",
    patterns: [],
    hotSectors: [],
    activeLPs: [],
    watchList: [],
  };
}
