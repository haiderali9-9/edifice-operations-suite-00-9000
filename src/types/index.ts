
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
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  type: 'Contract' | 'Blueprint' | 'Permit' | 'Invoice' | 'Report' | 'Other';
  upload_date: string;
  url: string;
  uploaded_by: string;
  created_at: string;
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
  reported_by: string;
  assigned_to?: string;
  created_at: string;
}
