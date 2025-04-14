
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Loader2, 
  Package, 
  MoreHorizontal, 
  Truck, 
  Users,
  Box,
  HardDrive,
  ArrowLeftRight,
  Trash2,
  CheckCircle,
  RefreshCw,
  Clock,
  Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Resource } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddResourceModal from './AddResourceModal';
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

interface ProjectResourcesProps {
  projectId: string;
}

interface ProjectResource {
  id: string;
  quantity: number;
  resource: Resource;
  consumed?: boolean;
  hours?: number | null;
  days?: number | null;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projectResources, setProjectResources] = useState<ProjectResource[]>([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [consumeResourceId, setConsumeResourceId] = useState<string | null>(null);
  const [resetResourceId, setResetResourceId] = useState<string | null>(null);

  const fetchProjectResources = async () => {
    try {
      setIsLoading(true);
      
      const { data: allocations, error: allocationsError } = await supabase
        .from('resource_allocations')
        .select('id, quantity, resource_id, consumed, hours, days')
        .eq('project_id', projectId);
      
      if (allocationsError) throw allocationsError;
      
      if (allocations && allocations.length > 0) {
        const resourceIds = allocations.map(alloc => alloc.resource_id);
        
        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .in('id', resourceIds);
        
        if (resourcesError) throw resourcesError;
        
        const formattedResources: ProjectResource[] = allocations.map(allocation => {
          const matchingResource = resources.find(resource => resource.id === allocation.resource_id);
          return {
            id: allocation.id,
            quantity: allocation.quantity,
            consumed: allocation.consumed || false,
            hours: allocation.hours,
            days: allocation.days,
            resource: {
              ...matchingResource,
              returnable: matchingResource.returnable || false
            } as Resource
          };
        });
        
        setProjectResources(formattedResources);
      } else {
        setProjectResources([]);
      }
      
    } catch (error) {
      console.error("Error fetching project resources:", error);
      toast({
        title: "Error fetching resources",
        description: "Failed to load the project resources.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectResources();
  }, [projectId]);

  const handleAddResource = () => {
    setShowAddResourceModal(true);
  };

  const handleResourceAdded = () => {
    fetchProjectResources();
    setShowAddResourceModal(false);
  };

  const getResourceTypeIcon = (type: string, returnable: boolean) => {
    switch (type) {
      case 'Material':
        return <Box className="h-4 w-4 text-blue-500" />;
      case 'Equipment':
        return <HardDrive className="h-4 w-4 text-orange-500" />;
      case 'Labor':
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResourceTypeTag = (returnable: boolean) => {
    return returnable ? 
      <Badge variant="outline" className="bg-purple-100 text-purple-800">Returnable</Badge> :
      <Badge variant="outline" className="bg-teal-100 text-teal-800">Consumable</Badge>;
  };

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getDurationDisplay = (resource: ProjectResource) => {
    if (!resource.resource.returnable) return null;
    
    if (resource.days && resource.days > 0) {
      return (
        <div className="flex items-center text-xs text-gray-600 mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          {resource.days} {resource.days === 1 ? 'day' : 'days'}
        </div>
      );
    } else if (resource.hours && resource.hours > 0) {
      return (
        <div className="flex items-center text-xs text-gray-600 mt-1">
          <Clock className="h-3 w-3 mr-1" />
          {resource.hours} {resource.hours === 1 ? 'hour' : 'hours'}
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-xs text-gray-400 mt-1">
          <Clock className="h-3 w-3 mr-1" />
          No duration set
        </div>
      );
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    setDeleteResourceId(resourceId);
  };

  const confirmDeleteResource = async () => {
    if (!deleteResourceId) return;
    
    try {
      const { error } = await supabase
        .from('resource_allocations')
        .delete()
        .eq('id', deleteResourceId);

      if (error) throw error;

      toast({
        title: "Resource removed",
        description: "Resource has been removed from the project."
      });

      fetchProjectResources();
    } catch (error) {
      console.error("Error removing resource:", error);
      toast({
        title: "Error",
        description: "Failed to remove the resource.",
        variant: "destructive"
      });
    } finally {
      setDeleteResourceId(null);
    }
  };

  const handleMarkAsConsumed = async (resourceId: string) => {
    setConsumeResourceId(resourceId);
  };

  const confirmMarkAsConsumed = async () => {
    if (!consumeResourceId) return;
    
    try {
      const { error } = await supabase
        .from('resource_allocations')
        .update({ consumed: true })
        .eq('id', consumeResourceId);

      if (error) throw error;

      toast({
        title: "Resource consumed",
        description: "Resource has been marked as totally consumed."
      });

      fetchProjectResources();
    } catch (error) {
      console.error("Error marking resource as consumed:", error);
      toast({
        title: "Error",
        description: "Failed to update resource status.",
        variant: "destructive"
      });
    } finally {
      setConsumeResourceId(null);
    }
  };

  const handleResetResource = (resourceId: string) => {
    setResetResourceId(resourceId);
  };

  const confirmResetResource = async () => {
    if (!resetResourceId) return;
    
    try {
      const { error } = await supabase
        .from('resource_allocations')
        .delete()
        .eq('id', resetResourceId);

      if (error) throw error;

      toast({
        title: "Resource reset",
        description: "Resource allocation has been reset and resource made fully available."
      });

      fetchProjectResources();
    } catch (error) {
      console.error("Error resetting resource:", error);
      toast({
        title: "Error",
        description: "Failed to reset the resource.",
        variant: "destructive"
      });
    } finally {
      setResetResourceId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Project Resources</h3>
        <Button size="sm" onClick={handleAddResource}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Resource
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading resources...</span>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectResources.length > 0 ? (
              projectResources.map((projectResource) => (
                <TableRow 
                  key={projectResource.id}
                  className={projectResource.consumed ? "bg-gray-50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {projectResource.consumed && 
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      }
                      <span className={projectResource.consumed ? "text-gray-500 line-through" : ""}>
                        {projectResource.resource.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getResourceTypeIcon(projectResource.resource.type, projectResource.resource.returnable)}
                      <span className="ml-2">{projectResource.resource.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getResourceTypeTag(projectResource.resource.returnable)}
                  </TableCell>
                  <TableCell>{projectResource.quantity} {projectResource.resource.unit}</TableCell>
                  <TableCell>{formatCurrency(projectResource.resource.cost)}</TableCell>
                  <TableCell>
                    {getDurationDisplay(projectResource)}
                  </TableCell>
                  <TableCell>{getStatusBadge(projectResource.resource.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {!projectResource.consumed && !projectResource.resource.returnable ? (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600"
                            onClick={() => handleMarkAsConsumed(projectResource.id)}
                            title="Mark as Consumed"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Mark as Consumed</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-purple-600"
                            onClick={() => handleResetResource(projectResource.id)}
                            title="Reset Resource"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Reset</span>
                          </Button>
                        </>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleRemoveResource(projectResource.id)}
                        title="Delete"
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
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  No resources assigned to this project yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      
      {showAddResourceModal && (
        <AddResourceModal 
          projectId={projectId}
          onResourceAdded={handleResourceAdded}
          onClose={() => setShowAddResourceModal(false)}
        />
      )}

      <AlertDialog open={!!deleteResourceId} onOpenChange={() => setDeleteResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this resource from the project?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteResource}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!consumeResourceId} onOpenChange={() => setConsumeResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Resource as Consumed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this resource as totally consumed?
              This will update the resource status and mark it as used.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMarkAsConsumed}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!resetResourceId} onOpenChange={() => setResetResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Resource Allocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset this resource allocation?
              This will make the resource fully available again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmResetResource}>
              Reset Allocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectResources;
