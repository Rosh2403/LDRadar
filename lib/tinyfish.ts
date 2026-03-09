export interface TinyFishFinding {
  title: string;
  summary: string;
  category: string;
  date: string;
  sourceUrl: string;
}

export interface TinyFishResult {
  findings: TinyFishFinding[];
}

function safeParseFindings(raw: unknown): TinyFishFinding[] {
  if (!raw || typeof raw !== "object") return [];

  // Handle { findings: [...] }
  if ("findings" in raw && Array.isArray((raw as Record<string, unknown>).findings)) {
    return ((raw as Record<string, unknown>).findings as unknown[]).filter(
      (f): f is TinyFishFinding =>
        f !== null &&
        typeof f === "object" &&
        "title" in f &&
        "summary" in f
    );
  }

  // Handle bare array
  if (Array.isArray(raw)) {
    return (raw as unknown[]).filter(
      (f): f is TinyFishFinding =>
        f !== null &&
        typeof f === "object" &&
        "title" in f &&
        "summary" in f
    );
  }

  return [];
}

function extractJson(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from text containing extra content
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // ignore
      }
    }
    return null;
  }
}

export async function runTinyFishScan(
  url: string,
  goal: string
): Promise<TinyFishResult> {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) throw new Error("TINYFISH_API_KEY is not set");

  const response = await fetch(
    "https://agent.tinyfish.ai/v1/automation/run-sse",
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        goal,
        browser_profile: "stealth",
        proxy_config: { enabled: true, country_code: "US" },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`TinyFish API error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("No response body from TinyFish API");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;

      let event: Record<string, unknown>;
      try {
        event = JSON.parse(raw);
      } catch {
        continue;
      }

      if (event.type === "COMPLETE" && event.status === "COMPLETED") {
        const resultJson = event.resultJson;
        if (!resultJson) return { findings: [] };

        let parsed: unknown;
        if (typeof resultJson === "string") {
          parsed = extractJson(resultJson);
        } else {
          parsed = resultJson;
        }

        return { findings: safeParseFindings(parsed) };
      }

      if (event.type === "COMPLETE" && event.status === "FAILED") {
        throw new Error(`TinyFish scan failed: ${JSON.stringify(event.error ?? event.message ?? "unknown")}`);
      }
    }
  }

  return { findings: [] };
}
