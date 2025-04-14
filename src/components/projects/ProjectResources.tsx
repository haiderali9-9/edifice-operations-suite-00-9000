
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
  Calendar,
  FileText
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  taskAllocations?: {
    taskId: string;
    taskName: string;
    hours?: number | null;
    days?: number | null;
    quantity?: number | null;
  }[];
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projectResources, setProjectResources] = useState<ProjectResource[]>([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [consumeResourceId, setConsumeResourceId] = useState<string | null>(null);
  const [resetResourceId, setResetResourceId] = useState<string | null>(null);
  const [showResourceDetailsId, setShowResourceDetailsId] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<ProjectResource | null>(null);

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
        
        // Fetch task resource allocations for each resource
        const formattedResources: ProjectResource[] = [];
        
        for (const allocation of allocations) {
          const matchingResource = resources.find(resource => resource.id === allocation.resource_id);
          
          if (matchingResource) {
            // Fetch task allocations for this resource
            const { data: taskAllocations, error: taskAllocationsError } = await supabase
              .from('task_resources')
              .select(`
                id, 
                hours, 
                days, 
                quantity,
                tasks:task_id (
                  id,
                  name
                )
              `)
              .eq('resource_id', allocation.resource_id);
              
            if (taskAllocationsError) {
              console.error("Error fetching task allocations:", taskAllocationsError);
            }
            
            // Format task allocations
            const formattedTaskAllocations = taskAllocations ? taskAllocations.map(ta => ({
              taskId: ta.tasks.id,
              taskName: ta.tasks.name,
              hours: ta.hours,
              days: ta.days,
              quantity: ta.quantity
            })) : [];
            
            formattedResources.push({
              id: allocation.id,
              quantity: allocation.quantity,
              consumed: allocation.consumed || false,
              hours: allocation.hours,
              days: allocation.days,
              resource: {
                ...matchingResource,
                returnable: matchingResource.returnable || false
              } as Resource,
              taskAllocations: formattedTaskAllocations
            });
          }
        }
        
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

  const handleViewResourceDetails = (resource: ProjectResource) => {
    setSelectedResource(resource);
    setShowResourceDetailsId(resource.id);
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
              <TableHead className="w-[140px]"></TableHead>
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
                    {projectResource.taskAllocations && projectResource.taskAllocations.length > 0 && (
                      <div className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline" onClick={() => handleViewResourceDetails(projectResource)}>
                        Used in {projectResource.taskAllocations.length} {projectResource.taskAllocations.length === 1 ? 'task' : 'tasks'}
                      </div>
                    )}
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
                        className="text-blue-600"
                        onClick={() => handleViewResourceDetails(projectResource)}
                        title="View Details"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Details</span>
                      </Button>
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

      {/* Resource Details Dialog */}
      <Dialog open={!!showResourceDetailsId} onOpenChange={(open) => !open && setShowResourceDetailsId(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Resource Allocation Details</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedResource.resource.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600">{selectedResource.resource.type}</span>
                    {getResourceTypeTag(selectedResource.resource.returnable)}
                  </div>
                </div>
                <div>
                  <div className="text-right text-gray-600">Available: {selectedResource.quantity} {selectedResource.resource.unit}</div>
                  {selectedResource.resource.returnable && (
                    <div className="text-right text-gray-600 text-sm mt-1">
                      {selectedResource.hours ? `${selectedResource.hours} hours` : selectedResource.days ? `${selectedResource.days} days` : 'No duration set'}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Task Allocations</h4>
                {selectedResource.taskAllocations && selectedResource.taskAllocations.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {selectedResource.taskAllocations.map((allocation, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="font-medium">{allocation.taskName}</div>
                        <div className="flex justify-between mt-1 text-sm text-gray-600">
                          {selectedResource.resource.returnable ? (
                            <div>
                              {allocation.hours ? `${allocation.hours} hours` : allocation.days ? `${allocation.days} days` : 'No duration set'}
                            </div>
                          ) : (
                            <div>
                              {allocation.quantity ? `${allocation.quantity} ${selectedResource.resource.unit}` : `Quantity not specified`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    This resource is not allocated to any tasks
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectResources;
