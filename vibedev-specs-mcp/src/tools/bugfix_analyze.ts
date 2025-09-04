import { readTemplate } from '../utils/template.js';
import { ProjectAnalyzer } from '../utils/project-analyzer.js';
import { LogSearcher } from '../utils/log-searcher.js';
import { BugfixManager } from '../utils/bugfix-manager.js';

export interface BugfixAnalyzeParams {
    session_id: string;
    bug_url?: string;
    trace_id?: string;
    description?: string;
    auto_analyze?: boolean;
}

export async function bugfixAnalyze(params: BugfixAnalyzeParams) {
    console.error('[MCP] 开始 bugfix 分析');

    const { session_id, bug_url, trace_id, description, auto_analyze = true } = params;

    // 生成或查找现有的 bug ID
    const bugId = BugfixManager.generateBugId(session_id, bug_url);
    const bugfixManager = new BugfixManager();

    let analysisResult = '';
    let savedFiles: string[] = [];

    if (auto_analyze) {
        try {
            // Run project analyzer first
            const projectAnalysis = await runProjectAnalyzer(bugfixManager, bugId);
            analysisResult += projectAnalysis.summary;
            savedFiles.push(projectAnalysis.configFile);

            // Then run log search if trace_id is provided
            if (trace_id) {
                const logAnalysis = await runLogSearch(trace_id, bugfixManager, bugId);
                analysisResult += logAnalysis.summary;
                if (logAnalysis.logFile) {
                    savedFiles.push(logAnalysis.logFile);
                }
            }
        } catch (error: any) {
            analysisResult += `\n⚠️ 自动分析过程中出现错误: ${error.message}\n`;
        }
    }

    // 保存分析结果
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const analysisFile = await bugfixManager.saveAnalysis(
        bugId,
        `analysis_${timestamp}.md`,
        analysisResult
    );
    savedFiles.push(analysisFile);

    const template = await readTemplate('bugfix-analyze.md', {
        session_id,
        bug_id: bugId,
        bug_url: bug_url || '未提供',
        trace_id: trace_id || '未提供',
        description: description || '未提供',
        analysis_result: analysisResult
    });

    return template;
}

async function runProjectAnalyzer(bugfixManager: BugfixManager, bugId: string): Promise<{ summary: string, configFile: string }> {
    try {
        const analyzer = new ProjectAnalyzer('.');
        const config = await analyzer.analyzeProject();

        // 将配置保存到 bugfix 目录而不是项目根目录
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const configFile = await bugfixManager.saveAnalysis(
            bugId,
            `project_config_${timestamp}.json`,
            JSON.stringify(config, null, 2)
        );

        const summary = `
## 📊 项目结构分析结果

- Repository 类: ${config.projectInfo.totalRepositories} 个
- Service 类: ${config.projectInfo.totalServices} 个
- 业务场景: ${config.businessScenarios.length} 个

### Repository 映射
${Object.entries(config.repositoryMapping).map(([repo, table]) =>
            `- ${repo} → ${table}`
        ).join('\n')}

### 业务场景分析
${config.businessScenarios.map(scenario =>
            `- ${scenario.scenario}: ${scenario.relatedServices.length} 个服务, ${scenario.coreTables.length} 个核心表`
        ).join('\n')}

**配置文件已保存至:** \`${configFile}\`
`;

        return { summary, configFile };
    } catch (error: any) {
        throw new Error(`项目分析器执行失败: ${error.message}`);
    }
}

async function runLogSearch(traceId: string, bugfixManager: BugfixManager, bugId: string): Promise<{ summary: string, logFile?: string }> {
    try {
        const searcher = new LogSearcher();

        const connected = await searcher.connect();
        if (!connected) {
            throw new Error('无法连接到日志服务器');
        }

        const { searchResult, businessInfo } = await searcher.searchAndAnalyze(traceId, bugfixManager, bugId);

        await searcher.disconnect();

        if (searchResult.error) {
            throw new Error(searchResult.error);
        }

        // 将日志文件保存到 bugfix 目录
        let logFile: string | undefined;
        if (searchResult.output) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            logFile = await bugfixManager.saveLogFile(
                bugId,
                `logs_${traceId}_${timestamp}.txt`,
                searchResult.output
            );
        }

        const summary = `
## 🔍 日志搜索结果

### 搜索统计
- TraceId: ${traceId}
- 找到日志行数: ${searchResult.lines_count}
- 日志文件: ${logFile || '未保存'}

### 业务信息提取
- 用户ID: ${businessInfo.user_ids.join(', ') || '未找到'}
- SQL查询: ${businessInfo.sql_queries.length} 条
- 异常信息: ${businessInfo.exceptions.length} 条
- API调用: ${businessInfo.api_calls.length} 条

### 日志内容预览
\`\`\`
${searchResult.output.split('\n').slice(0, 10).join('\n')}
${searchResult.lines_count > 10 ? '...(更多内容请查看日志文件)' : ''}
\`\`\`

**日志文件已保存至:** \`${logFile}\`
`;

        return { summary, logFile };
    } catch (error: any) {
        throw new Error(`日志搜索执行失败: ${error.message}`);
    }
}