
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import StatCard from "@/components/dashboard/StatCard";
import {
  Building,
  Calendar,
  DollarSign,
  BarChart,
  Box,
  AlertTriangle,
} from "lucide-react";
import { projects, tasks, resources, issues, expenses, dashboardStats } from "@/data/mockData";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import ProgressChart from "@/components/dashboard/ProgressChart";
import BudgetChart from "@/components/dashboard/BudgetChart";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import ResourceStatus from "@/components/dashboard/ResourceStatus";
import RecentIssues from "@/components/dashboard/RecentIssues";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

const Dashboard = () => {
  console.log("Rendering Dashboard component");
  // Only include active projects
  const activeProjects = projects.filter((p) => p.status === "In Progress");

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back to your construction management overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Active Projects"
          value={dashboardStats.activeProjects}
          icon={Building}
          description={`${dashboardStats.totalProjects} total projects`}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />

        <StatCard
          title="Total Budget"
          value={formatCurrency(dashboardStats.totalBudget)}
          icon={DollarSign}
          description="Across all projects"
          color="green"
        />

        <StatCard
          title="Resource Utilization"
          value={`${dashboardStats.resourceUtilization}%`}
          icon={Box}
          trend={{ value: 4, isPositive: false }}
          color="yellow"
        />

        <StatCard
          title="Open Issues"
          value={dashboardStats.openIssues}
          icon={AlertTriangle}
          description="Requiring attention"
          trend={{ value: 10, isPositive: true }}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProgressChart data={dashboardStats.monthlyProgress} />
        <BudgetChart data={dashboardStats.budgetDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ProjectsOverview projects={activeProjects} />
        <UpcomingTasks tasks={tasks} />
        <RecentIssues issues={issues} />
      </div>

      <div className="mb-6">
        <ResourceStatus resources={resources} />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
