
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash } from "lucide-react";
import { Resource, ResourceAllocation } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddResourceModal from "./AddResourceModal";

const ProjectResources = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState<ResourceAllocation[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      // First fetch resource allocations
      const { data: allocations, error: allocError } = await supabase
        .from("resource_allocations")
        .select(`
          id,
          quantity,
          hours,
          days,
          consumed,
          resource_id,
          resource:resources(
            id, 
            name, 
            type, 
            unit, 
            cost, 
            status,
            returnable,
            hour_rate,
            day_rate
          )
        `)
        .eq("project_id", projectId)
        .order("id", { ascending: false });

      if (allocError) throw allocError;
      
      // Transform and set the resources data
      const formattedResources = allocations.map(allocation => ({
        ...allocation,
        resource: allocation.resource as Resource
      }));
      
      setResources(formattedResources);
    } catch (error) {
      console.error("Error loading resources:", error);
      toast({
        title: "Error",
        description: "Failed to load project resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchResources();
    }
  }, [projectId]);

  const handleResourceAdded = () => {
    toast({
      title: "Resource Added",
      description: "The resource has been successfully added to this project.",
    });
    fetchResources();
  };

  const handleMarkUsed = async (id: string) => {
    try {
      const { error } = await supabase
        .from("resource_allocations")
        .update({ consumed: true })
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Resource Marked as Used",
        description: "The resource has been marked as used.",
      });
      
      fetchResources();
    } catch (error) {
      console.error("Error marking resource as used:", error);
      toast({
        title: "Error",
        description: "Failed to mark resource as used",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("resource_allocations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Resource Removed",
        description: "The resource has been removed from this project.",
      });
      
      fetchResources();
    } catch (error) {
      console.error("Error removing resource:", error);
      toast({
        title: "Error",
        description: "Failed to remove resource",
        variant: "destructive",
      });
    }
  };

  // Updated to correctly type task resources query result
  const calculateTotalCost = (allocation: ResourceAllocation) => {
    if (!allocation.resource) return 0;
    
    let cost = 0;
    
    // Base cost calculation (quantity * unit cost)
    const baseCost = allocation.quantity * allocation.resource.cost;
    
    // For returnable resources with time-based pricing
    if (allocation.resource.returnable) {
      // Handle hourly pricing if available and hours are specified
      if (allocation.resource.hour_rate && allocation.hours) {
        cost += allocation.resource.hour_rate * allocation.hours;
      }
      
      // Handle daily pricing if available and days are specified
      else if (allocation.resource.day_rate && allocation.days) {
        cost += allocation.resource.day_rate * allocation.days;
      }
      
      // If no time-based pricing is provided, use base cost
      else {
        cost = baseCost;
      }
    } else {
      // For consumable resources, just use the base cost
      cost = baseCost;
    }
    
    return cost;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-background/50">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Project Resources</CardTitle>
            <CardDescription>Manage resources allocated to this project</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Resource
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableCaption>A list of all resources allocated to this project.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length > 0 ? (
              resources.map((allocation) => (
                <TableRow key={allocation.id}>
                  <TableCell className="font-medium">{allocation.resource.name}</TableCell>
                  <TableCell>{allocation.resource.type}</TableCell>
                  <TableCell className="text-right">
                    {allocation.quantity} {allocation.resource.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {allocation.days ? `${allocation.days} days` : ''}
                    {allocation.hours ? `${allocation.hours} hours` : ''}
                    {!allocation.days && !allocation.hours ? 'N/A' : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    ${calculateTotalCost(allocation).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {allocation.consumed ? "Used" : "Available"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!allocation.consumed && allocation.resource.returnable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkUsed(allocation.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span className="sr-only">Mark as Used</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(allocation.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  {isLoading ? "Loading resources..." : "No resources allocated to this project."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {showAddModal && (
        <AddResourceModal
          projectId={projectId || ""}
          onResourceAdded={handleResourceAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </Card>
  );
};

export default ProjectResources;
