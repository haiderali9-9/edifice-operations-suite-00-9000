
import React from 'react';
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProfessionalInfoProps {
  initialData: {
    position?: string | null;
    department?: string | null;
  };
  onUpdate: (data: { position: string; department: string }) => Promise<void>;
}

const ProfessionalInfo = ({ initialData, onUpdate }: ProfessionalInfoProps) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      position: initialData.position || '',
      department: initialData.department || '',
    }
  });
  const { toast } = useToast();

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
            <Input
              id="position"
              {...register('position')}
              placeholder="e.g. Project Manager"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder="e.g. Construction Management"
            />
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
