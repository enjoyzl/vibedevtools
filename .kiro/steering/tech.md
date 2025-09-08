# Technology Stack & Build System

## Tech Stack

### Bash Tools (`bin/`)
- **Language**: Bash shell scripting
- **Dependencies**: 
  - GitHub CLI (`gh`)
  - Gemini AI integration
- **Standards**: POSIX-compliant where possible

### MCP Server (`vibedev-specs-mcp/`)
- **Language**: TypeScript
- **Runtime**: Node.js >=18.0.0
- **Module System**: ESNext with ES2022 target
- **Key Dependencies**:
  - `@modelcontextprotocol/sdk`: MCP protocol implementation
  - `nanoid`: ID generation
- **Dev Dependencies**: tsx, TypeScript compiler

## Build System

### MCP Server Build Commands
```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Start built version
npm run start

# Prepare for publishing
npm run prepublishOnly
```

### Bash Tools Setup
```bash
# Make scripts executable
chmod +x bin/*.sh

# Run tools
./bin/pr-review.sh --help
```

### Bug Analysis Tools
```bash
# Auto-generate project structure mapping
python .github/chatmodes/project_analyzer.py

# Search logs via Python script
python .github/chatmodes/log_search.py <trace_id>
```

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- ES2022 target with ESNext modules
- Source maps and declarations generated
- Output to `dist/` directory

### Bash Scripts
- Use `set -e` for error handling
- Include shebang `#!/bin/bash`
- Multi-language support pattern with `get_text()` function
- Color-coded output using ANSI escape codes
- Consistent directory structure with `SCRIPT_DIR` and `PROJECT_ROOT`

## Distribution

### MCP Server
- Published to npm as `vibedev-specs-mcp`
- Executable binary via `npx vibedev-specs-mcp@latest`
- Global installation supported

### Bash Tools
- Direct execution from `bin/` directory
- Future: one-click install scripts planned