
export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  completion: number;
  manager: User;
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
  projectId: string;
  name: string;
  description: string;
  assignedTo: User[];
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dependencies?: string[];
}

export interface Resource {
  id: string;
  name: string;
  type: 'Material' | 'Equipment' | 'Labor';
  quantity: number;
  unit: string;
  cost: number;
  allocated: {
    projectId: string;
    quantity: number;
  }[];
  status: 'Available' | 'Low Stock' | 'Out of Stock';
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
  projectId: string;
  name: string;
  type: 'Contract' | 'Blueprint' | 'Permit' | 'Invoice' | 'Report' | 'Other';
  uploadDate: string;
  url: string;
  uploadedBy: string;
}

export interface Issue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  reportedBy: User;
  assignedTo?: User;
  reportDate: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  resolutionDate?: string;
}
