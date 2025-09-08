import { readTemplate } from '../utils/template.js';

export interface BugfixReportParams {
  session_id: string;
}

export async function bugfixReport(params: BugfixReportParams): Promise<string> {
  const { session_id } = params;
  console.error(`[MCP] Generating bugfix report for session: ${session_id}`);
  
  // Use bugfix-report.md template
  const template = await readTemplate('bugfix-report.md', {
    session_id
  });
  
  return `# 📊 Bug Analysis Report Generation (3/3)

## Session: ${session_id}

### Workflow Progress:
- [x] 1. Bug Analysis Initialization ✅
- [x] 2. Comprehensive Analysis ✅
- [x] 3. **Report Generation** ← Current Stage

---

${template}

---

**Completion**:
- This completes the bug analysis workflow
- The generated report provides comprehensive insights
- You can use this analysis for bug fixing and prevention

**Session Information**:
- Session ID: \`${session_id}\`
- Analysis Complete: ✅`;
}