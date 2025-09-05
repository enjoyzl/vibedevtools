# Product Overview

**vibedevtools** is a collection of development productivity tools consisting of two main components:

## Core Components

### 1. Bash Development Tools (`bin/`)
A collection of Bash scripts designed to boost development efficiency through automation. Currently includes:
- **pr-review.sh**: Intelligent PR review script integrating GitHub CLI and Gemini AI with multi-language support

### 2. VibeSpecs MCP Server (`vibedev-specs-mcp/`)
An AI-powered development workflow MCP (Model Context Protocol) server that guides developers from requirements to code implementation. Features include:
- Complete development workflow (goal → requirements → design → tasks → execution)
- AI-powered guidance with step-by-step instructions
- Template-based approach using proven formats (EARS requirements, structured design docs)
- **Comprehensive Bug Analysis Workflow**: Automated bug diagnosis integrating TAPD, log servers, and database queries
- Claude Code integration

### 3. Bug Analysis ChatModes (`.github/chatmodes/`)
Specialized AI assistant modes for automated bug analysis:
- **bugfix1.chatmode.md**: Full automated bug analysis with project structure auto-analysis
- **bugfix2.chatmode.md**: Simplified bug analysis mode
- Integration with TAPD, SSH log servers, and MySQL databases
- Structured Chinese reporting format

## Target Users
- Development teams seeking automation and workflow optimization
- Developers using Claude Code for AI-assisted development
- Teams following structured development processes

## Key Value Propositions
- Streamlined development workflows from concept to code
- Intelligent automation for common development tasks
- Structured approach to requirements, design, and implementation
- Multi-language support for international teams