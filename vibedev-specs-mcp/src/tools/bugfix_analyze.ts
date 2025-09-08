import { readTemplate } from '../utils/template.js';

export interface BugfixAnalyzeParams {
  session_id: string;
  trace_id?: string;
}

export async function bugfixAnalyze(params: BugfixAnalyzeParams): Promise<string> {
  const { session_id, trace_id } = params;
  console.error(`[MCP] Starting bugfix analysis for session: ${session_id}`);
  
  // Create dynamic config description for template
  const config_description = process.env.BUGFIX_CONFIG_PATH 
    ? `environment variable BUGFIX_CONFIG_PATH: ${process.env.BUGFIX_CONFIG_PATH}`
    : 'workspace config file (search for *.config.json in current workspace or use default: ~/.vibedev/bugfix.config.json)';
  
  // Use bugfix-analyze.md template
  const template = await readTemplate('bugfix-analyze.md', {
    session_id,
    trace_id: trace_id || '',
    bugfix_config_file: config_description
  });
  
  return `# 🔍 Bug Analysis Stage (2/3)

## Session: ${session_id}

### Workflow Progress:
- [x] 1. Bug Analysis Initialization ✅
- [x] 2. **Comprehensive Analysis** ← Current Stage
- [ ] 3. Report Generation

---

${template}

---

**Important**:
- This stage integrates with TAPD, SSH, and MySQL MCP servers
- Follow the analysis workflow step by step
- **Only when analysis is complete can you call** \`vibedev_bugfix_report\` tool
- **Never** skip any analysis steps

**Session Information**:
- Session ID: \`${session_id}\`
${trace_id ? `- Trace ID: ${trace_id}` : ''}`;
}