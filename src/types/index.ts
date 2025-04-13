// Update the existing types file to include the new table types
export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  start_date?: string;
  end_date?: string;
  created_at: string;
  task_assignments?: TaskAssignment[];
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  project_id: string | null;
  upload_date: string;
  uploaded_by: string | null;
  projects?: {
    name: string;
  };
}

export interface Issue {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  report_date: string;
  resolution_date?: string;
  reported_by: string | User;
  assigned_to?: string | User;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client: string;
  location: string;
  start_date: string;
  end_date: string;
  budget: number;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  completion: number;
  manager_id: string;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Material' | 'Equipment' | 'Labor';
  quantity: number;
  unit: string;
  cost: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  returnable: boolean;
  resource_allocations?: ResourceAllocation[];
  created_at?: string;
  // Add the missing property that's causing the TypeScript errors
  available?: number;
  // Add other calculated properties that might be used
  allocated?: number;
}

export interface ResourceAllocation {
  id: string;
  resource_id: string;
  project_id: string;
  quantity: number;
}

export interface Expense {
  id: string;
  project_id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  approved: boolean;
  paid_by: string;
  created_at?: string;
}
