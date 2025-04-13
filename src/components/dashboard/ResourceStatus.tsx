
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Resource, ResourceAllocation } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeftRight, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResourceStatusProps {
  resources?: Resource[];
  isLoading?: boolean;
}

const ResourceStatus = ({ resources, isLoading }: ResourceStatusProps) => {
  const [resourceToReturn, setResourceToReturn] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  
  // Sort resources by status (critical first)
  const sortedResources = resources 
    ? [...resources].sort((a, b) => {
        if (a.status === "Out of Stock" && b.status !== "Out of Stock") return -1;
        if (a.status !== "Out of Stock" && b.status === "Out of Stock") return 1;
        if (a.status === "Low Stock" && b.status !== "Low Stock") return -1;
        if (a.status !== "Low Stock" && b.status === "Low Stock") return 1;
        return 0;
      })
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Available</Badge>;
      case "Low Stock":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      case "Out of Stock":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Out of Stock</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getResourceCategoryBadge = (returnable: boolean) => {
    return returnable ? 
      <Badge variant="outline" className="bg-purple-100 text-purple-800">Returnable</Badge> :
      <Badge variant="outline" className="bg-teal-100 text-teal-800">Consumable</Badge>;
  };

  const handleReturnResource = async (resource: Resource) => {
    setResourceToReturn(resource);
  };
  
  const confirmReturnResource = async () => {
    if (!resourceToReturn) return;
    
    // Only allow returning resources that are returnable and have allocations
    if (!resourceToReturn.returnable || !resourceToReturn.resource_allocations || resourceToReturn.resource_allocations.length === 0) {
      toast.error("This resource cannot be returned");
      return;
    }
    
    try {
      // Delete all allocations for this resource
      const { error } = await supabase
        .from('resource_allocations')
        .delete()
        .eq('resource_id', resourceToReturn.id);
      
      if (error) throw error;
      
      toast.success("Resource marked as returned", {
        description: `${resourceToReturn.name} has been returned to inventory.`
      });
      
      // Trigger refetch through query invalidation
      window.location.reload(); // Simple refresh to update data
    } catch (error) {
      console.error("Error returning resource:", error);
      toast.error("Failed to process the return");
    } finally {
      setResourceToReturn(null);
    }
  };
  
  const handleDeleteResource = (resource: Resource) => {
    setResourceToDelete(resource);
  };
  
  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;
    
    try {
      // Check if resource has any allocations
      if (resourceToDelete.resource_allocations && resourceToDelete.resource_allocations.length > 0) {
        // Delete all allocations first
        const { error: allocationError } = await supabase
          .from('resource_allocations')
          .delete()
          .eq('resource_id', resourceToDelete.id);
          
        if (allocationError) throw allocationError;
      }
      
      // Then delete the resource
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceToDelete.id);
      
      if (error) throw error;
      
      toast.success("Resource deleted", {
        description: `${resourceToDelete.name} has been permanently removed.`
      });
      
      // Trigger refetch through query invalidation
      window.location.reload(); // Simple refresh to update data
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    } finally {
      setResourceToDelete(null);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Resource Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResources.length > 0 ? (
                sortedResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.type}</TableCell>
                    <TableCell>{getResourceCategoryBadge(resource.returnable)}</TableCell>
                    <TableCell className="text-right">
                      {resource.quantity - (resource.resource_allocations?.reduce((sum, a) => sum + a.quantity, 0) || 0)} / {resource.quantity} {resource.unit}
                    </TableCell>
                    <TableCell className="text-right">{getStatusBadge(resource.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {resource.returnable && resource.resource_allocations && resource.resource_allocations.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600"
                            onClick={() => handleReturnResource(resource)}
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Return</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => handleDeleteResource(resource)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No resources available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      {/* Return Resource Dialog */}
      <AlertDialog open={!!resourceToReturn} onOpenChange={() => setResourceToReturn(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark {resourceToReturn?.name} as returned to inventory? 
              This will remove all project allocations for this resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReturnResource}>
              Return to Inventory
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Resource Dialog */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={() => setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete {resourceToDelete?.name}? 
              This action cannot be undone and will remove all allocations of this resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteResource}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ResourceStatus;
