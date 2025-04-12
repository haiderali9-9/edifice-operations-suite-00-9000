
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Resource } from '@/types';

interface AddResourceModalProps {
  projectId: string;
  onResourceAdded?: () => void;
  onClose?: () => void;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ projectId, onResourceAdded, onClose }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available resources
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setResources(data as Resource[] || []);
      } catch (error) {
        console.error("Error fetching resources:", error);
        toast({
          title: "Error loading resources",
          description: "Failed to load available resources.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedResource || quantity <= 0) {
      toast({
        title: "Invalid input",
        description: "Please select a resource and enter a valid quantity",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if resource is already assigned to this project
      const { data: existingResource, error: checkError } = await supabase
        .from('project_resources')
        .select('*')
        .eq('project_id', projectId)
        .eq('resource_id', selectedResource)
        .maybeSingle();
      
      if (checkError) throw checkError;

      // If resource already exists, update quantity instead of inserting
      if (existingResource) {
        const { error } = await supabase
          .from('project_resources')
          .update({ quantity: existingResource.quantity + quantity })
          .eq('id', existingResource.id);
          
        if (error) throw error;
      } else {
        // Add resource to project_resources table
        const { error } = await supabase
          .from('project_resources')
          .insert({
            project_id: projectId,
            resource_id: selectedResource,
            quantity: quantity
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Resource added",
        description: "The resource has been added to the project.",
      });
      
      // Reset form
      setSelectedResource('');
      setQuantity(1);
      
      // Close modal and notify parent component
      handleClose();
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast({
        title: "Error adding resource",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
    if (onResourceAdded) onResourceAdded();
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) handleClose();
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Resource to Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="resource">Select Resource</Label>
              <Select value={selectedResource} onValueChange={setSelectedResource} required>
                <SelectTrigger id="resource">
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name} ({resource.type}) - {resource.quantity} {resource.unit} available
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min={1}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Adding...
                </>
              ) : (
                'Add Resource'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddResourceModal;
