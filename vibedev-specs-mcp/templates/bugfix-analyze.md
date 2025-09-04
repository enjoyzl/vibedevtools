# 🔍 Bug分析进行中

**Bug ID**: {{bug_id}}  
**会话ID**: {{session_id}}

> Bug ID 从TAPD链接自动提取: {{bug_url}}

## 📋 分析信息
- **Bug链接**: {{bug_url}}
- **TraceId**: {{trace_id}}
- **问题描述**: {{description}}

## 🤖 自动分析结果

{{analysis_result}}

## 📁 固定文件结构

分析过程中的所有文件都保存在固定的目录结构中：

- **会话信息**: `.vibedev/bugfix/{{bug_id}}/session.json`
- **项目分析**: `.vibedev/bugfix/{{bug_id}}/analysis/project_config_*.json`
- **分析报告**: `.vibedev/bugfix/{{bug_id}}/analysis/analysis_*.md`
- **日志文件**: `.vibedev/bugfix/{{bug_id}}/logs/logs_*.txt`
- **最终报告**: `.vibedev/bugfix/{{bug_id}}/reports/bugfix_report_*.md`

## 📝 分析约束

**模型必须遵循以下约束:**

- 模型必须将项目分析结果保存到 `.vibedev/bugfix/{{bug_id}}/analysis/project_config_*.json`
- 模型必须将分析报告保存到 `.vibedev/bugfix/{{bug_id}}/analysis/analysis_*.md`
- 如果提供了TraceId，模型必须将日志文件保存到 `.vibedev/bugfix/{{bug_id}}/logs/logs_*.txt`
- 模型必须在分析完成后询问用户是否需要生成最终报告
- 模型不应该自动进入报告生成阶段，除非用户明确确认

## 📝 分析指导

基于提供的信息，建议按照以下步骤进行深入分析：

### 1. 🎯 信息提取
从bug描述和TAPD链接中提取：
- TraceId或其他追踪标识
- 用户信息（custNo、hboneNo等）
- 业务场景和操作步骤
- 错误信息和异常堆栈

### 2. 🔍 日志分析
使用TraceId搜索相关日志：
- 接口调用链路
- SQL执行记录
- 外部接口调用
- 异常堆栈信息
- **保存位置**: `.vibedev/bugfix/{{bug_id}}/logs/logs_*.txt`

### 3. 🗃️ 数据查询
根据日志分析结果查询相关表：
- 用户相关数据
- 业务数据状态
- 交易记录
- 配置信息

### 4. 🎯 问题定位
结合代码分析：
- 定位问题代码位置
- 分析可能原因
- 评估影响范围

## 🚀 下一步操作

1. **如果自动分析完成**: 模型必须询问 "分析结果看起来如何？如果满意，我们可以生成最终的bug分析报告。"
2. **如果需要更多信息**: 请提供额外的bug详情
3. **如果需要手动执行某些步骤**: 我会提供具体的命令和指导

**重要**: 模型必须等待用户明确确认后才能使用 `vibedev_bugfix_report` 生成最终报告。