# VibeSpecs MCP 服务器

一个 AI 驱动的开发工作流 MCP 服务器，指导你从需求到代码实现的完整过程。

## 特性

- **完整的开发工作流**：从目标收集到任务执行
- **AI 驱动的指导**：每个开发阶段的逐步指导
- **基于模板**：使用经过验证的需求、设计和任务模板
- **Claude 集成**：与 Claude Code 无缝集成

## 安装

### 使用 npx（推荐）

```bash
# 总是获取最新版本
npx vibedev-specs-mcp@latest

# 或者简写（也会获取最新版本）
npx vibedev-specs-mcp
```

### 使用 npm

```bash
npm install -g vibedev-specs-mcp
vibedev-specs-mcp
```

## 使用方法

### 配置 Claude Code

在你的 Claude Code MCP 设置中添加：

```json
{
  "mcpServers": {
    "vibedev-specs": {
      "command": "npx",
      "args": ["vibedev-specs-mcp@latest"],
      "env": {},
      "disabled": false
    }
  }
}
```

### 可用工具

1. **vibedev_specs_workflow_start** - 启动开发工作流
2. **vibedev_specs_goal_confirmed** - 确认功能目标
3. **vibedev_specs_requirements_start** - 开始需求收集
4. **vibedev_specs_requirements_confirmed** - 确认需求收集完成
5. **vibedev_specs_design_start** - 开始设计文档
6. **vibedev_specs_design_confirmed** - 确认设计完成
7. **vibedev_specs_tasks_start** - 开始任务规划
8. **vibedev_specs_tasks_confirmed** - 确认任务规划完成
9. **vibedev_specs_execute_start** - 开始任务执行

### Bug分析工具

10. **vibedev_bugfix_start** - 启动Bug分析工作流
11. **vibedev_bugfix_analyze** - 执行综合Bug分析
12. **vibedev_bugfix_report** - 生成Bug分析报告

## 配置说明

### Bug分析配置

Bug分析工具支持灵活的配置文件路径设置：

**配置文件路径选项：**
- 默认: `bugfix.config.json` (项目根目录)
- 环境变量: `BUGFIX_CONFIG_PATH=/path/to/config.json`
- 相对路径: `./config/production.json`
- 绝对路径: `/etc/bugfix/config.json` 或 `C:\\configs\\bugfix.json`

**配置示例：**
参考 `bugfix.config.json` 文件查看完整的配置结构。

## 工作流阶段

### 开发工作流

1. **目标收集** - 定义你想要构建的功能
2. **需求收集** - 创建详细的 EARS 格式需求
3. **设计文档** - 技术架构和设计
4. **任务规划** - 分解为可执行的任务
5. **任务执行** - 实现代码

### Bug分析工作流

1. **Bug信息收集** - 从 TAPD 或手动输入收集 Bug 详情
2. **综合分析** - 日志搜索、代码分析和数据库查询
3. **报告生成** - 生成结构化的 Bug 分析报告

## 使用示例

以下是使用 VibeSpecs 工作流的完整示例：

### 1. 启动工作流
```
用户：我想构建一个用户认证功能
助手：让我为你启动 VibeSpecs 工作流。
[调用 vibedev_specs_workflow_start]
```

### 2. 目标收集
```
助手：欢迎使用 VibeSpecs！让我们定义你的功能目标：

1. 你想支持哪些具体的认证方式？
2. 需要社交登录（Google、GitHub 等）吗？
3. 需要什么用户角色和权限？

用户：我需要邮箱/密码登录，JWT 令牌，还有 Google OAuth，以及基本的用户/管理员角色。

助手：完美！让我确认一下：
- 功能：用户认证系统
- 方式：邮箱/密码 + Google OAuth
- 令牌：基于 JWT
- 角色：用户和管理员
- 功能名称："user-authentication"

这样对吗？
用户：是的，这正是我需要的。

[调用 vibedev_specs_goal_confirmed，feature_name="user-authentication"]
```

### 3. 需求收集
```
助手：太好了！现在让我们收集详细的需求。
[调用 vibedev_specs_requirements_start]

[助手在 .vibedev/specs/user-authentication/requirements.md 中生成详细的 EARS 格式需求]

用户：需求看起来很全面。通过！

[调用 vibedev_specs_requirements_confirmed]
```

### 4. 设计文档
```
助手：现在让我们创建技术设计。
[调用 vibedev_specs_design_start]

[助手创建包含架构、组件、数据模型等的详细设计文档]

用户：设计看起来不错，继续！

[调用 vibedev_specs_design_confirmed]
```

### 5. 任务规划
```
助手：让我们将其分解为可执行的任务。
[调用 vibedev_specs_tasks_start]

[助手创建带有优先级和依赖关系的编号任务列表]

用户：任务分解很完美！

[调用 vibedev_specs_tasks_confirmed]
```

### 6. 任务执行
```
助手：开始实现！让我们开始编码。
[调用 vibedev_specs_execute_start]

[助手开始按计划逐一实现任务]
```

### 生成的项目结构
```
.vibedev/specs/user-authentication/
├── requirements.md    # EARS 格式需求
├── design.md         # 技术架构
└── tasks.md          # 实现清单
```

## Bug分析工具使用示例

### 1. 启动Bug分析
```
用户：我遇到了一个用户登录失败的问题
助手：让我为您启动Bug分析流程。
[调用 vibedev_bugfix_start]
```

### 2. 信息收集
```
助手：请提供以下信息：
1. TAPD Bug链接或Bug描述
2. Trace ID或请求ID
3. 错误信息和堆栈跟踪
4. 业务场景和复现步骤

用户：
- TAPD: https://tapd.example.com/bug/123456
- Trace ID: tid_abc123def456
- 错误：用户登录时返回500错误
- 场景：用户输入正确的邮箱和密码后点击登录按钮

助手：信息收集完成，现在开始综合分析。
[调用 vibedev_bugfix_analyze 带上 trace_id]
```

### 3. 综合分析
```
助手：正在执行综合分析...

1. 使用 mcp-server-tapd 获取详细Bug信息
2. 通过 SSH 连接日志服务器搜索 tid_abc123def456
3. 分析日志中的SQL执行和异常堆栈
4. 使用 mcp-mysql-server 查询相关数据库表
5. 综合分析定位问题原因

分析完成！发现问题原因是数据库连接超时。
[调用 vibedev_bugfix_report]
```

### 4. 报告生成
```
助手：正在生成结构化的Bug分析报告...

报告包含：
- 问题概述和影响范围
- 根因分析和证据链
- 修复建议和预防措施
- 相关代码位置和数据库查询结果

报告已生成完成！
```

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。