import { readTemplate } from '../utils/template.js';
import { getWorkflowOverview } from '../utils/workflow.js';
import { BugfixManager, BugfixSession } from '../utils/bugfix-manager.js';

export interface BugfixStartParams {
  session_id?: string;
  bug_url?: string;
  trace_id?: string;
  description?: string;
}

export async function bugfixStart(params: BugfixStartParams = {}) {
  console.error('[MCP] 开始 bugfix 工作流程');
  
  const sessionId = params.session_id || `session_${Date.now()}`;
  const bugId = BugfixManager.generateBugId(sessionId, params.bug_url);
  
  // 创建 bugfix 目录结构
  const bugfixManager = new BugfixManager();
  
  // Save session metadata
  const session: BugfixSession = {
    bugId,
    sessionId,
    traceId: params.trace_id,
    bugUrl: params.bug_url,
    description: params.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await bugfixManager.saveBugfixSession(session);
  
  const workflowOverview = getWorkflowOverview('bugfix_start');
  
  const template = await readTemplate('bugfix-start.md', {
    workflow_overview: JSON.stringify(workflowOverview, null, 2),
    bug_id: bugId,
    session_id: sessionId
  });
  
  return template;
}