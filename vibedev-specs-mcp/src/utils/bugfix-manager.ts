import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

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

}