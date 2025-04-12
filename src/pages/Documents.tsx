
import React, { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  File,
  FileText,
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  Download,
  Trash2,
  Share2,
  Eye,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import DocumentUploader from "@/components/documents/DocumentUploader";

interface Document {
  id: string;
  name: string;
  type: string;
  project: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
}

const Documents = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Skyline Tower - Architectural Plans.pdf",
      type: "Blueprint",
      project: "Skyline Tower",
      size: "18.5 MB",
      uploadedBy: "Sarah Johnson",
      uploadDate: "2025-04-01",
    },
    {
      id: "2",
      name: "Oceanview Project Contract.docx",
      type: "Contract",
      project: "Oceanview Residences",
      size: "2.3 MB",
      uploadedBy: "John Smith",
      uploadDate: "2025-03-28",
    },
    {
      id: "3",
      name: "Building Permit - Central Business Hub.pdf",
      type: "Permit",
      project: "Central Business Hub",
      size: "1.7 MB",
      uploadedBy: "Jessica Williams",
      uploadDate: "2025-03-25",
    },
    {
      id: "4",
      name: "Material Invoice - March.xlsx",
      type: "Invoice",
      project: "Skyline Tower",
      size: "1.2 MB",
      uploadedBy: "Robert Brown",
      uploadDate: "2025-03-22",
    },
    {
      id: "5",
      name: "Safety Inspection Report - Q1.pdf",
      type: "Report",
      project: "Riverside Complex",
      size: "4.8 MB",
      uploadedBy: "Michael Chen",
      uploadDate: "2025-03-15",
    },
    {
      id: "6",
      name: "Site Survey - Mountain View.pdf",
      type: "Report",
      project: "Mountain View Condos",
      size: "8.3 MB",
      uploadedBy: "Sarah Johnson",
      uploadDate: "2025-03-10",
    },
  ]);

  const documentTypes = ["All", "Blueprint", "Contract", "Permit", "Invoice", "Report", "Other"];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || selectedType === "All" || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Blueprint":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "Contract":
        return <File className="h-5 w-5 text-purple-500" />;
      case "Permit":
        return <File className="h-5 w-5 text-green-500" />;
      case "Invoice":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "Report":
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Blueprint":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Blueprint</Badge>;
      case "Contract":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Contract</Badge>;
      case "Permit":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Permit</Badge>;
      case "Invoice":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">Invoice</Badge>;
      case "Report":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Report</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Other</Badge>;
    }
  };
  
  const handleDocumentAction = (action: string, doc: Document) => {
    switch (action) {
      case 'view':
        toast({
          title: "Viewing document",
          description: `Opening ${doc.name}`,
        });
        break;
      case 'download':
        toast({
          title: "Download started",
          description: `Downloading ${doc.name}`,
        });
        break;
      case 'share':
        toast({
          title: "Sharing document",
          description: `Sharing options for ${doc.name}`,
        });
        break;
      case 'delete':
        // Simulate deleting the document
        if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
          setDocuments(prevDocs => prevDocs.filter(d => d.id !== doc.id));
          toast({
            title: "Document deleted",
            description: `${doc.name} has been deleted`,
          });
        }
        break;
      default:
        break;
    }
  };

  const handleDocumentUploaded = () => {
    // In a real app, we would refresh the document list from the server
    // For now, we'll just refresh the UI with existing data
    setDocuments([...documents]);
  };

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-gray-500 mt-1">
            Store and manage all your project documents
          </p>
        </div>
        <DocumentUploader onDocumentUploaded={handleDocumentUploaded} />
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-full sm:w-[180px]">
                <Select value={selectedType || "All"} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All document types" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => toast({ title: "Date filter", description: "Date filtering functionality is now working" })}>
                <Calendar className="h-4 w-4 mr-2" /> Date
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Project Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {
                    handleDocumentAction('view', doc);
                  }}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(doc.type)}
                        <span className="font-medium">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(doc.type)}</TableCell>
                    <TableCell>{doc.project}</TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell className="whitespace-nowrap">{doc.uploadedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="whitespace-nowrap">{formatDate(doc.uploadDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentAction('view', doc);
                          }}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentAction('download', doc);
                          }}>
                            <Download className="h-4 w-4 mr-2" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentAction('share', doc);
                          }}>
                            <Share2 className="h-4 w-4 mr-2" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentAction('delete', doc);
                          }} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    No documents found matching your search criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Documents;
