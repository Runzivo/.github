# Runzivo GitHub profile

This repository publishes the Runzivo organization profile. GitHub displays
[`profile/README.md`](profile/README.md) on the organization page.

## Commands

This repository pins Node.js 24.21.0 and pnpm 12.4.1. Use pnpm only.

```sh
pnpm install --frozen-lockfile
pnpm fmt
pnpm fmt:check
pnpm check
pnpm audit:security
```

`pnpm check` confirms the required organization profile path, header asset,
approved company copy, runner label, public links, and excluded claims.
