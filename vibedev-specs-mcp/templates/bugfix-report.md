### 📊 Bug Analysis Report Generation

Generate a comprehensive structured bug analysis report based on all collected evidence and analysis results.

**Report Structure:**

The model MUST generate a complete bug analysis report following this exact format:

```markdown
# Bug Analysis Report

## 📋 Basic Bug Information
- **Bug ID**: [Bug ID retrieved from TAPD]
- **TraceId**: [Extracted trace ID]
- **User Information**: [Customer ID and other user identifiers]
- **Business Scenario**: [Specific business operation scenario description]
- **Occurrence Time**: [Time when the bug occurred]

## 🔍 Interface Input Parameters
[Complete request parameters extracted from bug description and logs, including all business parameters]

## 📊 Related Log Analysis
### Request Chain Tracing
[Complete log chain based on TraceId, displayed in chronological order]

### Key Business Data
[Important business information and parameters from logs]

### Exception Information
[Complete exception stack trace and error information]

## 🗃️ Related Table Data
[Database table data queried based on business analysis, including:]
- Current state of related business tables
- Historical data comparison (if applicable)
- Data consistency check results

## 🌐 External Interface Response Information
[Request and response information from third-party service calls]

## ⚠️ Problem Location
- **Problem Code Location**: [Specific class name, method name and line number]
- **Root Cause**: [Root cause derived from analysis of all evidence]
- **Trigger Conditions**: [Specific conditions that caused the problem]
- **Impact Scope**: [Users and business scope that may be affected by the problem]

## 💡 Fix Recommendations
### Immediate Fix Solution
[Remedial measures that need to be taken immediately]

### Long-term Prevention Measures
[Improvement suggestions to prevent similar problems from recurring]

### Test Verification Plan
[Test plan for how to verify the fix effectiveness]
```

**Quality Requirements:**

- The model MUST include all available evidence from the analysis phase
- The model MUST provide specific, actionable fix recommendations
- The model MUST use professional technical terminology in English
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