
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Filter, 
  Share2, 
  MoreHorizontal,
  Calendar,
  FileText
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();
  
  const reportTypes = [
    { 
      title: "Project Progress Report", 
      description: "Overview of all project milestones and progress", 
      icon: <LineChart className="h-10 w-10 text-blue-500" />,
      type: "progress"
    },
    { 
      title: "Budget Utilization Report", 
      description: "Financial breakdown of project spending", 
      icon: <PieChart className="h-10 w-10 text-green-500" />,
      type: "budget"
    },
    { 
      title: "Resource Allocation Report", 
      description: "Analysis of resource distribution across projects", 
      icon: <BarChart3 className="h-10 w-10 text-purple-500" />,
      type: "resource"
    },
    { 
      title: "Safety Incident Report", 
      description: "Summary of safety incidents and resolutions", 
      icon: <FileText className="h-10 w-10 text-red-500" />,
      type: "safety"
    },
    { 
      title: "Productivity Analysis", 
      description: "Team and contractor productivity metrics", 
      icon: <LineChart className="h-10 w-10 text-orange-500" />,
      type: "productivity"
    },
    { 
      title: "Client Satisfaction Report", 
      description: "Feedback and satisfaction metrics from clients", 
      icon: <PieChart className="h-10 w-10 text-indigo-500" />,
      type: "satisfaction"
    }
  ];

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Generating Report",
      description: `Your ${reportType} report will be ready shortly.`,
    });
  };

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-gray-500 mt-1">
            Generate and analyze reports for your projects
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" /> Date Range
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>
            Access your previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="text-base font-medium">Project Progress Report - April 2025</h3>
                  <p className="text-sm text-gray-500">Generated on April 10, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => {
                  toast({
                    title: "Download Started",
                    description: "Your report is being downloaded.",
                  });
                }}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => {
                  toast({
                    title: "Feature Coming Soon",
                    description: "Share functionality will be implemented soon.",
                  });
                }}>
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "View functionality will be implemented soon.",
                      });
                    }}>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Regenerate functionality will be implemented soon.",
                      });
                    }}>
                      Regenerate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Delete functionality will be implemented soon.",
                      });
                    }}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="text-base font-medium">Budget Utilization Report - Q1 2025</h3>
                  <p className="text-sm text-gray-500">Generated on April 5, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => {
                  toast({
                    title: "Download Started",
                    description: "Your report is being downloaded.",
                  });
                }}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => {
                  toast({
                    title: "Feature Coming Soon",
                    description: "Share functionality will be implemented soon.",
                  });
                }}>
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "View functionality will be implemented soon.",
                      });
                    }}>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Regenerate functionality will be implemented soon.",
                      });
                    }}>
                      Regenerate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Delete functionality will be implemented soon.",
                      });
                    }}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Generate New Report</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg bg-gray-100">
                  {report.icon}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Schedule functionality will be implemented soon.",
                      });
                    }}>
                      Schedule Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Customize functionality will be implemented soon.",
                      });
                    }}>
                      Customize
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-construction-600 hover:bg-construction-700"
                onClick={() => handleGenerateReport(report.type)}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
};

export default Reports;
