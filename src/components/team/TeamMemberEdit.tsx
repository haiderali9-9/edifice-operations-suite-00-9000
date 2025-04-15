
import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TeamMemberEditProps {
  memberId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMemberUpdated?: () => void;
}

interface MemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  department: string;
}

const TeamMemberEdit: React.FC<TeamMemberEditProps> = ({ 
  memberId, 
  isOpen, 
  onClose,
  onMemberUpdated 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<MemberFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    position: '',
    department: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const roles = ['Project Manager', 'Civil Engineer', 'Architect', 'Site Supervisor', 'Safety Officer', 'Contractor'];
  const departments = ['Management', 'Engineering', 'Design', 'Construction', 'Safety', 'Administration'];
  const positions = [
    'Project Director',
    'Senior Project Manager',
    'Project Manager',
    'Assistant Project Manager',
    'Site Engineer',
    'Civil Engineer',
    'Structural Engineer',
    'Senior Architect',
    'Junior Architect',
    'Safety Manager',
    'Quality Control Inspector',
    'Construction Foreman',
    'Superintendent',
    'Estimator',
    'Scheduler',
    'Equipment Manager',
    'Procurement Specialist',
    'Contract Administrator'
  ];

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!memberId || !isOpen) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', memberId)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || '',
            position: data.position || '',
            department: data.department || '',
          });
        }
      } catch (error) {
        console.error('Error fetching member data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load member information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId, isOpen]);

  // Reset form data when the sheet is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        position: '',
        department: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memberId) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          position: formData.position,
          department: formData.department,
        })
        .eq('id', memberId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Member information updated successfully',
      });
      
      if (onMemberUpdated) {
        onMemberUpdated();
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member information',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Team Member</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleSelectChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="position">Position</Label>
                <Select 
                  value={formData.position} 
                  onValueChange={(value) => handleSelectChange('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => handleSelectChange('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <SheetFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default TeamMemberEdit;
