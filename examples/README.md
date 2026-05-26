# DESIGN.md examples from 31 real sites

Each file in this folder is a real `DESIGN.md` extracted with `npx brandmd <url>` from a live website. Drop any of these into your project root and your AI coding agent (Claude Code, Cursor, Gemini CLI, Codex, Google Stitch) will start matching that site's visual system instead of generating generic UI.

Generate your own:

```bash
npx brandmd https://yoursite.com
npx brandmd https://yoursite.com --agent   # also writes Cursor rule + Claude skill
```

Repo: [github.com/yuvrajangadsingh/brandmd](https://github.com/yuvrajangadsingh/brandmd) · npm: [brandmd](https://www.npmjs.com/package/brandmd)

---

## AI & developer tools

- [Anthropic](anthropic.md) · anthropic.com
- [Claude](claude.md) · claude.com
- [OpenAI](openai.md) · platform.openai.com/docs
- [Stitch](stitch.md) · stitch.withgoogle.com
- [Cursor](cursor.md) · cursor.com
- [Hugging Face](huggingface.md) · huggingface.co
- [GitHub](github.md) · github.com
- [Raycast](raycast.md) · raycast.com
- [Replit](replit.md) · docs.replit.com
- [Mintlify](mintlify.md) · mintlify.com

## Infra, APIs & auth

- [Stripe](stripe.md) · stripe.com
- [Vercel](vercel.md) · vercel.com
- [Supabase](supabase.md) · supabase.com
- [Railway](railway.md) · railway.app
- [Clerk](clerk.md) · clerk.com
- [Resend](resend.md) · resend.com

## Frontend, design & no-code

- [Tailwind CSS](tailwindcss.md) · tailwindcss.com
- [Figma](figma.md) · figma.com
- [Framer](framer.md) · framer.com
- [Webflow](webflow.md) · webflow.com

## Productivity, support & ops

- [Linear](linear.md) · linear.app
- [Notion](notion.md) · notion.com
- [Loom](loom.md) · loom.com
- [Intercom](intercom.md) · intercom.com
- [Atlassian](atlassian.md) · atlassian.com
- [PostHog](posthog.md) · posthog.com
- [Sentry](sentry.md) · sentry.io

## Consumer & commerce

- [Apple](apple.md) · apple.com
- [Spotify](spotify.md) · spotify.com
- [Airbnb](airbnb.md) · airbnb.com
- [Shopify](shopify.md) · shopify.com

---

## Other output formats

brandmd can also emit CSS custom properties, a Tailwind v4 theme block, JSON tokens, or an HTML brand guide. Samples:

- [Vercel](vercel.css) · CSS custom properties (`--css`)
- [Linear](linear-tailwind.css) · Tailwind v4 `@theme` block (`--tailwind`)

See the [main README](../README.md) for all flags.
