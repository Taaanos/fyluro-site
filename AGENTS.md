# AGENTS.md

Working rules for `fyluro-site`.
Fyluro product facts come from `../fyluro/docs/ROL-6-spec-and-invariants.md`.
User-facing Fyluro documentation lives in `content/docs/` here and is linked from `../fyluro/README.md`.
Never invent product behavior or features.

## Goals of This Repository

- Build the marketing and documentation site for Fyluro (`fyluro.thanosam.com`).
- Host the site on Cloudflare Pages.
- Keep the design modular so `oxys-site` and `thanosam.com` can reuse the shared layer.
- Teach web architecture and the chosen stack as we build.

## Teaching and Mental Model Rules

1. Explain the "why" before you write code.
2. Map each task to one of the six web layers: Domains, Site Map, Content, Visual System, Tech Stack, or Hosting.
3. Introduce one stack concept at a time (for example: components, CSS tokens, routing, static builds).
4. Explain new files, folders, and config options in plain language before or right after creating them.
5. Stop and ask before making major architecture or design choices.

## Work Loop

1. Pick one story from `STORIES.md`.
2. Review any open decisions for that story and settle them first.
3. Explain the stack concepts needed for the story.
4. Build the smallest working change.
5. Verify the result in the local dev server or build output.
6. Update the story status in `STORIES.md`.

### Questions or Exploration
- Do not edit files or run build commands unless the user asks.

## Work Tracking

- Track all stories, phases, and open decisions in `STORIES.md`.
- Keep `STORIES.md` listed in `.gitignore` until the user asks to commit it.
- Mark completed stories and tasks in `STORIES.md` at the end of each step.

## Modularity Rules

Separate the codebase into two clear layers:
- **Shared layer:** Layout, typography, spacing, base components, and future docs layout.
- **Tool layer:** Fyluro copy, animal icon, accent color, and active background component (mycorrhizal network).

Do not mix tool-specific assets or copy into shared layout components.

## Commits

- Make one commit per story or logical change.
- Stage only changed files.
- Use a conventional prefix (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`) with scope and intent.
- Do not add `Co-Authored-By` or other attribution lines.

## Writing Style (ASD-STE100)

Write all new or edited docs and all chat replies in ASD-STE100:
- Keep sentences short (steps: <= 20 words; descriptions: <= 25 words).
- Put one idea in each sentence.
- Use active voice and imperative verbs for steps.
- Use one word for one meaning. Avoid idioms.
