
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilePlus, Loader2 } from 'lucide-react';
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

interface DocumentUploaderProps {
  onDocumentUploaded?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentUploaded }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [project, setProject] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const documentTypes = ['Blueprint', 'Contract', 'Permit', 'Invoice', 'Report', 'Other'];
  const projectOptions = ['Skyline Tower', 'Oceanview Residences', 'Central Business Hub', 'Riverside Complex', 'Mountain View Condos'];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentName || !documentType || !project || !file) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields and select a file",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setOpen(false);
      
      toast({
        title: "Document uploaded",
        description: `${documentName} has been uploaded successfully.`,
      });
      
      // Reset form
      setDocumentName('');
      setDocumentType('');
      setProject('');
      setFile(null);
      
      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-construction-700 hover:bg-construction-800">
          <FilePlus className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleUpload}>
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Enter document name"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
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
              
              <div className="grid gap-2">
                <Label htmlFor="project">Project</Label>
                <Select value={project} onValueChange={setProject} required>
                  <SelectTrigger id="project">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectOptions.map((projectName) => (
                      <SelectItem key={projectName} value={projectName}>
                        {projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file">Document File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploader;
