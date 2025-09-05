import { customAlphabet } from 'nanoid';
import { readTemplate } from '../utils/template.js';

const generateSessionId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

export interface BugfixStartParams {
  bug_url?: string;
  trace_id?: string;
  bug_description?: string;
}

export async function bugfixStart(params: BugfixStartParams = {}): Promise<string> {
  const session_id = generateSessionId();
  console.error(`[MCP] Starting bugfix workflow with session_id: ${session_id}`);
  
  const { bug_url, trace_id, bug_description } = params;
  
  // Use bugfix-start.md template
  const template = await readTemplate('bugfix-start.md', {
    session_id,
    bug_url: bug_url || '',
    trace_id: trace_id || '',
    bug_description: bug_description || ''
  });
  
  return `# 🐛 VibeSpecs Bug Analysis Workflow Started

## Current Stage: Bug Analysis Initialization (1/3)

Welcome to the VibeSpecs bug analysis workflow! I'll help you perform comprehensive bug analysis from information gathering to root cause identification.

### Workflow Overview:
- [ ] 1. **Bug Analysis Initialization** ← Current Stage
- [ ] 2. Comprehensive Analysis (Log Search & Code Analysis)
- [ ] 3. Report Generation

---

${template}

---

**Session Information**:
- Session ID: \`${session_id}\`
${bug_url ? `- Bug URL: ${bug_url}` : ''}
${trace_id ? `- Trace ID: ${trace_id}` : ''}

**Important**:
- Please provide bug information or let me extract it from TAPD
- **Only when you have the necessary information can you call** \`vibedev_bugfix_analyze\` tool
- **Never** skip the analysis phase before generating the report`;
}