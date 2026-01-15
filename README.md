# sfdc-lex-out

Built with [create-kofi-stack](https://github.com/theodenanyoh11/create-kofi-stack)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Backend**: Convex (reactive backend-as-a-service)
- **Auth**: Better-Auth with Convex adapter
- **UI**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4

## Getting Started

```bash
cd sfdc-lex-out
pnpm dev
```

This will:
- Install dependencies (if needed)
- Set up Convex (if not configured)
- Start Next.js and Convex dev servers

## Project Structure


```
├── apps/
│   ├── web/          # Main Next.js application
│   ├── marketing/    # Marketing site
│   └── design-system/ # Component showcase
├── packages/
│   ├── backend/      # Convex functions
│   └── ui/           # Shared UI components
└── ...
```


## Documentation

- [Convex](https://docs.convex.dev)
- [Better-Auth](https://www.better-auth.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Next.js](https://nextjs.org/docs)
