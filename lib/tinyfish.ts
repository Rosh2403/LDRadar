import { SCAN_CONFIG } from "./constants";

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
  goal: string,
  options: { maxSteps?: number } = {}
): Promise<TinyFishResult> {
  const apiKey = process.env.TINYFISH_API_KEY;
  if (!apiKey) throw new Error("TINYFISH_API_KEY is not set");

  const maxSteps = options.maxSteps ?? SCAN_CONFIG.directMaxSteps;

  // Idle-based abort: resets every time we receive data from TinyFish.
  // Only fires if TinyFish stops sending heartbeats/events entirely.
  const controller = new AbortController();
  let idleTimer: ReturnType<typeof setTimeout>;
  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => controller.abort(), SCAN_CONFIG.idleTimeoutMs);
  };
  resetIdle(); // start initial idle timer

  try {
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
          max_steps: maxSteps,
        }),
        signal: controller.signal,
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

      // Data received — TinyFish is alive, reset idle timer
      resetIdle();

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

        console.log("[TinyFish] event:", JSON.stringify(event).slice(0, 300));

        if (event.type === "COMPLETE" && event.status === "COMPLETED") {
          // TinyFish may return data in `resultJson` or `result`
          const resultJson = event.resultJson ?? event.result;
          if (!resultJson) return { findings: [] };
          console.log("[TinyFish] COMPLETE result:", JSON.stringify(resultJson).slice(0, 500));

          let parsed: unknown;
          if (typeof resultJson === "string") {
            parsed = extractJson(resultJson);
          } else {
            parsed = resultJson;
          }

          return { findings: safeParseFindings(parsed) };
        }

        if (event.type === "COMPLETE" && event.status === "FAILED") {
          const errorDetail = event.error ?? event.message ?? "unknown";
          const errorMsg = typeof errorDetail === "string" ? errorDetail : JSON.stringify(errorDetail);
          throw new Error(`TinyFish scan failed: ${errorMsg}`);
        }
      }
    }

    return { findings: [] };
  } finally {
    clearTimeout(idleTimer);
  }
}
