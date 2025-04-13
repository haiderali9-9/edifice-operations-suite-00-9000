
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import AddResourceForm from "./AddResourceForm";

interface AddResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResourceAdded: () => void;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({
  open,
  onOpenChange,
  onResourceAdded,
}) => {
  const handleSuccess = () => {
    onResourceAdded();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add New Resource</SheetTitle>
          <SheetDescription>
            Create a new resource to add to your inventory. Fill out the details below.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <AddResourceForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddResourceModal;
