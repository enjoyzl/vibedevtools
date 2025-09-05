#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Project Auto Analyzer - Auto identify project structure and business mappings
"""
import os
import re
import json
import sys
import glob

class ProjectAnalyzer:
    """Project structure auto analyzer"""
    
    def __init__(self, project_root):
        """Initialize project analyzer
        
        Args:
            project_root: Project root directory path
        """
        self.project_root = os.path.abspath(project_root)
        self.repository_mapping = {}
        self.service_mapping = {}
        self.business_scenarios = []
        self.trace_id_patterns = []
        self.user_id_fields = []
        
    def analyze_project(self):
        """Analyze entire project structure
        
        Returns:
            Project analysis result dictionary
        """
        print("Starting project structure analysis...")
        
        # 1. Scan Repository classes
        self._scan_repositories()
        
        # 2. Scan Service classes
        self._scan_services()
        
        # 3. Analyze business scenarios
        self._analyze_business_scenarios()
        
        # 4. Extract TraceId patterns
        self._extract_trace_patterns()
        
        # 5. Extract user identifier fields
        self._extract_user_fields()
        
        return self._build_config()
    
    def _scan_repositories(self):
        """Scan Repository classes and infer table names"""
        print("Scanning Repository classes...")
        
        # Find all Repository files
        repo_files = []
        for root, dirs, files in os.walk(self.project_root):
            for file in files:
                if file.endswith('Repository.java'):
                    repo_files.append(os.path.join(root, file))
        
        for repo_file in repo_files:
            try:
                with open(repo_file, 'r') as f:
                    content = f.read()
                
                # Extract class name
                class_match = re.search(r'class\s+(\w*Repository)', content)
                if class_match:
                    class_name = class_match.group(1)
                    
                    # Infer table name
                    table_name = self._infer_table_name(class_name, content)
                    if table_name:
                        self.repository_mapping[class_name] = table_name
                        
            except Exception as e:
                print("Failed to process Repository file %s: %s" % (repo_file, str(e)))
    
    def _infer_table_name(self, class_name, content):
        """Infer table name from Repository class
        
        Args:
            class_name: Repository class name
            content: File content
            
        Returns:
            Inferred table name
        """
        # Method 1: Find @Table annotation
        table_match = re.search(r'@Table\s*\(\s*name\s*=\s*"([^"]+)"', content)
        if table_match:
            return table_match.group(1)
        
        # Method 2: Find table name in SQL
        sql_patterns = [
            r'FROM\s+(\w+)',
            r'UPDATE\s+(\w+)',
            r'INSERT\s+INTO\s+(\w+)',
            r'DELETE\s+FROM\s+(\w+)'
        ]
        
        for pattern in sql_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            if matches:
                # Return most common table name
                return max(set(matches), key=matches.count)
        
        # Method 3: Infer from class name (TpDealRepository -> tp_deal)
        if class_name.endswith('Repository'):
            base_name = class_name[:-10]  # Remove Repository suffix
            # Convert camelCase to snake_case
            table_name = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', base_name).lower()
            return table_name
        
        return None
    
    def _scan_services(self):
        """Scan Service classes and analyze business functions"""
        print("Scanning Service classes...")
        
        # Find all Service files
        service_files = []
        for root, dirs, files in os.walk(self.project_root):
            for file in files:
                if file.endswith('Service.java'):
                    service_files.append(os.path.join(root, file))
        
        for service_file in service_files:
            try:
                with open(service_file, 'r') as f:
                    content = f.read()
                
                # Extract class name
                class_match = re.search(r'class\s+(\w*Service)', content)
                if class_match:
                    class_name = class_match.group(1)
                    
                    # Analyze business function
                    service_info = self._analyze_service(class_name, content)
                    if service_info:
                        self.service_mapping[class_name] = service_info
                        
            except Exception as e:
                print("Failed to process Service file %s: %s" % (service_file, str(e)))
    
    def _analyze_service(self, class_name, content):
        """Analyze Service class business function
        
        Args:
            class_name: Service class name
            content: File content
            
        Returns:
            Service information dictionary
        """
        service_info = {
            "description": "",
            "tables": [],
            "businessType": "",
            "repositories": []
        }
        
        # Extract class comment as description
        comment_match = re.search(r'/\*\*\s*\n\s*\*\s*([^\n*]+)', content)
        if comment_match:
            service_info["description"] = comment_match.group(1).strip()
        
        # Infer business type
        service_info["businessType"] = self._infer_business_type(class_name)
        
        # Find used Repository
        repo_matches = re.findall(r'@Autowired[^;]*?(\w*Repository)', content, re.DOTALL)
        service_info["repositories"] = list(set(repo_matches))
        
        # Infer related tables based on Repository
        for repo in service_info["repositories"]:
            if repo in self.repository_mapping:
                service_info["tables"].append(self.repository_mapping[repo])
        
        return service_info
    
    def _infer_business_type(self, class_name):
        """Infer business type from class name
        
        Args:
            class_name: Service class name
            
        Returns:
            Business type
        """
        business_keywords = {
            "Query": "query",
            "Create": "create",
            "Update": "update",
            "Delete": "delete",
            "Payment": "payment",
            "Subs": "deposit",
            "Holdings": "holdings",
            "Trade": "trade",
            "Order": "order",
            "Validate": "validate",
            "Migrate": "migrate"
        }
        
        for keyword, chinese in business_keywords.items():
            if keyword.lower() in class_name.lower():
                return chinese
        
        return "unknown"
    
    def _analyze_business_scenarios(self):
        """Analyze business scenarios"""
        print("Analyzing business scenarios...")
        
        # Analyze business scenarios based on Service grouping
        scenario_groups = {}
        
        for service_name, service_info in self.service_mapping.items():
            business_type = service_info["businessType"]
            
            if business_type not in scenario_groups:
                scenario_groups[business_type] = {
                    "scenario": business_type,
                    "relatedServices": [],
                    "coreTables": set(),
                    "commonIssues": []
                }
            
            scenario_groups[business_type]["relatedServices"].append(service_name)
            scenario_groups[business_type]["coreTables"].update(service_info["tables"])
        
        # Add common issues
        issue_mapping = {
            "payment": ["payment status error", "amount calculation error", "freeze/unfreeze failed"],
            "deposit": ["amount calculation error", "transaction status error", "share calculation error"],
            "query": ["data inconsistency", "query timeout", "permission validation failed"],
            "holdings": ["share calculation error", "profit calculation error", "data delay"]
        }
        
        for scenario_type, scenario_info in scenario_groups.items():
            scenario_info["coreTables"] = list(scenario_info["coreTables"])
            scenario_info["commonIssues"] = issue_mapping.get(scenario_type, ["unknown issue"])
            self.business_scenarios.append(scenario_info)
    
    def _extract_trace_patterns(self):
        """Extract TraceId patterns"""
        print("Extracting TraceId patterns...")
        
        # Common TraceId patterns
        common_patterns = [
            r'traceId[=:\s]+([a-f0-9]{32})',
            r'trace-id[=:\s]+([a-f0-9-]{36})',
            r'requestId[=:\s]+([a-f0-9]{32})',
            r'tid[=:\s]+([a-f0-9]{32})',
            r'X-Trace-Id[=:\s]+([a-f0-9-]{36})'
        ]
        
        self.trace_id_patterns = common_patterns
    
    def _extract_user_fields(self):
        """Extract user identifier fields"""
        print("Extracting user identifier fields...")
        
        # Common user identifier fields
        common_fields = [
            "custNo",
            "hboneNo",
            "customerId", 
            "userId",
            "userNo",
            "clientId",
            "accountId"
        ]
        
        self.user_id_fields = common_fields
    
    def _build_config(self):
        """Build configuration dictionary
        
        Returns:
            Complete project configuration
        """
        config = {
            "projectInfo": {
                "name": os.path.basename(self.project_root),
                "analyzedAt": "auto-generated",
                "totalRepositories": len(self.repository_mapping),
                "totalServices": len(self.service_mapping)
            },
            "repositoryMapping": self.repository_mapping,
            "serviceMapping": self.service_mapping,
            "businessScenarios": self.business_scenarios,
            "extractionPatterns": {
                "traceIdPatterns": self.trace_id_patterns,
                "userIdFields": self.user_id_fields
            },
            "databaseQueries": self._generate_query_templates()
        }
        
        return config
    
    def _generate_query_templates(self):
        """Generate query templates
        
        Returns:
            Query template dictionary
        """
        templates = {}
        
        # Generate basic query templates for each table
        for repo, table in self.repository_mapping.items():
            templates[table] = {
                "basicQuery": "SELECT * FROM %s WHERE {condition} LIMIT 10" % table,
                "countQuery": "SELECT COUNT(*) FROM %s WHERE {condition}" % table,
                "timeRangeQuery": "SELECT * FROM %s WHERE created_time >= '{start_time}' AND created_time <= '{end_time}' LIMIT 20" % table
            }
        
        return templates
    
    def save_config(self, output_path=None):
        """Save configuration to file
        
        Args:
            output_path: Output file path
        """
        if output_path is None:
            output_path = os.path.join(self.project_root, ".github", "chatmodes", "bugfix.project.auto.json")
        
        config = self._build_config()
        
        # Create directory if not exists
        output_dir = os.path.dirname(output_path)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        with open(output_path, 'w') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        print("Project configuration saved to: %s" % output_path)
        return config

def main():
    """Main function"""
    if len(sys.argv) < 2:
        project_root = os.getcwd()
    else:
        project_root = sys.argv[1]
    
    analyzer = ProjectAnalyzer(project_root)
    config = analyzer.analyze_project()
    analyzer.save_config()
    
    print("\nAnalysis completed:")
    print("- Repository classes: %d" % len(config['repositoryMapping']))
    print("- Service classes: %d" % len(config['serviceMapping']))
    print("- Business scenarios: %d" % len(config['businessScenarios']))

if __name__ == "__main__":
    main()
