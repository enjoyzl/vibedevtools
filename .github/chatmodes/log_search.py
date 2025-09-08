#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Bug分析 - 自动化日志搜索脚本
"""
import paramiko
import json
import re
import sys
from datetime import datetime

class LogSearcher:
    """日志搜索器 - 自动化SSH连接和日志搜索"""

    def __init__(self, config_path=".github/chatmodes/bugfix.config.json"):
        """初始化日志搜索器
        
        Args:
            config_path: 配置文件路径
        """
        self.config = self._load_config(config_path)
        self.ssh = None
    
    def _load_config(self, config_path):
        """加载配置文件"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except IOError:
            raise IOError("配置文件 {0} 不存在".format(config_path))
        except ValueError:
            raise ValueError("配置文件 {0} 格式错误".format(config_path))
    
    def connect(self):
        """连接到日志服务器
        
        Returns:
            连接是否成功
        """
        try:
            log_config = self.config.get('logServer', {})
            
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            self.ssh.connect(
                hostname=log_config.get('host'),
                port=int(log_config.get('port', 22)),
                username=log_config.get('username'),
                password=log_config.get('password'),
                timeout=int(log_config.get('timeout', 30))
            )
            
            print("Successfully connected to log server: {0}".format(log_config.get('host')))
            return True
            
        except Exception as e:
            print("Failed to connect to log server: {0}".format(str(e)))
            return False
    
    def search_by_traceid(self, trace_id):
        """根据TraceId搜索日志
        
        Args:
            trace_id: 追踪ID
            
        Returns:
            搜索结果字典
        """
        if not self.ssh:
            raise Exception("未连接到日志服务器")
        
        log_config = self.config.get('logServer', {})
        search_config = self.config.get('searchOptions', {})
        
        base_dir = log_config.get('baseDirectory', '/logs/')
        max_lines = int(search_config.get('maxLines', 1000))
        context_lines = int(search_config.get('contextLines', 3))
        
        # 构建搜索命令
        search_cmd = "grep -r"
        if search_config.get('caseInsensitive', True):
            search_cmd += " -i"
        if context_lines > 0:
            search_cmd += " -A {0} -B {0}".format(context_lines)
        
        search_cmd += " '{0}' {1}*.log | head -{2}".format(trace_id, base_dir, max_lines)
        
        try:
            print("Searching TraceId: {0}".format(trace_id))
            print("Search directory: {0}".format(base_dir))
            
            stdin, stdout, stderr = self.ssh.exec_command(search_cmd)
            
            output = stdout.read().decode('utf-8', errors='replace')
            error = stderr.read().decode('utf-8', errors='replace')
            
            if error:
                print("Search warning: {0}".format(error))
            
            return {
                'trace_id': trace_id,
                'command': search_cmd,
                'output': output,
                'lines_count': len(output.splitlines()) if output else 0,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print("Search failed: {0}".format(str(e)))
            return {
                'trace_id': trace_id,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def extract_business_info(self, log_content):
        """从日志内容中提取业务信息
        
        Args:
            log_content: 日志内容
            
        Returns:
            提取的业务信息
        """
        business_info = {
            'sql_queries': [],
            'exceptions': [],
            'api_calls': [],
            'user_params': {},
            'user_ids': []
        }
        
        lines = log_content.splitlines()
        
        for line in lines:
            # 提取SQL查询
            if re.search(r'(SELECT|INSERT|UPDATE|DELETE)', line, re.IGNORECASE):
                business_info['sql_queries'].append(line.strip())
            
            # 提取异常信息
            if re.search(r'(Exception|Error|ERROR)', line, re.IGNORECASE):
                business_info['exceptions'].append(line.strip())
            
            # 提取API调用
            if re.search(r'(http://|https://|API|api)', line, re.IGNORECASE):
                business_info['api_calls'].append(line.strip())
            
            # 提取用户ID
            user_ids = re.findall(r'custNo[=:]?\s*(\d+)', line, re.IGNORECASE)
            business_info['user_ids'].extend(user_ids)
        
        # 去重
        for key in ['user_ids']:
            business_info[key] = list(set(business_info[key]))
        
        return business_info
    
    def disconnect(self):
        """断开SSH连接"""
        if self.ssh:
            self.ssh.close()
            self.ssh = None
            print("SSH connection closed")
    
    def __enter__(self):
        """上下文管理器入口"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器出口"""
        self.disconnect()


def main():
    """主函数 - 命令行使用示例"""
    if len(sys.argv) < 2:
        print("Usage: python log_search.py <trace_id>")
        sys.exit(1)
    
    trace_id = sys.argv[1]
    
    try:
        searcher = LogSearcher()
        if searcher.connect():
            # 搜索日志
            result = searcher.search_by_traceid(trace_id)
            
            if 'error' in result:
                print("Search failed: {0}".format(result['error']))
                return
            
            print("Search result: Found {0} lines of logs".format(result['lines_count']))
            
            if result['output']:
                # 保存完整日志到文件
                output_file = "logs_{0}_{1}.txt".format(trace_id, datetime.now().strftime('%Y%m%d_%H%M%S'))
                with open(output_file, 'wb') as f:
                    f.write(result['output'].encode('utf-8'))
                print("Complete log saved to: {0}".format(output_file))
                
                # 显示前5行日志内容作为预览
                try:
                    lines = result['output'].splitlines()
                    print("\nLog content preview (first 5 lines):")
                    for i, line in enumerate(lines[:5]):
                        print("  {0}: {1}".format(i+1, line[:150]))
                    
                    # 提取业务信息
                    business_info = searcher.extract_business_info(result['output'])
                    
                    print("\nExtracted business information:")
                    print("  User IDs: {0}".format(business_info['user_ids']))
                    print("  SQL queries: {0}".format(len(business_info['sql_queries'])))
                    print("  Exceptions: {0}".format(len(business_info['exceptions'])))
                    print("  API calls: {0}".format(len(business_info['api_calls'])))
                except Exception as e:
                    print("Error processing log content: {0}".format(str(e)))
            else:
                print("No relevant logs found")
            
            searcher.disconnect()
    
    except Exception as e:
        print("Execution failed: {0}".format(str(e)))


if __name__ == "__main__":
    main()
