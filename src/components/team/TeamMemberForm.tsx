
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, X } from 'lucide-react';
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
import { supabase } from '@/lib/supabase';

interface TeamMemberFormProps {
  onMemberAdded?: () => void;
  projectId?: string;
  onClose?: () => void;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role?: string;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ onMemberAdded, projectId, onClose }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(projectId ? true : false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [role, setRole] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // For standalone team form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const roles = ['Project Manager', 'Civil Engineer', 'Architect', 'Site Supervisor', 'Safety Officer', 'Contractor'];

  // Fetch available users from profiles table
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role');
        
        if (error) throw error;
        setUsers(data as UserProfile[] || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
        toast({
          title: "Error loading team members",
          description: "Failed to load available team members.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (projectId) {
      // Project team member assignment
      if (!selectedUser || !role) {
        toast({
          title: "Missing information",
          description: "Please select a team member and role",
          variant: "destructive"
        });
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        // Add member to team_members table
        const { error } = await supabase
          .from('team_members')
          .insert({
            project_id: projectId,
            user_id: selectedUser,
            role: role
          });
        
        if (error) throw error;
        
        toast({
          title: "Team member added",
          description: "The team member has been added to the project.",
        });
        
        // Reset form
        setSelectedUser('');
        setRole('');
        setOpen(false);
        
        // Notify parent component
        if (onMemberAdded) {
          onMemberAdded();
        }

        if (onClose) {
          onClose();
        }
      } catch (error: any) {
        console.error("Error adding team member:", error);
        toast({
          title: "Error adding team member",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Standalone team member creation
      if (!firstName || !lastName || !email || !role) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        // Add new team member to profiles
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            first_name: firstName,
            last_name: lastName,
            role: role
          })
          .select();
        
        if (error) throw error;
        
        toast({
          title: "Team member created",
          description: `${firstName} ${lastName} has been added to the team.`,
        });
        
        // Reset form
        setFirstName('');
        setLastName('');
        setEmail('');
        setRole('');
        setOpen(false);
        
        // Notify parent component
        if (onMemberAdded) {
          onMemberAdded();
        }
      } catch (error: any) {
        console.error("Error creating team member:", error);
        toast({
          title: "Error creating team member",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  // Dialog content or standalone button based on projectId prop
  if (projectId) {
    // Render just the dialog content when projectId is provided
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Team Member to Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user">Select Team Member</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser} required>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name} {user.role ? `(${user.role})` : ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="role">Project Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                    Adding...
                  </>
                ) : (
                  'Add Team Member'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Original form with trigger button for the Team page
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-construction-700 hover:bg-construction-800">
          <UserPlus className="h-4 w-4 mr-2" /> Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Adding...
                </>
              ) : (
                'Add Team Member'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberForm;
