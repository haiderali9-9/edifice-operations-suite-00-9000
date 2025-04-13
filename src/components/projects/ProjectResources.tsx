
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Resource } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddResourceModal from './AddResourceModal';

interface ProjectResourcesProps {
  projectId: string;
}

interface ProjectResource {
  id: string;
  quantity: number;
  resource: Resource;
}

const ProjectResources: React.FC<ProjectResourcesProps> = ({ projectId }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [projectResources, setProjectResources] = useState<ProjectResource[]>([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  // Fetch project resources
  const fetchProjectResources = async () => {
    try {
      setIsLoading(true);
      
      // First, get all resource allocations for this project
      const { data: allocations, error: allocationsError } = await supabase
        .from('resource_allocations')
        .select('id, quantity, resource_id')
        .eq('project_id', projectId);
      
      if (allocationsError) throw allocationsError;
      
      if (allocations && allocations.length > 0) {
        // Get all resources associated with these allocations
        const resourceIds = allocations.map(alloc => alloc.resource_id);
        
        const { data: resources, error: resourcesError } = await supabase
          .from('resources')
          .select('*')
          .in('id', resourceIds);
        
        if (resourcesError) throw resourcesError;
        
        // Map the resources back to their allocations
        const formattedResources: ProjectResource[] = allocations.map(allocation => {
          const matchingResource = resources.find(resource => resource.id === allocation.resource_id);
          return {
            id: allocation.id,
            quantity: allocation.quantity,
            resource: matchingResource as Resource
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

  const handleRemoveResource = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resource_allocations')
        .delete()
        .eq('id', resourceId);

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
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectResources.length > 0 ? (
              projectResources.map((projectResource) => (
                <TableRow key={projectResource.id}>
                  <TableCell className="font-medium">{projectResource.resource.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {getResourceTypeIcon(projectResource.resource.type, projectResource.resource.returnable)}
                      <span className="ml-2">{projectResource.resource.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getResourceTypeTag(projectResource.resource.returnable || false)}
                  </TableCell>
                  <TableCell>{projectResource.quantity} {projectResource.resource.unit}</TableCell>
                  <TableCell>{formatCurrency(projectResource.resource.cost)}</TableCell>
                  <TableCell>{getStatusBadge(projectResource.resource.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRemoveResource(projectResource.id)}>
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Remove Resource
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
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
    </div>
  );
};

export default ProjectResources;
