# 🐛 Bug分析报告

**Bug ID**: {{bug_id}}  
**会话ID**: {{session_id}}  
**生成时间**: {{timestamp}}

> Bug ID 从TAPD链接自动提取，确保与实际bug记录一致。

## 📋 Bug基本信息
- **Bug ID**: {{bug_id}} (从TAPD获取)
- **TraceId**: {{trace_id}}
- **用户信息**: {{user_info}} (custNo等)
- **业务场景**: {{business_scenario}} (具体操作场景)

## 🔍 接口入参
{{interface_params}}
*从Bug描述和日志中提取的完整请求参数*

## 📊 相关日志分析
{{log_analysis}}
*TraceId关联的完整日志链路和关键业务数据*

## 🗃️ 相关表数据
{{table_data}}
*基于业务分析查询的数据库表数据*

## 🌐 外部接口返回信息
{{external_api_response}}
*第三方服务调用的响应信息*

## ⚠️ 问题定位
- **问题代码位置**: {{problem_location}} (具体类名和行号)
- **可能原因**: {{possible_cause}} (根据日志和数据分析的原因)
- **影响范围**: {{impact_scope}} (问题影响分析)

## 💡 修复建议
{{fix_suggestions}}
*具体的修复方案和后续步骤*

---

## 📁 相关文件

所有分析过程中生成的文件都保存在固定的目录结构中：

- **会话信息**: `.vibedev/bugfix/{{bug_id}}/session.json`
- **项目分析**: `.vibedev/bugfix/{{bug_id}}/analysis/project_config_*.json`
- **分析报告**: `.vibedev/bugfix/{{bug_id}}/analysis/analysis_*.md`
- **日志文件**: `.vibedev/bugfix/{{bug_id}}/logs/logs_*.txt`
- **最终报告**: `.vibedev/bugfix/{{bug_id}}/reports/bugfix_report_*.md`

```
.vibedev/bugfix/{{bug_id}}/
├── session.json          # 会话元数据
├── analysis/             # 分析结果和配置文件
├── logs/                 # 日志文件
└── reports/              # 分析报告
```

## 📝 分析说明

本报告基于以下数据源生成：
1. TAPD Bug信息
2. 系统日志分析
3. 数据库查询结果
4. 代码静态分析

## 🔄 后续步骤

1. **验证分析结果**: 请开发团队验证问题定位的准确性
2. **实施修复方案**: 按照修复建议进行代码修改
3. **测试验证**: 在测试环境验证修复效果
4. **生产部署**: 确认无误后部署到生产环境

## ⚠️ 注意事项

- 本分析基于当前可获取的信息，可能需要进一步的人工验证
- 修复建议仅供参考，请结合实际业务逻辑进行调整
- 如有疑问，请联系相关开发人员进行确认