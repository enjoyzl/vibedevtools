### 🔍 Comprehensive Bug Analysis

Perform systematic bug analysis using integrated MCP tools to identify root causes and collect evidence.

**Analysis Workflow:**

1. **TAPD Bug Information Extraction** (if bug URL provided)
   - Use `mcp-server-tapd` tools to get complete bug details
   - Extract trace IDs, error messages, and business context
   - Parse bug comments for additional technical information

2. **Log Search and Analysis** 
   - **Configuration**: Load connection details from {bugfix_config_file}
     - Read `logServer.host`, `logServer.username`, `logServer.password`
     - Read `logServer.baseDirectory` for log file location
     - Read `logServer.port` (default: 22)
   - **SSH Connection**: 
     - **Preferred**: Use SSH MCP server for log access
     - **Alternative**: Use terminal SSH connection to log server
   - **Search Strategy**: 
     ```bash
     # Method 1 (Preferred): Use SSH MCP Server
     # Call mcp_ssh-mpc-server_execute-command with grep command
     # First dynamically locate and load the configuration file
     # Search for *.config.json files in workspace or use default location
     
     # Method 2 (Alternative): Direct SSH connection
     # Example SSH command (replace with actual values from config):
     ssh -p [port] [username]@[hostname]
     
     # Example search command (replace [baseDirectory] with actual path from config):
     grep -r -A 10 -B 5 "{trace_id}" [baseDirectory]*.log
     ```
   - **Log Analysis Focus**:
     - Interface business input parameters
     - SQL execution records and parameters  
     - External API calls and responses
     - Exception stack traces and error locations

3. **Code Analysis and Database Queries**
   - **Code Location**: Use log stack traces to identify source code locations
   - **Table Identification**: Extract database table names from:
     - Exception stack traces
     - Repository class references
     - SQL execution logs
   - **Database Analysis**: Use `mcp-mysql-server` to query relevant table data
   - **Configuration**: Reference dynamic configuration file
     - Locate configuration file in workspace or use environment variable
     - Read `database.host`, `database.port`, `database.username`, `database.password`
     - Read `database.database` for target database name
     - Read `database.connectionTimeout` for connection settings

4. **Integrated Analysis**
   - Correlate log data with code structure
   - Analyze business data consistency
   - Identify potential root causes
   - Document evidence chain

**Constraints:**

- The model MUST use MCP service integrations instead of direct API calls
- The model MUST prioritize SSH MCP server (mcp_ssh-mpc-server) over direct SSH connections
- The model MUST follow the configuration file located dynamically in workspace
- The model MUST perform log search using the provided trace ID
- The model MUST attempt to identify and query relevant database tables
- The model MUST document all findings systematically
- The model MUST NOT proceed to report generation until analysis is complete
- The model MUST use provided SSH credentials for log server access (read-only)
- The model MUST perform database queries safely with appropriate filtering

**Expected Outputs:**
- Complete log trace for the given trace ID
- Identified source code locations with issues
- Relevant database table data
- External service call analysis
- Initial root cause hypothesis

**Configuration Reading Guide:**
1. **Dynamic Config Location**: {bugfix_config_file}
2. **Extract logServer.baseDirectory** for log search path
3. **Extract database connection info** for data queries
4. **Use actual values** instead of placeholders in commands

**Example Configuration Usage:**
```bash
# Method 1 (Preferred): SSH MCP Server
# Use mcp_ssh-mpc-server_execute-command tool with grep command
# No direct SSH connection needed

# Method 2 (Alternative): Direct SSH
# If config shows: "baseDirectory": "/path/to/logs/application/"
# Then use: grep -r -A 10 -B 5 "{trace_id}" /path/to/logs/application/*.log

# If config shows: "host": "your-log-server.com"
# Then use: ssh -p 22 username@your-log-server.com
```

**Session Context:**
- Session ID: `{session_id}`
- Trace ID: `{trace_id}`
- Current Stage: Comprehensive Analysis (2/3)