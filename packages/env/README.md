# Environment Package

This package manages environment variables for the browser extension.

## How It Works

This setup supports scoped and environment-based builds via the following pattern:

```
pnpm <action>:<scope>:<env>
```

- **Actions**: `run` | `build`
- **Scopes**: `chrome` | `firefox`
- **Environments**: `local` | `production`

### Example Commands

```bash
pnpm run:chrome:local       # Dev Chrome with Local env
pnpm run:firefox:production # Dev Firefox with Production env
```

## CLI Env Setup

Under the hood, this uses the `set-global-env` script to write values into `.env`. You can still manually or programmatically modify values using:

```bash
pnpm set-env CLI_CEB_DEV=true CLI_CEB_FIREFOX=false CEB_ENV=development
```

> **IMPORTANT**
>
> - All `CLI_CEB_` values are **overwritten on each call**.
> - Default values: `CLI_CEB_DEV=false`, `CLI_CEB_FIREFOX=false`.

## Add a New Environment Variable

### Option 1: CLI (for temporary CLI use only)

```bash
pnpm set-env CLI_CEB_MY_FLAG=true
```

### Option 2: Base Environment File

Edit or add to your `.env.development` or `.env.production` files using the `CEB_` prefix:

```env
CEB_API_URL=https://api.local
```

## 🔁 Accessing the Variables in Code

```ts
console.log(process.env['CEB_MY_FLAG']);
console.log(process.env.CEB_MY_FLAG); // Also works, but no auto-complete
```

> Use bracket notation for better IDE auto-completion.

## 🔂 Using Constants from `@extension/env`

```ts
import { IS_DEV } from '@extension/env';
```

For more, see [`lib/const.ts`](lib/const.ts)

---

**TL;DR**  
Use `pnpm run:chrome:local` or similar to inject the correct environment.  
Your app will automatically adjust based on `.env.<ENV>` + CLI values.
