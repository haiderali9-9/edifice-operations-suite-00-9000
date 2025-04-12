
export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  completion: number;
  manager_id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date: string;
  end_date: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Material' | 'Equipment' | 'Labor';
  quantity: number;
  unit: string;
  cost: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  project_id: string;
  quantity: number;
  start_date?: string;
  end_date?: string;
}

export interface Expense {
  id: string;
  projectId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  approved: boolean;
  paidBy?: string;
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  type: 'Contract' | 'Blueprint' | 'Permit' | 'Invoice' | 'Report' | 'Other';
  upload_date: string;
  url: string;
  uploaded_by: string;
}

export interface Issue {
  id: string;
  project_id: string;
  title: string;
  description: string;
  reported_by: User | string;
  assigned_to?: User | string;
  report_date: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  resolution_date?: string;
}
