# Build with XAgent × OKX

One command. You get an XAgent identity, the OKX skill suite (DEX, wallet, DeFi, meme scanning, security), and a working agent runtime in Cursor or Claude Code. Then go build.

```bash
npx @xagt/agent-plugin@latest setup --target all
```

Requires Node `>= 18.17`. Hackathon kicks off **May 11, 2026**.

---

## What you get out of the box

After `setup`, your agent (Cursor / Claude Code / OpenClaw / any AgentSkills runtime) can:

- **Swap tokens** across 500+ DEXs on 20+ chains (XLayer, Solana, Ethereum, Base, BSC, Arbitrum, Polygon…)
- **Read any wallet** — balances, holdings, PnL, trade history
- **Discover DeFi yield** — APY, TVL, lend, borrow, stake, claim, CLMM positions
- **Scan meme launches** on pump.fun — dev rug history, bundle/sniper detection, bonding curve progress
- **Track smart money** — leaderboards, KOL trade feeds, aggregated whale signals
- **Pre-flight transactions** — token risk, honeypot detection, phishing dApp scan, signature safety
- **Get live market data** — prices, K-lines, OHLC, holder cluster analysis
- **Route to specific dApps** — Polymarket, Aave V3, Hyperliquid, PancakeSwap, Morpho

Full skill catalog: `~/.claude/skills/` after `setup` finishes.

## Build something

Five seed ideas — pick one or invent better:

1. **Agent-native trading copilot** — "buy $100 of any meme the top 10 KOLs bought in the last hour, max 5% slippage"
2. **DeFi auto-rebalancer** — agent watches your portfolio, proposes lending/staking moves when APY drifts
3. **Rug-proof swap UI** — every swap quote runs a security scan first, blocks honeypots automatically
4. **Onchain news desk** — agent that summarizes every smart-money buy signal into a 6am digest
5. **Cross-chain arbitrage scout** — finds price gaps the aggregator hasn't priced in yet

The agent does the on-chain work. You design the experience.

## Submit

Open a PR against [`xerpa-ai/xagent-plugin`](https://github.com/xerpa-ai/xagent-plugin):

- Add `projects/<your-team>/README.md` — what you built, demo URL or video, team contact
- Keep your code in your own repo; link it from the PR description

Judges merge accepted submissions. Final demo day TBD.

## Get help

In-person at the venue. No Discord, no Telegram. Pull a mentor over.

---

## Reference

### Commands

```bash
xagent-plugin setup     [--target all|cursor|claude-code|generic] [--no-browser] [--skip-substep] [--dry-run]
xagent-plugin install   [--target all|cursor|claude-code|generic] [--dry-run]
xagent-plugin login     [--no-browser]
xagent-plugin logout
xagent-plugin report    [--target all|cursor|claude-code|generic]
xagent-plugin doctor
xagent-plugin print-skill
```

Prefix with `npx @xagt/agent-plugin@latest ` if not globally installed (`npm i -g @xagt/agent-plugin`).

### Targets

| Target        | Path                                            |
|---------------|-------------------------------------------------|
| `cursor`      | `<workspace>/.cursor/skills/xagent-setup/`      |
| `claude-code` | `~/.claude/skills/xagent-setup/`                |
| `generic`     | `~/.agents/skills/xagent-setup/` (AgentSkills, OpenClaw) |
| `all`         | all of the above                                |

Credentials at `~/.config/xagent/credentials.json` (`%APPDATA%\xagent\credentials.json` on Windows), `chmod 600`.

### Backend

| Env var                  | Resolves to                       |
|--------------------------|-----------------------------------|
| _(unset)_                | `https://api.xerpaai.com` (prod)  |
| `XAGENT_ENV=test`        | `https://testdapp.xerpaai.com`    |
| `XAGENT_API_BASE=<url>`  | whatever you set                  |

### What `setup` writes

1. Browser OAuth on `127.0.0.1:<random>` (or `--no-browser` for device-code).
2. Credentials → `~/.config/xagent/credentials.json`.
3. `xagent-setup/SKILL.md` → the targets above.
4. Runs `npx skills add okx/plugin-store --skill plugin-store` (skip with `--skip-substep`).
5. POSTs install report (target, fingerprint hash, plugin-store result) to backend.

Nothing else. Use `--dry-run` to preview without writing.

### Troubleshooting

| Symptom                                  | Fix                                                              |
|------------------------------------------|-------------------------------------------------------------------|
| `npx ... setup` exits 0 with no output   | You hit `0.1.0`. Pin `@latest` or `npx clear-npx-cache`.          |
| `404` on production endpoints            | Not deployed yet. Use `XAGENT_ENV=test`.                          |
| Browser opens but never returns          | Frontend allowlist missing host. See `docs/SETUP_FLOW.md`.        |
| `EACCES` writing to `~/.claude/skills/`  | Wrong user. Don't `sudo`.                                         |

### Develop

```bash
npm install
npm test          # vitest, 11 cases
npm run lint      # tsc --noEmit
npm run build
node dist/cli.js doctor
node dist/cli.js setup --target generic --dry-run
```

License: UNLICENSED — XerpaAI internal tooling, hackathon use granted.
