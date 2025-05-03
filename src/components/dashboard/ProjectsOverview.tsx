
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { Building, Calendar, MapPin } from "lucide-react";
import { Progress } from "../ui/progress";
import { Link } from "react-router-dom";

interface ProjectsOverviewProps {
  projects: Project[];
}

const ProjectsOverview = ({ projects }: ProjectsOverviewProps) => {
  // Sort projects by completion percentage (highest first)
  const sortedProjects = [...projects]
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 5); // Show top 5 projects

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-medium">Active Projects</CardTitle>
        <Link
          to="/projects"
          className="text-sm text-construction-600 hover:text-construction-800 transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-5">
        {sortedProjects.map((project) => (
          <Link to={`/projects/${project.id}`} key={project.id} className="block hover:bg-gray-50 rounded-md p-2 -mx-2 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-construction-100 p-2 rounded">
                    <Building className="h-4 w-4 text-construction-700" />
                  </div>
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {project.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {new Date(project.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Progress 
                  value={project.completion} 
                  className="h-2" 
                  indicatorClassName={`${
                    project.completion >= 100 
                      ? 'bg-green-500' 
                      : project.completion >= 75 
                        ? 'bg-emerald-500' 
                        : project.completion >= 50 
                          ? 'bg-amber-500' 
                          : project.completion >= 25 
                            ? 'bg-orange-500' 
                            : 'bg-red-500'
                  }`} 
                />
                <span className="text-sm font-medium w-12 text-right">
                  {project.completion}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProjectsOverview;
