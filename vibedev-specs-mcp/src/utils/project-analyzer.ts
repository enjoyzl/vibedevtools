import * as fs from 'fs';
import * as path from 'path';

export interface ProjectConfig {
  projectInfo: {
    name: string;
    analyzedAt: string;
    totalRepositories: number;
    totalServices: number;
  };
  repositoryMapping: Record<string, string>;
  serviceMapping: Record<string, ServiceInfo>;
  businessScenarios: BusinessScenario[];
  extractionPatterns: {
    traceIdPatterns: string[];
    userIdFields: string[];
  };
  databaseQueries: Record<string, QueryTemplates>;
}

export interface ServiceInfo {
  description: string;
  tables: string[];
  businessType: string;
  repositories: string[];
}

export interface BusinessScenario {
  scenario: string;
  relatedServices: string[];
  coreTables: string[];
  commonIssues: string[];
}

export interface QueryTemplates {
  basicQuery: string;
  countQuery: string;
  timeRangeQuery: string;
}

export class ProjectAnalyzer {
  private projectRoot: string;
  private repositoryMapping: Record<string, string> = {};
  private serviceMapping: Record<string, ServiceInfo> = {};
  private businessScenarios: BusinessScenario[] = [];
  private traceIdPatterns: string[] = [];
  private userIdFields: string[] = [];

  constructor(projectRoot: string = '.') {
    if (!projectRoot) {
      projectRoot = '.';
    }
    try {
      this.projectRoot = path.resolve(projectRoot);
      if (!this.projectRoot) {
        this.projectRoot = process.cwd();
      }
    } catch (error) {
      console.error(`Failed to resolve project root path: ${error}`);
      this.projectRoot = process.cwd();
    }
  }

  async analyzeProject(): Promise<ProjectConfig> {
    console.log('Starting project structure analysis...');
    
    // 1. Scan Repository classes
    await this.scanRepositories();
    
    // 2. Scan Service classes
    await this.scanServices();
    
    // 3. Analyze business scenarios
    this.analyzeBusinessScenarios();
    
    // 4. Extract TraceId patterns
    this.extractTracePatterns();
    
    // 5. Extract user identifier fields
    this.extractUserFields();
    
    return this.buildConfig();
  }

  private async scanRepositories(): Promise<void> {
    console.log('Scanning Repository classes...');
    
    const repoFiles = await this.findFiles('**/*Repository.java');
    
    for (const repoFile of repoFiles) {
      try {
        const content = await fs.promises.readFile(repoFile, 'utf-8');
        
        // Extract class name
        const classMatch = content.match(/class\s+(\w*Repository)/);
        if (classMatch) {
          const className = classMatch[1];
          
          // Infer table name
          const tableName = this.inferTableName(className, content);
          if (tableName) {
            this.repositoryMapping[className] = tableName;
          }
        }
      } catch (error) {
        console.error(`Failed to process Repository file ${repoFile}:`, error);
      }
    }
  }

  private inferTableName(className: string, content: string): string | null {
    // Method 1: Find @Table annotation
    const tableMatch = content.match(/@Table\s*\(\s*name\s*=\s*"([^"]+)"/);
    if (tableMatch) {
      return tableMatch[1];
    }
    
    // Method 2: Find table name in SQL
    const sqlPatterns = [
      /FROM\s+(\w+)/gi,
      /UPDATE\s+(\w+)/gi,
      /INSERT\s+INTO\s+(\w+)/gi,
      /DELETE\s+FROM\s+(\w+)/gi
    ];
    
    for (const pattern of sqlPatterns) {
      const matches = Array.from(content.matchAll(pattern));
      if (matches.length > 0) {
        // Return most common table name
        const tableNames = matches.map(m => m[1]);
        const counts = tableNames.reduce((acc, name) => {
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      }
    }
    
    // Method 3: Infer from class name (TpDealRepository -> tp_deal)
    if (className.endsWith('Repository')) {
      const baseName = className.slice(0, -10); // Remove Repository suffix
      // Convert camelCase to snake_case
      const tableName = baseName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
      return tableName;
    }
    
    return null;
  }

  private async scanServices(): Promise<void> {
    console.log('Scanning Service classes...');
    
    const serviceFiles = await this.findFiles('**/*Service.java');
    
    for (const serviceFile of serviceFiles) {
      try {
        const content = await fs.promises.readFile(serviceFile, 'utf-8');
        
        // Extract class name
        const classMatch = content.match(/class\s+(\w*Service)/);
        if (classMatch) {
          const className = classMatch[1];
          
          // Analyze business function
          const serviceInfo = this.analyzeService(className, content);
          if (serviceInfo) {
            this.serviceMapping[className] = serviceInfo;
          }
        }
      } catch (error) {
        console.error(`Failed to process Service file ${serviceFile}:`, error);
      }
    }
  }

  private analyzeService(className: string, content: string): ServiceInfo | null {
    const serviceInfo: ServiceInfo = {
      description: '',
      tables: [],
      businessType: '',
      repositories: []
    };
    
    // Extract class comment as description
    const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n*]+)/);
    if (commentMatch) {
      serviceInfo.description = commentMatch[1].trim();
    }
    
    // Infer business type
    serviceInfo.businessType = this.inferBusinessType(className);
    
    // Find used Repository
    const repoMatches = Array.from(content.matchAll(/@Autowired[^;]*?(\w*Repository)/gs));
    serviceInfo.repositories = [...new Set(repoMatches.map(m => m[1]))];
    
