# Bug分析工作流指南

## 概述

vibedevtools包含完整的AI驱动Bug分析工作流，通过标准化流程自动化bug诊断和分析。该工作流集成了TAPD、日志服务器、数据库查询等多个系统。

## 核心组件

### 1. ChatMode配置
- **bugfix1.chatmode.md**: 完整的自动化Bug分析专家模式，包含项目结构自动分析
- **bugfix2.chatmode.md**: 简化版Bug分析模式
- 位置：`.github/chatmodes/`

### 2. MCP Server工具
- **vibedev_bugfix_start**: 启动bug分析工作流
- **vibedev_bugfix_analyze**: 执行综合bug分析
- **vibedev_bugfix_report**: 生成结构化分析报告

### 3. 配置文件
- **bugfix.config.json**: 环境配置（日志服务器、数据库连接等）
- **bugfix.project.auto.json**: 自动生成的项目结构映射（无需手动维护）

## 标准工作流程

### 第1步：Bug信息解析
- 从TAPD URL自动提取workspace_id和bug_id
- 使用TAPD MCP获取完整bug信息
- 提取关键信息：TraceId、用户信息、业务场景、错误信息

### 第2步：日志服务器搜索
**推荐方式 - SSH MCP Server**:
```bash
mcp_ssh-mpc-serve_execute-command
grep -r -A 10 -B 5 "${traceId}" {baseDirectory}*.log
```

**备选方式**:
```bash
ssh -p {port} {username}@{host}
grep -r -A 10 -B 5 "${traceId}" {baseDirectory}*.log
```

### 第3步：代码分析和表识别
- 通过日志中的类名定位Repository映射
- 从异常堆栈识别相关数据库表
- 根据业务场景确定相关Service类

### 第4步：数据库查询
- 使用MCP-MySQL-Server查询相关表数据
- 基于业务逻辑进行多表关联分析
- 从预定义查询模板构建查询条件

### 第5步：生成诊断报告
生成标准格式的中文分析报告，保存到`.vibedev/bugfix/{bug_id}/report.md`

## 配置要求

### 环境配置 (bugfix.config.json)
```json
{
  "logServer": {
    "host": "[LOG_SERVER_HOST]",
    "username": "[LOG_USERNAME]", 
    "password": "[LOG_PASSWORD]",
    "baseDirectory": "/path/to/logs/application/",
    "port": "22",
    "timeout": "30"
  },
  "database": {
    "host": "[DATABASE_HOST]",
    "port": "3306", 
    "username": "[DATABASE_USERNAME]",
    "password": "[DATABASE_PASSWORD]",
    "database": "[DATABASE_NAME]",
    "connectionTimeout": "30000"
  },
  "searchOptions": {
    "maxLines": "1000",
    "contextLines": "10", 
    "caseInsensitive": "true",
    "includeTimestamp": "true",
    "tidLength": "32"
  }
}
```

### 项目结构自动分析
- 运行 `python .github/chatmodes/project_analyzer.py` 自动生成项目映射
- 生成 `bugfix.project.auto.json` 包含：
  - Repository类到数据库表的映射关系
  - Service类的业务功能分析  
  - 业务场景和相关表的关联关系
  - TraceId提取模式
  - 用户标识字段模式

## 使用方式

### 标准输入格式
```
[traceId: abc123def456]
【业务功能问题描述，详见实际结果截图】
https://www.tapd.cn/tapd_fe/{workspace_id}/bug/detail/{bug_id}
```

### 输出报告格式
```markdown
# Bug分析报告

## 📋 Bug基本信息
## 🔍 接口入参  
## 📊 相关日志分析
## 🗃️ 相关表数据
## 🌐 外部接口返回信息
## ⚠️ 问题定位
## 💡 修复建议
```

## 安全约束

- 不执行可能影响生产环境的操作
- 不查询或修改敏感数据
- SSH连接使用只读权限，仅用于日志查询
- 所有数据库查询都进行安全性检查
- 敏感信息通过配置文件管理，不在代码中硬编码

## 响应风格

- **专业性**: 使用技术术语，提供精确的分析
- **结构化**: 按照固定格式输出，便于阅读和处理
- **可操作性**: 提供具体的修复建议和后续步骤
- **中文回复**: 所有回复使用中文
- **证据驱动**: 基于实际收集的数据，不做假设