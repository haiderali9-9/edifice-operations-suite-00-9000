
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
import { Loader2, ArrowLeftRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResourceStatusProps {
  resources?: Resource[];
  isLoading?: boolean;
}

const ResourceStatus = ({ resources, isLoading }: ResourceStatusProps) => {
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
    // Only allow returning resources that are returnable and have allocations
    if (!resource.returnable || !resource.resource_allocations || resource.resource_allocations.length === 0) {
      toast.error("This resource cannot be returned");
      return;
    }
    
    try {
      // For simplicity, this example just deletes the allocation
      const { error } = await supabase
        .from('resource_allocations')
        .delete()
        .eq('resource_id', resource.id);
      
      if (error) throw error;
      
      toast.success("Resource marked as returned", {
        description: `${resource.name} has been returned to inventory.`
      });
      
      // You would typically refetch resources here
      // This component would need to be updated to include a refetch mechanism
    } catch (error) {
      console.error("Error returning resource:", error);
      toast.error("Failed to process the return");
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
                <TableHead className="w-[80px]"></TableHead>
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
    </Card>
  );
};

export default ResourceStatus;
