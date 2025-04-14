
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Predefined list of resources based on the image
const availableResources = [
  { name: "Brick", type: "Material" },
  { name: "Cement", type: "Material" },
  { name: "Crane", type: "Equipment" },
  { name: "Drill", type: "Equipment" },
  { name: "Forklift", type: "Equipment" },
  { name: "Helmet", type: "Equipment" },
  { name: "Ladder", type: "Equipment" },
  { name: "Lumber", type: "Material" },
  { name: "Steel", type: "Material" },
];

// Predefined list of measurement units
const availableUnits = [
  "kg", "tons", "cubic meters", "pieces", "pallets", 
  "hours", "days", "meters", "square meters"
];

// Define form schema for resource validation
const resourceSchema = z.object({
  name: z.string().min(1, "Resource name is required"),
  type: z.enum(["Material", "Equipment", "Labor"]),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  cost: z.coerce.number().positive("Cost must be positive"),
  status: z.enum(["Available", "Low Stock", "Out of Stock"]),
  returnable: z.boolean().default(false),
  hourRate: z.coerce.number().min(0, "Hourly rate must be non-negative").optional(),
  dayRate: z.coerce.number().min(0, "Daily rate must be non-negative").optional(),
  pricingType: z.enum(["none", "hourly", "daily"]).default("none"),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface AddResourceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddResourceForm: React.FC<AddResourceFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [pricingTab, setPricingTab] = React.useState<string>("none");

  // Set up form with default values
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      type: "Material",
      quantity: 0,
      unit: "",
      cost: 0,
      status: "Available",
      returnable: false,
      hourRate: 0,
      dayRate: 0,
      pricingType: "none",
    },
  });

  // Update pricing type when tab changes
  useEffect(() => {
    form.setValue("pricingType", pricingTab as any);
  }, [pricingTab, form]);

  // Handle resource selection and auto-set the type
  const handleResourceSelection = (resourceName: string) => {
    const selectedResource = availableResources.find(r => r.name === resourceName);
    if (selectedResource) {
      form.setValue("name", resourceName);
      form.setValue("type", selectedResource.type as any);
      
      // Set default returnable value for equipment
      if (selectedResource.type === "Equipment") {
        form.setValue("returnable", true);
      } else {
        form.setValue("returnable", false);
      }
    }
  };

  // Watch for returnable changes to update form
  const isReturnable = form.watch("returnable");

  // Handle form submission
  const onSubmit = async (data: ResourceFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare the data to insert
      const resourceData = {
        name: data.name,
        type: data.type,
        quantity: data.quantity,
        unit: data.unit,
        cost: data.cost,
        status: data.status,
        returnable: data.returnable,
      };

      // Add pricing data if applicable
      if (data.returnable) {
        if (data.pricingType === "hourly") {
          resourceData["hour_rate"] = data.hourRate;
        } else if (data.pricingType === "daily") {
          resourceData["day_rate"] = data.dayRate;
        }
      }

      // Insert new resource into Supabase
      const { data: newResource, error } = await supabase
        .from("resources")
        .insert(resourceData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Resource added",
        description: `${data.name} has been added successfully.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error adding resource:", error);
      toast({
        title: "Error adding resource",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <Select 
                    onValueChange={(value) => handleResourceSelection(value)} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableResources.map((resource) => (
                        <SelectItem key={resource.name} value={resource.name}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <FormControl>
                    <Input value={field.value} readOnly className="bg-gray-50" />
                  </FormControl>
                  <FormDescription>
                    Type is automatically set based on the selected resource
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableUnits.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Cost per Unit ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="returnable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Returnable Resource</FormLabel>
                    <FormDescription>
                      Is this resource returnable after use?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={form.watch("type") === "Equipment"} // Disable switch for equipment as they are always returnable
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {isReturnable && (
              <div className="border rounded-md p-4 mt-4">
                <FormLabel className="mb-2 block">Duration Pricing</FormLabel>
                <FormDescription className="mb-3">
                  Set pricing for time-based usage
                </FormDescription>
                
                <Tabs 
                  value={pricingTab} 
                  onValueChange={setPricingTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="none">No Pricing</TabsTrigger>
                    <TabsTrigger value="hourly">Hourly Rate</TabsTrigger>
                    <TabsTrigger value="daily">Daily Rate</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="none">
                    <p className="text-sm text-gray-500 py-4">
                      No time-based pricing will be set for this resource.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="hourly" className="pt-4">
                    <FormField
                      control={form.control}
                      name="hourRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              placeholder="Rate per hour"
                            />
                          </FormControl>
                          <FormDescription>
                            The cost of using this resource for one hour
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="daily" className="pt-4">
                    <FormField
                      control={form.control}
                      name="dayRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Rate ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              {...field}
                              placeholder="Rate per day"
                            />
                          </FormControl>
                          <FormDescription>
                            The cost of using this resource for one day
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Resource"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddResourceForm;
