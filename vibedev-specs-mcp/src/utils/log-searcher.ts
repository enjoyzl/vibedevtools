import * as fs from 'fs';
import { spawn } from 'child_process';

export interface LogSearchConfig {
  logServer: {
    host: string;
    username: string;
    password: string;
    baseDirectory: string;
    port: string;
    timeout: string;
  };
  database: {
    host: string;
    port: string;
    username: string;
    password: string;
    database: string;
    connectionTimeout: string;
  };
  searchOptions: {
    maxLines: string;
    contextLines: string;
    caseInsensitive: string;
    includeTimestamp: string;
    tidLength: string;
  };
}

export interface SearchResult {
  trace_id: string;
  command: string;
  output: string;
  lines_count: number;
  timestamp: string;
  error?: string;
}

export interface BusinessInfo {
  sql_queries: string[];
  exceptions: string[];
  api_calls: string[];
  user_params: Record<string, any>;
  user_ids: string[];
}

export class LogSearcher {
  private config: LogSearchConfig;

  constructor(configPath: string = './bugfix.config.json') {
    this.config = this.loadConfig(configPath);
  }

  private loadConfig(configPath: string): LogSearchConfig {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`配置文件 ${configPath} 不存在或格式错误: ${error.message}`);
      }
      throw error;
    }
  }

  async connect(): Promise<boolean> {
    try {
      const logConfig = this.config.logServer;
      console.log(`Testing connection to log server: ${logConfig.host}`);
      
      // Test SSH connection using ssh command
      const testResult = await this.executeSSHCommand('echo "connection test"');
      
      if (testResult.error) {
        console.error(`Failed to connect to log server: ${testResult.error}`);
        return false;
      }
      
      console.log(`Successfully connected to log server: ${logConfig.host}`);
      return true;
    } catch (error) {
      console.error(`Failed to connect to log server: ${error}`);
      return false;
    }
  }

  async searchByTraceId(traceId: string): Promise<SearchResult> {
    const logConfig = this.config.logServer;
    const searchConfig = this.config.searchOptions;
    
    const baseDir = logConfig.baseDirectory || '/logs/';
    const maxLines = parseInt(searchConfig.maxLines) || 1000;
    const contextLines = parseInt(searchConfig.contextLines) || 3;
    
    // 构建搜索命令
    let searchCmd = 'grep -r';
    if (searchConfig.caseInsensitive === 'true') {
      searchCmd += ' -i';
    }
    if (contextLines > 0) {
      searchCmd += ` -A ${contextLines} -B ${contextLines}`;
    }
    
    searchCmd += ` '${traceId}' ${baseDir}*.log | head -${maxLines}`;
    
    console.log(`Searching TraceId: ${traceId}`);
    console.log(`Search directory: ${baseDir}`);
    
    const result = await this.executeSSHCommand(searchCmd);
    
    return {
      trace_id: traceId,
      command: searchCmd,
      output: result.output,
      lines_count: result.output ? result.output.split('\n').length : 0,
      timestamp: new Date().toISOString(),
      error: result.error
    };
  }

  extractBusinessInfo(logContent: string): BusinessInfo {
    const businessInfo: BusinessInfo = {
      sql_queries: [],
      exceptions: [],
      api_calls: [],
      user_params: {},
      user_ids: []
    };
    
    const lines = logContent.split('\n');
    
    for (const line of lines) {
      // 提取SQL查询
      if (/SELECT|INSERT|UPDATE|DELETE/i.test(line)) {
        businessInfo.sql_queries.push(line.trim());
      }
      
      // 提取异常信息
      if (/Exception|Error|ERROR/i.test(line)) {
        businessInfo.exceptions.push(line.trim());
      }
      
      // 提取API调用
      if (/http:\/\/|https:\/\/|API|api/i.test(line)) {
        businessInfo.api_calls.push(line.trim());
      }
      
      // 提取用户ID
      const userIdMatches = line.match(/(custNo|hboneNo)[=:]?\s*(\d+)/gi);
      if (userIdMatches) {
        businessInfo.user_ids.push(...userIdMatches.map(match => 
          match.replace(/custNo[=:]?\s*/i, '')
        ));
      }
    }
    
    // 去重
    businessInfo.user_ids = [...new Set(businessInfo.user_ids)];
    
    return businessInfo;
  }

  async disconnect(): Promise<void> {
    // No persistent connection to close
    console.log('SSH session completed');
  }

  private async executeSSHCommand(command: string): Promise<{ output: string; error?: string }> {
    return new Promise((resolve) => {
      const logConfig = this.config.logServer;
      
      // Build SSH command
      const sshCmd = [
        'ssh',
        '-p', logConfig.port || '22',
        '-o', 'StrictHostKeyChecking=no',
        '-o', `ConnectTimeout=${logConfig.timeout || '30'}`,
        `${logConfig.username}@${logConfig.host}`,
        command
      ];
      
      const child = spawn(sshCmd[0], sshCmd.slice(1), {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          SSHPASS: logConfig.password
        }
      });
      
      let output = '';
      let error = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString('utf-8');
      });
      
      child.stderr.on('data', (data) => {
        error += data.toString('utf-8');
      });
      
      child.on('close', (code) => {
        if (code !== 0 && error) {
          resolve({ output: '', error: error });
        } else {
          resolve({ output: output });
        }
      });
      
      child.on('error', (err) => {
        resolve({ output: '', error: err.message });
      });
    });
  }

  async saveLogToFile(traceId: string, logContent: string, bugfixManager?: any, bugId?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `logs_${traceId}_${timestamp}.txt`;
    
    // If bugfix manager is provided, save to bugfix directory
    if (bugfixManager && bugId) {
      return await bugfixManager.saveLogFile(bugId, filename, logContent);
    }
    
    // Fallback to current directory
    await fs.promises.writeFile(filename, logContent, 'utf-8');
    console.log(`Complete log saved to: ${filename}`);
    
    return filename;
  }

  async searchAndAnalyze(traceId: string, bugfixManager?: any, bugId?: string): Promise<{
    searchResult: SearchResult;
    businessInfo: BusinessInfo;
    logFile?: string;
  }> {
    const searchResult = await this.searchByTraceId(traceId);
    
    if (searchResult.error) {
      console.error(`Search failed: ${searchResult.error}`);
      return { searchResult, businessInfo: this.extractBusinessInfo('') };
    }
    
    console.log(`Search result: Found ${searchResult.lines_count} lines of logs`);
    
    let logFile: string | undefined;
    let businessInfo: BusinessInfo;
    
    if (searchResult.output) {
      // 保存完整日志到文件 (使用bugfix目录结构)
      logFile = await this.saveLogToFile(traceId, searchResult.output, bugfixManager, bugId);
      
      // 显示前5行日志内容作为预览
      const lines = searchResult.output.split('\n');
      console.log('\nLog content preview (first 5 lines):');
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        console.log(`  ${i + 1}: ${lines[i].substring(0, 150)}`);
      }
      
      // 提取业务信息
      businessInfo = this.extractBusinessInfo(searchResult.output);
      
      console.log('\nExtracted business information:');
      console.log(`  User IDs: ${businessInfo.user_ids.join(', ')}`);
      console.log(`  SQL queries: ${businessInfo.sql_queries.length}`);
      console.log(`  Exceptions: ${businessInfo.exceptions.length}`);
      console.log(`  API calls: ${businessInfo.api_calls.length}`);
    } else {
      console.log('No relevant logs found');
      businessInfo = this.extractBusinessInfo('');
    }
    
    return { searchResult, businessInfo, logFile };
  }
}

