# FoodFlow — Auth Service Setup

## 1. Overview

The Auth Service is responsible for authentication-related functionality in FoodFlow. This document covers dependency installation, TypeScript compilation, and development scripts.

## 2. Install Dependencies

### Runtime Dependencies

```bash
npm install express dotenv googleapis jsonwebtoken mongoose axios cors
```

These packages provide functionality required by the application at runtime.

| Package | Purpose |
|---|---|
| `express` | HTTP server and routing |
| `dotenv` | Loads environment variables from `.env` files |
| `googleapis` | Integrates with Google APIs |
| `jsonwebtoken` | Creates and verifies JWTs |
| `mongoose` | MongoDB object modeling |
| `axios` | Makes HTTP requests |
| `cors` | Configures Cross-Origin Resource Sharing |

### Development Dependencies

```bash
npm install -D @types/express @types/dotenv @types/jsonwebtoken @types/mongoose @types/axios @types/cors concurrently typescript
```

Development dependencies support development, type checking, and compilation.

**Note:** Modern versions of `dotenv`, `mongoose`, and `axios` provide their own TypeScript definitions, so their corresponding `@types` packages are generally unnecessary. Check package compatibility before installing them.

## 3. Dependencies vs. Development Dependencies

| `dependencies` | `devDependencies` |
|---|---|
| Required at runtime | Used during development or building |
| Examples: Express, Mongoose, Axios | Examples: TypeScript, Concurrently |
| Installed for production runtime | Can be omitted from a production-only installation when not required |

## 4. Package Scripts

The `scripts` section in `package.json` defines commands for building, running, and developing the application.

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "concurrently \"tsc --watch\" \"node --watch dist/index.js\""
  }
}
```

| Command | Purpose |
|---|---|
| `npm run build` | Compiles TypeScript into JavaScript. |
| `npm start` | Runs the compiled application. |
| `npm run dev` | Runs TypeScript compilation in watch mode alongside Node.js watch mode. |

### Development Workflow

```text
             npm run dev
                  |
                  v
             concurrently
              /        \
             v          v
       tsc --watch   node --watch
             |          |
             v          v
       Watches .ts   Watches .js
             |
             v
       Recompiles TS
             |
             v
       Updates .js output
                        |
                        v
                 Restarts Node.js
                        |
                        v
                 Executes updated code
```

**Important:** These are independent processes. Node.js may restart before TypeScript finishes recompiling. The initial `dist/index.js` file must also exist. Run `npm run build` before starting this workflow for the first time.

## 5. TypeScript Execution Flow

```text
src/index.ts
     |
     v
TypeScript Compiler (tsc)
     |
     v
dist/index.js
     |
     v
Node.js Runtime
     |
     v
Application Execution
```

TypeScript provides static type checking, while Node.js executes the compiled JavaScript.

## 6. Important Practices

- Keep runtime dependencies and development dependencies separate.
- Commit `package-lock.json` to Git for consistent dependency installations.
- Add `node_modules/`, `dist/`, and `.env` to `.gitignore` as appropriate.
- Never commit secrets or credentials.
- Run `npm run build` to check compilation before deployment.
- Ensure the production environment has the runtime dependencies required by the service.
- Keep TypeScript and development tools in local project dependencies for reproducible builds.

## 7. Key Learnings

- Runtime dependencies provide application functionality.
- Development dependencies support coding, type checking, and building.
- `npm run build` compiles TypeScript.
- `npm start` executes compiled JavaScript.
- `npm run dev` automates recompilation and process restarts during development.
- TypeScript code is typically compiled to JavaScript before Node.js executes it.