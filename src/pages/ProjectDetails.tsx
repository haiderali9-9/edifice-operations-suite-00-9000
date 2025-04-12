
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { projects, tasks, issues, expenses } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, Users, MapPin, DollarSign, Clock, ClipboardList, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ProjectTeam from "@/components/projects/ProjectTeam";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Find project by ID
  const project = projects.find((p) => p.id === projectId);
  
  // If project not found, show error
  if (!project) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-500 mb-6">The project you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Filter tasks and issues related to this project
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const projectIssues = issues.filter((issue) => issue.projectId === project.id);
  
  // Calculate stats
  const completedTasks = projectTasks.filter((task) => task.status === "Completed").length;
  const criticalIssues = projectIssues.filter((issue) => issue.priority === "Critical" && issue.status !== "Resolved").length;
  
  // Get project expenses
  const projectExpenses = expenses.filter((expense) => expense.projectId === project.id);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Planning":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Planning</Badge>;
      case "In Progress":
        return <Badge variant="outline" className="bg-green-100 text-green-800">In Progress</Badge>;
      case "On Hold":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">On Hold</Badge>;
      case "Completed":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate days remaining
  const daysRemaining = () => {
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">{project.location}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-gray-500">Client: {project.client}</span>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusBadge(project.status)}
            <Button
              className="ml-4"
              onClick={() => {
                toast({
                  title: "Edit Project",
                  description: "Project details updated successfully.",
                });
              }}
            >
              Edit Project
            </Button>
          </div>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="text-lg font-medium">{daysRemaining()} days left</p>
                <p className="text-xs text-gray-500">
                  {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Budget</p>
                <p className="text-lg font-medium">{formatCurrency(project.budget)}</p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(projectExpenses.reduce((sum, expense) => sum + expense.amount, 0))} spent
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <ClipboardList className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tasks</p>
                <p className="text-lg font-medium">{completedTasks} / {projectTasks.length}</p>
                <p className="text-xs text-gray-500">
                  {Math.round((completedTasks / (projectTasks.length || 1)) * 100)}% completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Issues</p>
                <p className="text-lg font-medium">{projectIssues.length}</p>
                <p className="text-xs text-gray-500">
                  {criticalIssues} critical issues
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{project.completion}% Complete</span>
              <span className="text-gray-500">{formatCurrency(project.budget * (project.completion / 100))} / {formatCurrency(project.budget)}</span>
            </div>
            <Progress value={project.completion} indicatorClassName="bg-construction-600" />
          </div>
        </CardContent>
      </Card>

      {/* Project Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Project Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectTasks.length > 0 ? (
                    projectTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.name}</TableCell>
                        <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(task.endDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            {task.assignedTo.length} assigned
                          </div>
                        </TableCell>
                        <TableCell>{task.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                        No tasks added to this project yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="issues">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Project Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Report Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectIssues.length > 0 ? (
                    projectIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">{issue.title}</TableCell>
                        <TableCell>{issue.reportedBy.name}</TableCell>
                        <TableCell>{issue.priority}</TableCell>
                        <TableCell>{issue.status}</TableCell>
                        <TableCell>{new Date(issue.reportDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                        No issues reported for this project yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Project Team</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ProjectTeam projectId={project.id} projectName={project.name} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default ProjectDetails;
