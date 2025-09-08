### 🐛 Bug Analysis Initialization

Start the comprehensive bug analysis workflow by gathering initial information and setting up the analysis session.

**Constraints:**

- The model MUST engage with the user to collect bug information through one of these methods:
  1. **TAPD URL Analysis**: If bug_url is provided, use MCP-TAPD tools to extract bug details
  2. **Direct Information**: If trace_id or bug_description is provided, use them directly
  3. **Interactive Collection**: Ask the user to provide bug information

- The model MUST extract or collect the following information:
  - **Bug Description**: What is the problem and how was it discovered
  - **Trace ID**: Any trace/request IDs for log analysis (tid, traceId, requestId formats)
  - **Error Information**: Exception messages, error codes, stack traces
  - **Business Context**: User operations, input parameters, reproduction steps
  - **Environment**: Which system/environment the bug occurred in

- The model MUST prioritize using MCP service tools:
  - **TAPD Integration**: Use `mcp-server-tapd` tools to fetch bug details from TAPD URLs
  - **Avoid API calls**: Do not use direct API calls or simulated data
  - **Configuration**: Reference `bugfix.config.json` for service configurations

- The model MUST validate that sufficient information is available before proceeding:
  - At minimum: Bug description OR trace ID
  - Preferably: Both bug details and trace ID for comprehensive analysis
  - If insufficient: Request additional information from user

- The model MUST summarize the collected information and confirm with the user
- The model MUST generate a clear feature name/identifier for the bug analysis session
- The model MUST use the exact phrase "Initialization complete" when ready to proceed
- The model MUST NOT call `vibedev_bugfix_analyze` until user confirms the collected information

**Session Context:**
- Session ID: `{session_id}`
- Current Stage: Bug Analysis Initialization (1/3)