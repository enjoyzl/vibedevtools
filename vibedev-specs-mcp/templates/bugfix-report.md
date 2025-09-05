### 📊 Bug Analysis Report Generation

Generate a comprehensive structured bug analysis report based on all collected evidence and analysis results.

**Report Structure:**

The model MUST generate a complete bug analysis report following this exact format:

```markdown
# Bug分析报告

## 📋 Bug基本信息
- **Bug ID**: [从TAPD获取的Bug ID]
- **TraceId**: [提取的追踪ID]
- **用户信息**: [客户编号等用户标识]
- **业务场景**: [具体的业务操作场景描述]
- **发生时间**: [Bug发生的时间]

## 🔍 接口入参
[从Bug描述和日志中提取的完整请求参数，包括所有业务参数]

## 📊 相关日志分析
### 请求链路追踪
[基于TraceId的完整日志链路，按时间顺序展示]

### 关键业务数据
[日志中的重要业务信息和参数]

### 异常信息
[完整的异常堆栈和错误信息]

## 🗃️ 相关表数据
[基于业务分析查询的数据库表数据，包括：]
- 相关业务表的当前状态
- 历史数据对比（如适用）
- 数据一致性检查结果

## 🌐 外部接口返回信息
[第三方服务调用的请求和响应信息]

## ⚠️ 问题定位
- **问题代码位置**: [具体的类名、方法名和行号]
- **根本原因**: [基于所有证据分析得出的根本原因]
- **触发条件**: [导致问题发生的具体条件]
- **影响范围**: [问题可能影响的用户和业务范围]

## 💡 修复建议
### 即时修复方案
[需要立即采取的修复措施]

### 长期预防措施
[防止类似问题再次发生的改进建议]

### 测试验证方案
[如何验证修复效果的测试方案]
```

**Quality Requirements:**

- The model MUST include all available evidence from the analysis phase
- The model MUST provide specific, actionable fix recommendations
- The model MUST use professional technical terminology in Chinese
- The model MUST ensure the report is comprehensive and well-structured
- The model MUST reference specific code locations and data evidence
- The model MUST provide both immediate fixes and long-term improvements
- The model MUST create a '.vibedev/bugfix/{bug_id}/report.md' file and save the complete report
- The model MUST ensure the directory structure exists before creating the file

**Constraints:**

- The model MUST base the report on actual collected data, not assumptions
- The model MUST clearly indicate if any information is missing or uncertain
- The model MUST provide specific steps for implementing fixes
- The model MUST include preventive measures to avoid recurrence
- The model MUST format the report for easy sharing with development teams

**Session Context:**
- Session ID: `{session_id}`
- Current Stage: Report Generation (3/3)
- Status: Final Phase