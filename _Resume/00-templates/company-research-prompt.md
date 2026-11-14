# Company Research Prompt (reusable — Claude Code)

Paste this whole file's content as your prompt to Claude Code, after filling in the two fields marked `<<FILL IN>>` below. Works for any company you're interviewing with, not just this one.

---

## Company

`<<FILL IN: Company name>>`

## Raw material I already have (LinkedIn export, website copy, notes, etc.)

```
<<FILL IN: paste whatever raw text/notes you already collected — About page, LinkedIn people, website sections, anything>>
```

## My own questions for the Dev / HR team

```
<<FILL IN: e.g. "How does the team work day to day, is remote possible, what's the on-call setup, etc.">>
```

---

## Task

1. **Fill the gaps with real research.** Using web search, dig into what the raw material above does *not* cover:
   - Tech stack actually used by engineering (not just marketing copy — check job posts, GitHub orgs, engineering blog, LinkedIn profiles of current engineers)
   - Company size, funding stage, and how long it's operated
   - Remote / hybrid / on-site policy — search job listings and employee reviews (Glassdoor, Bdjobs, LinkedIn posts) specifically for this, since company websites rarely state it directly
   - Engineering culture signals: team structure, tooling, release cadence, any public engineering blog or tech talks
   - Recent news: funding rounds, new clients, layoffs, leadership changes — anything in the last 6–12 months
   - Glassdoor / Bdjobs / social media reviews from current or former employees, if available — flag both positive and negative patterns, don't cherry-pick

2. **Draft answers to my own questions.** For each question I listed above, either:
   - Answer it directly if the research surfaced a solid answer, with a source, or
   - Mark it "not publicly available — ask directly" if nothing credible turned up. Don't guess or make something up to fill the gap.

3. **Output a single markdown file** named `<company-slug>-research.md` with these sections, in this order:
   - `## Overview` — 3-5 sentence summary of what the company does
   - `## Tech Stack & Engineering Signals`
   - `## Remote/Hybrid Policy` — with source, or "unconfirmed"
   - `## Culture & Team Notes`
   - `## Recent News`
   - `## My Questions — Draft Answers`
   - `## Still Need to Ask` — anything unresolved, to raise live in the interview

4. **Be honest about uncertainty.** If sources conflict (e.g. one review says fully remote, a job post says hybrid), show both and say so rather than picking one silently.

Keep the whole file skimmable in under 5 minutes — this is meant to be read right before walking into the interview, not a deep report.
