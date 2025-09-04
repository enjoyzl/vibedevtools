// Workflow step definitions
export interface WorkflowStep {
  step_number: number;
  name: string;
  description: string;
  tool: string;
  deliverable: string;
}

export interface WorkflowOverview {
  total_steps: number;
  current_step: string;  // Change to step name
  current_step_number: number;  // Keep number for progress display
  steps: WorkflowStep[];
}

// Step name constants
export const STEP_NAMES = {
  GOAL_CONFIRMATION: 'Goal Confirmation',
  REQUIREMENTS: 'Requirements Gathering',
  DESIGN: 'Design Documentation',
  TASKS: 'Task Planning',
  EXECUTION: 'Task Execution',
  // Bugfix workflow steps
  BUGFIX_START: 'Bugfix Start',
  BUGFIX_ANALYZE: 'Bugfix Analysis',
  BUGFIX_REPORT: 'Bugfix Report'
} as const;

// Workflow step constants
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step_number: 1,
    name: STEP_NAMES.GOAL_CONFIRMATION,
    description: 'Clarify the feature development goal through conversation',
    tool: 'vibedev_specs_workflow_start → vibedev_specs_goal_confirmed',
    deliverable: 'Clear feature goal and feature_name'
  },
  {
    step_number: 2,
    name: STEP_NAMES.REQUIREMENTS,
    description: 'Generate requirements document in EARS format',
    tool: 'vibedev_specs_requirements_start → vibedev_specs_requirements_confirmed',
    deliverable: '.vibedev/specs/{feature_name}/requirements.md'
  },
  {
    step_number: 3,
    name: STEP_NAMES.DESIGN,
    description: 'Create technical design document based on requirements',
    tool: 'vibedev_specs_design_start → vibedev_specs_design_confirmed',
    deliverable: '.vibedev/specs/{feature_name}/design.md'
  },
  {
    step_number: 4,
    name: STEP_NAMES.TASKS,
    description: 'Generate executable development task list',
    tool: 'vibedev_specs_tasks_start → vibedev_specs_tasks_confirmed',
    deliverable: '.vibedev/specs/{feature_name}/tasks.md'
  },
  {
    step_number: 5,
    name: STEP_NAMES.EXECUTION,
    description: 'Execute development tasks one by one',
    tool: 'vibedev_specs_execute_start',
    deliverable: 'Actual code implementation'
  }
];

// Bugfix workflow steps
export const BUGFIX_WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step_number: 1,
    name: STEP_NAMES.BUGFIX_START,
    description: 'Initialize bugfix analysis workflow and load configurations',
    tool: 'vibedev_bugfix_start',
    deliverable: 'Workflow initialization and configuration check'
  },
  {
    step_number: 2,
    name: STEP_NAMES.BUGFIX_ANALYZE,
    description: 'Analyze bug information, search logs, and extract relevant data',
    tool: 'vibedev_bugfix_analyze',
    deliverable: 'Log analysis results and database queries'
  },
  {
    step_number: 3,
    name: STEP_NAMES.BUGFIX_REPORT,
    description: 'Generate comprehensive bug analysis report with fix suggestions',
    tool: 'vibedev_bugfix_report',
    deliverable: 'Structured bug analysis report'
  }
];

// Get workflow overview helper function
export function getWorkflowOverview(currentStepName: string): WorkflowOverview {
  // Check if it's a bugfix workflow step
  const isBugfixStep = [STEP_NAMES.BUGFIX_START, STEP_NAMES.BUGFIX_ANALYZE, STEP_NAMES.BUGFIX_REPORT].includes(currentStepName as any);
  
  const steps = isBugfixStep ? BUGFIX_WORKFLOW_STEPS : WORKFLOW_STEPS;
  const currentStep = steps.find(step => step.name === currentStepName);
  const stepNumber = currentStep?.step_number || 1;
  
  return {
    total_steps: steps.length,
    current_step: currentStepName,
    current_step_number: stepNumber,
    steps: steps
  };
}