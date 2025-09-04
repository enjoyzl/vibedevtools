import { readTemplate } from '../utils/template.js';
import { BugfixManager } from '../utils/bugfix-manager.js';

export interface BugfixReportParams {
    session_id: string;
    bug_id?: string;
    bug_url?: string;
    trace_id?: string;
    user_info?: string;
    business_scenario?: string;
    interface_params?: string;
    log_analysis?: string;
    table_data?: string;
    external_api_response?: string;
    problem_location?: string;
    possible_cause?: string;
    impact_scope?: string;
    fix_suggestions?: string;
}

export async function bugfixReport(params: BugfixReportParams) {
    console.error('[MCP] 生成 bugfix 报告');

    // 生成或使用提供的 bug ID
    const bugId = params.bug_id || BugfixManager.generateBugId(params.session_id, params.bug_url);
    const bugfixManager = new BugfixManager();

    const timestamp = new Date().toISOString();

    const template = await readTemplate('bugfix-report.md', {
        session_id: params.session_id,
        timestamp,
        bug_id: bugId,
        trace_id: params.trace_id || '未提供',
        user_info: params.user_info || '未提供',
        business_scenario: params.business_scenario || '未提供',
        interface_params: params.interface_params || '未提供',
        log_analysis: params.log_analysis || '未提供',
        table_data: params.table_data || '未提供',
        external_api_response: params.external_api_response || '未提供',
        problem_location: params.problem_location || '未提供',
        possible_cause: params.possible_cause || '未提供',
        impact_scope: params.impact_scope || '未提供',
        fix_suggestions: params.fix_suggestions || '未提供'
    });

    // 将报告保存到 bugfix 目录
    const reportTimestamp = timestamp.replace(/[:.]/g, '-');
    const reportFile = await bugfixManager.saveReport(
        bugId,
        `bugfix_report_${reportTimestamp}.md`,
        template
    );

    return template + `\n\n**报告已保存至:** \`${reportFile}\``;
}