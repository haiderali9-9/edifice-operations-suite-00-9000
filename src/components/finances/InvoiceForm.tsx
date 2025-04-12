
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
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

interface InvoiceFormProps {
  onInvoiceCreated?: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onInvoiceCreated }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [project, setProject] = useState('');
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const projects = [
    'Skyline Tower', 
    'Oceanview Residences', 
    'Central Business Hub', 
    'Riverside Complex', 
    'Mountain View Condos'
  ];
  
  const clients = [
    'Acme Development Corp',
    'Skyscraper Properties Ltd',
    'Coastal Living Group',
    'Metropolitan Builders Inc',
    'Evergreen Construction Co'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoiceNumber || !project || !client || !amount || !dueDate) {
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
        title: "Invoice created",
        description: `Invoice #${invoiceNumber} has been created successfully.`,
      });
      
      // Reset form
      setInvoiceNumber('');
      setProject('');
      setClient('');
      setAmount('');
      setDueDate('');
      
      // Notify parent component
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }
    }, 1000);
  };

  const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    
    setInvoiceNumber(`${prefix}-${date}-${randomNum}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" /> New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={generateInvoiceNumber}
                  className="text-xs h-7"
                >
                  Generate
                </Button>
              </div>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-230401-0001"
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
                <Label htmlFor="client">Client</Label>
                <Select value={client} onValueChange={setClient} required>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((clientName) => (
                      <SelectItem key={clientName} value={clientName}>
                        {clientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional information about this invoice"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceForm;
