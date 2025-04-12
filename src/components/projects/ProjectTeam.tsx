
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface ProjectTeamProps {
  projectId: string;
  projectName: string;
}

const ProjectTeam: React.FC<ProjectTeamProps> = ({ projectId, projectName }) => {
  const { toast } = useToast();
  
  // Mock team members
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'John Smith',
      role: 'Project Manager',
      avatar: '',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Lead Engineer',
      avatar: '',
    },
    {
      id: '3',
      name: 'Michael Chen',
      role: 'Architect',
      avatar: '',
    },
    {
      id: '4',
      name: 'Jessica Williams',
      role: 'Site Supervisor',
      avatar: '',
    },
    {
      id: '5',
      name: 'Robert Brown',
      role: 'Safety Officer',
      avatar: '',
    },
  ];
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };
  
  const handleAddMember = () => {
    toast({
      title: 'Add team member',
      description: `Add a new team member to ${projectName}`,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Project Team</h3>
        <Button size="sm" onClick={handleAddMember}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Member
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center p-4 border rounded-lg bg-white hover:bg-gray-50"
          >
            <Avatar className="h-10 w-10 mr-4">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="bg-construction-100 text-construction-700">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.name}</p>
              <Badge variant="outline" className="mt-1">{member.role}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTeam;
