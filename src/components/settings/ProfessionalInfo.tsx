import React from 'react';
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfessionalInfoProps {
  initialData: {
    position?: string | null;
    department?: string | null;
  };
  onUpdate: (data: { position: string; department: string }) => Promise<void>;
}

const ProfessionalInfo = ({ initialData, onUpdate }: ProfessionalInfoProps) => {
  const { register, handleSubmit, formState: { isSubmitting }, setValue, watch } = useForm({
    defaultValues: {
      position: initialData.position || '',
      department: initialData.department || '',
    }
  });
  const { toast } = useToast();
  
  const currentPosition = watch('position');
  const currentDepartment = watch('department');

  const positions = [
    'Project Manager',
    'Construction Manager',
    'Site Engineer',
    'Cost Estimator',
    'Safety Officer'
  ];

  const departments = [
    'Project Coordination',
    'Site Supervision',
    'Schedule Management',
    'Cost Control',
    'Safety Compliance'
  ];

  const onSubmit = async (data: { position: string; department: string }) => {
    try {
      await onUpdate(data);
      toast({
        title: "Professional info updated",
        description: "Your professional information has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating information",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePositionChange = (value: string) => {
    setValue('position', value);
  };

  const handleDepartmentChange = (value: string) => {
    setValue('department', value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Information</CardTitle>
        <CardDescription>
          Update your work-related information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select 
              value={currentPosition} 
              onValueChange={handlePositionChange}
            >
              <SelectTrigger id="position">
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('position')} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select 
              value={currentDepartment} 
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('department')} />
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfessionalInfo;
