
## 1. Initialize the Authentication Service

Navigate to the authentication service:

```bash
cd backend/services/auth
```

Initialize a Node.js project:

```bash
npm init -y
```

This generates a `package.json` file containing project metadata and configuration.

The `package.json` file is used to manage dependencies, scripts, package metadata, and other project settings.

## 2. Install TypeScript

Install TypeScript globally:

```bash
npm install -g typescript
```

Verify the installation:

```bash
tsc --version
```

**What is TypeScript?**

TypeScript is a programming language built on JavaScript that adds static type checking. TypeScript code is typically compiled into JavaScript before execution by Node.js.

> Note: A global TypeScript installation is optional. For a team project, installing TypeScript as a development dependency in the service is often preferable because it allows the project to use a consistent compiler version.

To install it locally instead:

```bash
npm install --save-dev typescript
```

## 3. Generate the TypeScript Configuration

Inside the authentication service, run:

```bash
npx tsc --init
```

This generates a `tsconfig.json` file.

The `tsconfig.json` file specifies how TypeScript checks and compiles the project's source code.

## 4. Configure the TypeScript Compiler

Update the relevant options in `tsconfig.json`.

### A. File Layout

```json
"rootDir": "./src",
"outDir": "./dist"
```

- **rootDir:** Specifies the expected root directory for the project's source files.
- **outDir:** Specifies where compiled JavaScript files are generated.

Example:

```text
auth/
├── src/
│   └── index.ts
├── dist/
│   └── index.js
└── tsconfig.json
```

### B. Module System and JavaScript Target

```json
"module": "NodeNext",
"moduleResolution": "NodeNext",
"target": "ES2020"
```

- **module:** Configures the module format and related behavior used during compilation.
- **moduleResolution:** Determines how TypeScript resolves imported modules.
- **target:** Specifies the JavaScript language version targeted by the compiler.

`NodeNext` follows modern Node.js module-system rules and works with the project's package configuration.

The `module` and `moduleResolution` options should generally be configured together.

### C. Node.js Environment

```json
"lib": ["ES2020"],
"types": ["node"]
```

- **lib:** Specifies the built-in JavaScript APIs available to TypeScript's type checker.
- **types:** Includes type definitions for the specified type packages.

The `node` type definitions provide types for Node.js APIs, such as `process` and `Buffer`.

Install them in the service:

```bash
npm install --save-dev @types/node
```

### D. Other Outputs

```json
"sourceMap": false,
"declaration": false,
"declarationMap": false
```

These options control additional files generated during compilation.

| Option | When enabled | Purpose |
|---|---|---|
| `sourceMap` | Generates `.js.map` files | Maps compiled JavaScript back to TypeScript for debugging. |
| `declaration` | Generates `.d.ts` files | Exposes type declarations for consumers of a package or library. |
| `declarationMap` | Generates `.d.ts.map` files when declarations are generated | Helps editors navigate from declaration files to original source files. |

For an initial standalone backend service, keeping these options disabled is reasonable.

They can be enabled later if debugging, library development, or tooling requirements call for them.

## 5. Compile TypeScript

Create the source directory and an entry-point file:

```bash
mkdir src
```

Create `src/index.ts`:

```typescript
const message: string = "FoodFlow Auth Service";

console.log(message);
```

Compile the TypeScript code:

```bash
npx tsc
```

The compiler generates JavaScript in the `dist` directory.

Run the compiled application:

```bash
node dist/index.js
```

Expected output:

```text
FoodFlow Auth Service
```

## 6. Key Learnings

- Node.js projects use `package.json` to manage dependencies and scripts.
- TypeScript adds static type checking to JavaScript.
- `tsconfig.json` controls compiler behavior.
- `rootDir` identifies the source directory, while `outDir` identifies the compilation output directory.
- `NodeNext` configures TypeScript to follow Node.js module-system rules.
- `sourceMap`, `declaration`, and `declarationMap` control optional compiler outputs.
- Each microservice can maintain its own configuration and dependencies.
