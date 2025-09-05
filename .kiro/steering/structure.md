# Project Structure & Organization

## Repository Layout

```
vibedevtools/
├── .git/                    # Git repository data
├── .github/                 # GitHub workflows and templates
├── .kiro/                   # Kiro IDE configuration and steering rules
├── bin/                     # Executable bash tools
│   └── pr-review.sh         # PR review automation script
├── vibedev-specs-mcp/       # MCP server subproject
│   ├── src/                 # TypeScript source code
│   ├── dist/                # Compiled JavaScript output
│   ├── docs/                # Documentation
│   ├── templates/           # Workflow templates
│   ├── node_modules/        # npm dependencies
│   ├── package.json         # npm package configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── README.md            # MCP server documentation
├── LICENSE                  # MIT license
└── README.md                # Main project documentation
```

## Organization Principles

### Dual-Project Structure
- **Root Level**: Bash tools collection with shared documentation
- **Subproject**: Self-contained MCP server with independent versioning and distribution

### Bash Tools (`bin/`)
- All executable scripts placed in `bin/` directory
- Naming convention: `{tool-name}.sh`
- Each tool should be self-contained and executable
- Common utilities and shared functions should be extracted to separate files

### MCP Server (`vibedev-specs-mcp/`)
- Standard npm package structure
- Source code in `src/` with TypeScript
- Build output in `dist/` (gitignored)
- Templates in `templates/` for workflow generation
- Independent documentation and configuration

### Generated Content Structure
When using the MCP server, projects generate:

**Development Workflow:**
```
.vibedev/specs/{feature_name}/
├── requirements.md          # EARS-format requirements
├── design.md               # Technical architecture
└── tasks.md                # Implementation checklist
```

**Bug Analysis Workflow:**
```
.vibedev/bugfix/{bug_id}/
└── report.md               # Structured bug analysis report
```

**Auto-generated Files:**
```
bugfix.project.auto.json    # Project structure mapping (auto-maintained)
```

## File Naming Conventions

### Bash Scripts
- Use kebab-case: `pr-review.sh`, `deploy-helper.sh`
- Include `.sh` extension
- Make executable with `chmod +x`

### TypeScript/JavaScript
- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Use kebab-case for file names: `workflow-manager.ts`

### Documentation
- Use `README.md` for main documentation
- Use `README_zh.md` for Chinese translations
- Use lowercase with hyphens for other docs: `api-reference.md`

## Configuration Files

### Root Level
- `LICENSE`: MIT license for the entire project
- `README.md`: Main project overview and usage

### MCP Server Level
- `package.json`: npm package configuration and dependencies
- `tsconfig.json`: TypeScript compiler configuration
- `bugfix.config.json`: Bug analysis tool configuration (log servers, databases)
- `.gitignore`: Git ignore patterns specific to Node.js/TypeScript

### ChatMode Level (`.github/chatmodes/`)
- `bugfix1.chatmode.md`: Full automated bug analysis mode configuration
- `bugfix2.chatmode.md`: Simplified bug analysis mode configuration
- `project_analyzer.py`: Python script for auto-generating project mappings
- `log_search.py`: Python script for automated log searching