
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface IssueFormProps {
  onIssueCreated?: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ onIssueCreated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('');

  const projects = [
    'Skyline Tower', 
    'Oceanview Residences', 
    'Central Business Hub', 
    'Riverside Complex', 
    'Mountain View Condos'
  ];

  const priorities = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !project || !priority) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      
      toast({
        title: "Issue reported",
        description: "Your issue has been reported successfully.",
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setProject('');
      setPriority('');
      
      // Notify parent component
      if (onIssueCreated) {
        onIssueCreated();
      }
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-construction-700 hover:bg-construction-800">
          <Plus className="h-4 w-4 mr-2" /> Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report New Issue</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of the issue"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select value={project} onValueChange={setProject} required>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((projectName) => (
                      <SelectItem key={projectName} value={projectName}>
                        {projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority} required>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priorityName) => (
                      <SelectItem key={priorityName} value={priorityName}>
                        {priorityName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the issue"
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Submit Issue
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IssueForm;
