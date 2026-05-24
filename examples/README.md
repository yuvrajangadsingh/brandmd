# brandmd examples — 30 real design systems

DESIGN.md files extracted with `npx brandmd <url>` from live sites. Drop any of these into your project root and your AI coding agent (Claude Code, Cursor, Gemini CLI, Codex, Google Stitch) will start matching that brand instead of generating generic UI.

Generate your own:

```bash
npx brandmd https://yoursite.com
npx brandmd https://yoursite.com --agent   # also writes Cursor rule + Claude skill
```

Repo: [github.com/yuvrajangadsingh/brandmd](https://github.com/yuvrajangadsingh/brandmd)

---

## Developer tools & AI

- [Anthropic](anthropic.md) — anthropic.com
- [Claude](claude.md) — claude.com
- [Cursor](cursor.md) — cursor.com
- [OpenAI](openai.md) — platform.openai.com/docs
- [Hugging Face](huggingface.md) — huggingface.co
- [GitHub](github.md) — github.com
- [Raycast](raycast.md) — raycast.com
- [Tailwind CSS](tailwindcss.md) — tailwindcss.com
- [Mintlify](mintlify.md) — mintlify.com

## Infrastructure & APIs

- [Stripe](stripe.md) — stripe.com
- [Vercel](vercel.md) — vercel.com
- [Supabase](supabase.md) — supabase.com
- [Railway](railway.md) — railway.com
- [Clerk](clerk.md) — clerk.com
- [Resend](resend.md) — resend.com
- [Replit](replit.md) — docs.replit.com

## Productivity & collab

- [Linear](linear.md) — linear.app
- [Notion](notion.md) — notion.com
- [Figma](figma.md) — figma.com
- [Loom](loom.md) — loom.com
- [Intercom](intercom.md) — intercom.com
- [Atlassian](atlassian.md) — atlassian.com

## Observability & devops

- [PostHog](posthog.md) — posthog.com
- [Sentry](sentry.md) — sentry.io

## Design & no-code

- [Framer](framer.md) — framer.com
- [Webflow](webflow.md) — webflow.com

## Consumer brands

- [Apple](apple.md) — apple.com
- [Spotify](spotify.md) — spotify.com
- [Airbnb](airbnb.md) — airbnb.com
- [Shopify](shopify.md) — shopify.com

---

## Other output formats

brandmd can also emit CSS custom properties, a Tailwind v4 theme block, JSON tokens, or an HTML brand guide. A couple of examples in this folder:

- [Vercel](vercel.css) — CSS custom properties (`--css`)
- [Linear](linear-tailwind.css) — Tailwind v4 `@theme` block (`--tailwind`)

See the [main README](../README.md) for all flags.
