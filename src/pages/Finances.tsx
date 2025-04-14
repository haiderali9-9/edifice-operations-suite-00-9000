
import React, { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, Plus, FilePlus, FileText, Wallet, Filter, Download, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import InvoiceForm from "@/components/finances/InvoiceForm";
import InvoiceList, { Invoice } from "@/components/finances/InvoiceList";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Project {
  id: string;
  name: string;
  budget: number;
  resources_cost: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  project: string;
  amount: number;
  type: 'income' | 'expense';
  project_id?: string;
}

const Finances = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch projects data
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, budget, resources_cost, completion');
      
      if (error) throw error;
      return data || [];
    }
  });
  
  // Fetch financial transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['financial_transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(`
          id,
          type,
          amount,
          description,
          date,
          projects (id, name)
        `)
        .order('date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return (data || []).map(trans => ({
        id: trans.id,
        date: trans.date,
        description: trans.description || '',
        project: trans.projects?.name || 'General',
        project_id: trans.projects?.id,
        amount: trans.amount,
        type: trans.type
      }));
    }
  });
  
  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select();
      
      if (error) throw error;
      
      return (data || []).map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        client: invoice.client,
        project: invoice.project_id || '',
        amount: invoice.amount,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        status: invoice.status
      } as Invoice));
    }
  });

  // Invoice status update mutation
  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ invoiceId, newStatus }: { invoiceId: string, newStatus: Invoice['status'] }) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoiceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });
  
  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    updateInvoiceStatus.mutate({ invoiceId, newStatus });
  };
  
  const handleInvoiceCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    setActiveTab("invoices");
  };
  
  const handleAddTransaction = () => {
    // Will be implemented with a form modal
    toast({
      title: "Add Transaction",
      description: "Transaction form will appear here",
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  // Calculate total budget
  const totalBudget = projects?.reduce((sum, project) => sum + (project.budget || 0), 0) || 0;
  
  // Calculate total spent
  const totalSpent = projects?.reduce((sum, project) => sum + (project.resources_cost || 0), 0) || 0;
  
  // Calculate remaining budget
  const totalRemaining = totalBudget - totalSpent;
  
  // Calculate total revenue (from income transactions)
  const totalRevenue = transactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0;
  
  // Format project budget data for display
  const projectBudgets = projects?.map(project => ({
    id: project.id,
    project: project.name,
    budget: project.budget || 0,
    spent: project.resources_cost || 0,
    remaining: (project.budget || 0) - (project.resources_cost || 0)
  })) || [];
  
  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-gray-500 mt-1">
            Track and manage your project finances
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button className="bg-construction-700 hover:bg-construction-800" onClick={handleAddTransaction}>
            <Plus className="h-4 w-4 mr-2" /> Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Budget</span>
                <span className="bg-blue-100 text-blue-800 rounded-md p-1 text-xs">All Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-construction-600" />
                <span className="text-2xl font-bold">{formatCurrency(totalBudget)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Spent</span>
                <span className="bg-orange-100 text-orange-800 rounded-md p-1 text-xs">All Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold">{formatCurrency(totalSpent)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="bg-green-100 text-green-800 rounded-md p-1 text-xs">All Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{formatCurrency(totalRemaining)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue</span>
                <span className="bg-purple-100 text-purple-800 rounded-md p-1 text-xs">YTD</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex justify-center py-8">Loading project data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Total Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectBudgets.length > 0 ? (
                      projectBudgets.map((budget) => {
                        const utilizationPercentage = Math.round((budget.spent / budget.budget) * 100) || 0;
                        let utilizationColor = "bg-green-500";
                        if (utilizationPercentage > 90) {
                          utilizationColor = "bg-red-500";
                        } else if (utilizationPercentage > 70) {
                          utilizationColor = "bg-yellow-500";
                        }
                        
                        return (
                          <TableRow key={budget.id}>
                            <TableCell className="font-medium">{budget.project}</TableCell>
                            <TableCell>{formatCurrency(budget.budget)}</TableCell>
                            <TableCell>{formatCurrency(budget.spent)}</TableCell>
                            <TableCell>{formatCurrency(budget.remaining)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={utilizationPercentage} 
                                  className="h-2"
                                  // @ts-ignore - indicatorClassName is supported
                                  indicatorClassName={utilizationColor} 
                                />
                                <span className="text-sm">{utilizationPercentage}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                          No project budget data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" /> Filter by Date
              </Button>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">Loading transaction data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{transaction.project}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            {transaction.type === 'income' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Income
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Expense
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                          No transaction data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoices</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
                <InvoiceForm onInvoiceCreated={handleInvoiceCreated} />
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex justify-center py-8">Loading invoice data...</div>
              ) : invoices && invoices.length > 0 ? (
                <InvoiceList
                  invoices={invoices}
                  onStatusChange={handleStatusChange}
                />
              ) : (
                <div className="text-center p-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices yet</h3>
                  <p className="text-gray-500 mb-4">
                    Create your first invoice to start tracking payments
                  </p>
                  <InvoiceForm onInvoiceCreated={handleInvoiceCreated} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button className="h-auto py-8 flex flex-col items-center justify-center" variant="outline">
                  <FileText className="h-12 w-12 mb-2 text-gray-500" />
                  <span className="text-lg font-medium">Monthly Budget Report</span>
                </Button>
                <Button className="h-auto py-8 flex flex-col items-center justify-center" variant="outline">
                  <FileText className="h-12 w-12 mb-2 text-gray-500" />
                  <span className="text-lg font-medium">Project Expense Report</span>
                </Button>
                <Button className="h-auto py-8 flex flex-col items-center justify-center" variant="outline">
                  <FileText className="h-12 w-12 mb-2 text-gray-500" />
                  <span className="text-lg font-medium">Annual Financial Summary</span>
                </Button>
                <Button className="h-auto py-8 flex flex-col items-center justify-center" variant="outline">
                  <FileText className="h-12 w-12 mb-2 text-gray-500" />
                  <span className="text-lg font-medium">Custom Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Finances;
