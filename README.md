# 📡 LP Radar

> Institutional investor intelligence, automated.

LP Radar is an AI-powered monitoring engine that tracks institutional investors — university endowments, sovereign wealth funds, and pension funds — and surfaces intelligence the moment it happens. Every finding is backed by a source URL.

Built for VCs, fund managers, and placement agents who need to know where the big money is moving **before** it becomes public knowledge.

![LP Radar Dashboard](./public/screenshot.png)

---

## Why LP Radar?

Bloomberg charges $30k/year and still misses most of this. Institutional investor websites publish CIO appointments, allocation shifts, and new fund mandates on their own portals — buried behind modals, PDFs, and deep navigation with no unified API.

LP Radar uses the [TinyFish Web Agent API](https://tinyfish.ai) to navigate these sites like a human, extract structured intelligence, and deliver it in real time.

---

## What it monitors

| Institution | Type |
|---|---|
| Harvard Management Company | Endowment |
| Yale Investments Office | Endowment |
| MIT Investment Management | Endowment |
| Stanford Management Company | Endowment |
| GIC Singapore | Sovereign Wealth Fund |
| Temasek | Sovereign Wealth Fund |
| NBIM Norway | Sovereign Wealth Fund |
| Abu Dhabi Investment Authority | Sovereign Wealth Fund |
| CalPERS | Pension Fund |
| SEC EDGAR 13F Filings | Regulatory |

---

## What it detects

- **Leadership** — CIO appointments, senior departures
- **Allocation** — asset class shifts, new targets
- **Mandate** — new fund partnerships, manager selections
- **Policy** — investment policy updates, ESG shifts
- **Portfolio** — notable moves, exits, new positions

---

## Tech Stack

- **Frontend** — Next.js 14, TypeScript, Tailwind CSS
- **Database** — Prisma + SQLite
- **Web Agent** — [TinyFish Web Agent API](https://tinyfish.ai) (stealth mode)
- **Streaming** — Server-Sent Events for real-time scan progress

---

## Getting Started

### Prerequisites
- Node.js 18+
- TinyFish API key — get one at [agent.tinyfish.ai](https://agent.tinyfish.ai/signup)

### Installation

```bash
git clone https://github.com/yourusername/lp-radar
cd lp-radar
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Add your TinyFish API key to `.env`:

```
TINYFISH_API_KEY=your_key_here
DATABASE_URL="file:./dev.db"
```

### Database Setup

```bash
npx prisma migrate dev
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and hit **Run Scan**.

---

## How it works

1. LP Radar sends each institutional investor URL to the TinyFish Web Agent API
2. The agent navigates the live site in stealth mode, handles auth, modals, and dynamic content
3. Returns structured JSON findings — title, summary, category, date, and source URL
4. Findings are stored and displayed in the dashboard in real time as the scan progresses

```
TinyFish Agent → navigates live site → extracts findings → dashboard
```

---

## Built for

[TinyFish Accelerator](https://tinyfish.ai/accelerator) — a 9-week program backed by $2M from Mango Capital for founders building on the Agentic Web.

---

## License

MIT