    // Infer related tables based on Repository
    for (const repo of serviceInfo.repositories) {
      if (this.repositoryMapping[repo]) {
        serviceInfo.tables.push(this.repositoryMapping[repo]);
      }
    }
    
    return serviceInfo;
  }

  private inferBusinessType(className: string): string {
    const businessKeywords: Record<string, string> = {
      'Query': 'query',
      'Create': 'create',
      'Update': 'update',
      'Delete': 'delete',
      'Payment': 'payment',
      'Subs': 'deposit',
      'Holdings': 'holdings',
      'Trade': 'trade',
      'Order': 'order',
      'Validate': 'validate',
      'Migrate': 'migrate'
    };
    
    for (const [keyword, chinese] of Object.entries(businessKeywords)) {
      if (className.toLowerCase().includes(keyword.toLowerCase())) {
        return chinese;
      }
    }
    
    return 'unknown';
  }

  private analyzeBusinessScenarios(): void {
    console.log('Analyzing business scenarios...');
    
    // Analyze business scenarios based on Service grouping
    const scenarioGroups: Record<string, BusinessScenario> = {};
    
    for (const [serviceName, serviceInfo] of Object.entries(this.serviceMapping)) {
      const businessType = serviceInfo.businessType;
      
      if (!scenarioGroups[businessType]) {
        scenarioGroups[businessType] = {
          scenario: businessType,
          relatedServices: [],
          coreTables: [],
          commonIssues: []
        };
      }
      
      scenarioGroups[businessType].relatedServices.push(serviceName);
      scenarioGroups[businessType].coreTables.push(...serviceInfo.tables);
    }
    
    // Add common issues
    const issueMapping: Record<string, string[]> = {
      'payment': ['payment status error', 'amount calculation error', 'freeze/unfreeze failed'],
      'deposit': ['amount calculation error', 'transaction status error', 'share calculation error'],
      'query': ['data inconsistency', 'query timeout', 'permission validation failed'],
      'holdings': ['share calculation error', 'profit calculation error', 'data delay']
    };
    
    for (const [scenarioType, scenario] of Object.entries(scenarioGroups)) {
      scenario.coreTables = [...new Set(scenario.coreTables)];
      scenario.commonIssues = issueMapping[scenarioType] || ['unknown issue'];
      this.businessScenarios.push(scenario);
    }
  }

  private extractTracePatterns(): void {
    console.log('Extracting TraceId patterns...');
    
    // Common TraceId patterns
    this.traceIdPatterns = [
      'traceId[=:\\s]+([a-f0-9]{32})',
      'trace-id[=:\\s]+([a-f0-9-]{36})',
      'requestId[=:\\s]+([a-f0-9]{32})',
      'tid[=:\\s]+([a-f0-9]{32})',
      'X-Trace-Id[=:\\s]+([a-f0-9-]{36})'
    ];
  }

  private extractUserFields(): void {
    console.log('Extracting user identifier fields...');
    
    // Common user identifier fields
    this.userIdFields = [
      'custNo',
      'hboneNo',
      'customerId',
      'userId',
      'userNo',
      'clientId',
      'accountId'
    ];
  }

  private buildConfig(): ProjectConfig {
    return {
      projectInfo: {
        name: path.basename(this.projectRoot),
        analyzedAt: new Date().toISOString(),
        totalRepositories: Object.keys(this.repositoryMapping).length,
        totalServices: Object.keys(this.serviceMapping).length
      },
      repositoryMapping: this.repositoryMapping,
      serviceMapping: this.serviceMapping,
      businessScenarios: this.businessScenarios,
      extractionPatterns: {
        traceIdPatterns: this.traceIdPatterns,
        userIdFields: this.userIdFields
      },
      databaseQueries: this.generateQueryTemplates()
    };
  }

  private generateQueryTemplates(): Record<string, QueryTemplates> {
    const templates: Record<string, QueryTemplates> = {};
    
    // Generate basic query templates for each table
    for (const [repo, table] of Object.entries(this.repositoryMapping)) {
      templates[table] = {
        basicQuery: `SELECT * FROM ${table} WHERE {condition} LIMIT 10`,
        countQuery: `SELECT COUNT(*) FROM ${table} WHERE {condition}`,
        timeRangeQuery: `SELECT * FROM ${table} WHERE created_time >= '{start_time}' AND created_time <= '{end_time}' LIMIT 20`
      };
    }
    
    return templates;
  }

  async saveConfig(outputPath?: string): Promise<ProjectConfig> {
    if (!outputPath) {
      outputPath = path.join(this.projectRoot, 'bugfix.project.auto.json');
    }
    
    const config = this.buildConfig();
    
    // Create directory if not exists
    const outputDir = path.dirname(outputPath);
    if (outputDir && outputDir !== '.') {
      await fs.promises.mkdir(outputDir, { recursive: true });
    }
    
    await fs.promises.writeFile(outputPath, JSON.stringify(config, null, 2), 'utf-8');
    
    console.log(`Project configuration saved to: ${outputPath}`);
    return config;
  }

  private async findFiles(pattern: string): Promise<string[]> {
    const files: string[] = [];
    
    const walkDir = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            await walkDir(fullPath);
          } else if (entry.isFile()) {
            // Simple pattern matching for Java files
            if (pattern.includes('Repository.java') && entry.name.endsWith('Repository.java')) {
              files.push(fullPath);
            } else if (pattern.includes('Service.java') && entry.name.endsWith('Service.java')) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Ignore directories we can't read
      }
    };
    
    await walkDir(this.projectRoot);
    return files;
  }
}