import { mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export interface BugfixSession {
  bugId: string;
  sessionId: string;
  traceId?: string;
  bugUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export class BugfixManager {
  private basePath: string;
  
  constructor() {
    this.basePath = '.vibedev/bugfix';
  }

  /**
   * Create bugfix directory structure for a bug ID
   */
  async createBugfixDirectory(bugId: string): Promise<string> {
    const bugfixDir = join(this.basePath, bugId);
    
    // Create main directory
    await mkdir(bugfixDir, { recursive: true });
    
    // Create subdirectories
    await mkdir(join(bugfixDir, 'logs'), { recursive: true });
    await mkdir(join(bugfixDir, 'analysis'), { recursive: true });
    await mkdir(join(bugfixDir, 'reports'), { recursive: true });
    
    return bugfixDir;
  }

  /**
   * Save bugfix session metadata
   */
  async saveBugfixSession(session: BugfixSession): Promise<void> {
    const bugfixDir = await this.createBugfixDirectory(session.bugId);
    const sessionPath = join(bugfixDir, 'session.json');
    
    await writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');
  }

  /**
   * Load bugfix session metadata
   */
  async loadBugfixSession(bugId: string): Promise<BugfixSession | null> {
    const sessionPath = join(this.basePath, bugId, 'session.json');
    
    if (!existsSync(sessionPath)) {
      return null;
    }
    
    try {
      const content = await readFile(sessionPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load bugfix session: ${error}`);
      return null;
    }
  }

  /**
   * Save analysis result
   */
  async saveAnalysis(bugId: string, filename: string, content: string): Promise<string> {
    const bugfixDir = await this.createBugfixDirectory(bugId);
    const analysisPath = join(bugfixDir, 'analysis', filename);
    
    await writeFile(analysisPath, content, 'utf-8');
    return analysisPath;
  }

  /**
   * Save log file
   */
  async saveLogFile(bugId: string, filename: string, content: string): Promise<string> {
    const bugfixDir = await this.createBugfixDirectory(bugId);
    const logPath = join(bugfixDir, 'logs', filename);
    
    await writeFile(logPath, content, 'utf-8');
    return logPath;
  }

  /**
   * Save report
   */
  async saveReport(bugId: string, filename: string, content: string): Promise<string> {
    const bugfixDir = await this.createBugfixDirectory(bugId);
    const reportPath = join(bugfixDir, 'reports', filename);
    
    await writeFile(reportPath, content, 'utf-8');
    return reportPath;
  }

  /**
   * Get bugfix directory path
   */
  getBugfixPath(bugId: string): string {
    return join(this.basePath, bugId);
  }

  /**
   * Extract bug ID from TAPD URL
   * 支持的URL格式:
   * - https://www.tapd.cn/tapd_fe/55014084/bug/detail/1155014084001047319
   * - https://tapd.cn/55014084/bug/detail/1155014084001047319
   */
  static extractBugIdFromUrl(bugUrl: string): string | null {
    if (!bugUrl) return null;
    
    // 匹配TAPD bug URL中的bug ID
    const patterns = [
      /\/bug\/detail\/(\d+)/,  // 标准格式
      /\/bugtrace\/bugs\/view\/(\d+)/, // 另一种格式
      /bug_id[=:](\d+)/i,      // 参数格式
    ];
    
    for (const pattern of patterns) {
      const match = bugUrl.match(pattern);
      if (match && match[1]) {
        return `bug_${match[1]}`;
      }
    }
    
    return null;
  }

  /**
   * Generate bug ID from TAPD URL or fallback to session-based ID
   */
  static generateBugId(sessionId: string, bugUrl?: string): string {
    // 首先尝试从TAPD URL提取bug ID
    if (bugUrl) {
      const extractedId = this.extractBugIdFromUrl(bugUrl);
      if (extractedId) {
        return extractedId;
      }
    }
    
    // 如果无法从URL提取，则使用session ID和时间戳生成
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `bug_${timestamp}_${sessionId.slice(-6)}`;
  }
}