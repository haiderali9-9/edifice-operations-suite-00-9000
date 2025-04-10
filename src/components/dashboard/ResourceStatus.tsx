
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Resource } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResourceStatusProps {
  resources: Resource[];
}

const ResourceStatus = ({ resources }: ResourceStatusProps) => {
  // Sort resources by status (critical first)
  const sortedResources = [...resources].sort((a, b) => {
    if (a.status === "Out of Stock" && b.status !== "Out of Stock") return -1;
    if (a.status !== "Out of Stock" && b.status === "Out of Stock") return 1;
    if (a.status === "Low Stock" && b.status !== "Low Stock") return -1;
    if (a.status !== "Low Stock" && b.status === "Low Stock") return 1;
    return 0;
  });

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

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Resource Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className="font-medium">{resource.name}</TableCell>
                <TableCell>{resource.type}</TableCell>
                <TableCell className="text-right">
                  {resource.quantity - resource.allocated.reduce((sum, a) => sum + a.quantity, 0)} / {resource.quantity} {resource.unit}
                </TableCell>
                <TableCell className="text-right">{getStatusBadge(resource.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResourceStatus;
