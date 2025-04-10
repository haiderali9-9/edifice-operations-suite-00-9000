
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { issues, projects } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Issue } from "@/types";
import { Search, Plus, Filter, MoreHorizontal, AlertTriangle } from "lucide-react";

const Issues = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Filter issues based on search term, status filter, and priority filter
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? issue.status === statusFilter : true;
    const matchesPriority = priorityFilter ? issue.priority === priorityFilter : true;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Find project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  const getPriorityBadge = (priority: Issue["priority"]) => {
    switch (priority) {
      case "Critical":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Critical</Badge>;
      case "High":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">High</Badge>;
      case "Medium":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "Low":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: Issue["status"]) => {
    switch (status) {
      case "Open":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Open</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "Resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-gray-500 mt-1">
            Track and resolve problems across all projects
          </p>
        </div>
        <Button className="bg-construction-700 hover:bg-construction-800">
          <Plus className="h-4 w-4 mr-2" /> Report Issue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-3 rounded-full mb-2">
                <AlertTriangle className="h-6 w-6 text-gray-500" />
              </div>
              <p className="text-lg font-medium">
                {issues.filter((i) => i.status === "Open").length}
              </p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-2">
                <AlertTriangle className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-lg font-medium">
                {issues.filter((i) => i.status === "In Progress").length}
              </p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-2">
                <AlertTriangle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-lg font-medium">
                {issues.filter((i) => i.status === "Resolved").length}
              </p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-3 rounded-full mb-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-lg font-medium">
                {issues.filter((i) => i.priority === "Critical" && i.status !== "Resolved").length}
              </p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search issues..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {statusFilter ? statusFilter : "All Statuses"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Open")}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("Resolved")}>
                  Resolved
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {priorityFilter ? priorityFilter : "All Priorities"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPriorityFilter(null)}>
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("Critical")}>
                  Critical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("High")}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("Medium")}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter("Low")}>
                  Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Issue</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="max-w-[240px]">
                    <div className="font-medium">{issue.title}</div>
                    <div className="text-gray-500 text-xs truncate">{issue.description}</div>
                  </TableCell>
                  <TableCell>{getProjectName(issue.projectId)}</TableCell>
                  <TableCell>{issue.reportedBy.name}</TableCell>
                  <TableCell>
                    {issue.assignedTo ? issue.assignedTo.name : "Unassigned"}
                  </TableCell>
                  <TableCell>{new Date(issue.reportDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getPriorityBadge(issue.priority)}</TableCell>
                  <TableCell>{getStatusBadge(issue.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Issue</DropdownMenuItem>
                        <DropdownMenuItem>Assign</DropdownMenuItem>
                        {issue.status !== "Resolved" && (
                          <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredIssues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    No issues found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Issues;
