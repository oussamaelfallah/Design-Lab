# mobileworker

Next.js 16 app with TypeScript, App Router, ESLint, and Prettier.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
cp .env.example .env.local
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Scripts

- `npm run lint` - run ESLint
- `npm run lint:fix` - auto-fix ESLint issues
- `npm run typecheck` - run TypeScript checks
- `npm run format` - check Prettier formatting
- `npm run format:write` - apply Prettier formatting

## Project Structure

- `src/app` - routes, layouts, and global styles
- `public` - static assets
- `.env.local` - local environment variables (not committed)
