import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/table";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DynamicFormDialog } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DynamicFormField {
  id: number;
  form_module: string;
  sub_module_name: string;
  label: string;
  field_type: string;
  key: string;
  required: boolean;
  position_on_form: number;
  dropdown_type?: string; // Static/Dynamic
  comma_separated_values?: string; // For static dropdowns
  data_source?: string; // For dynamic dropdowns
  active: number; // 1 = Active, 2 = Inactive
  created_by?: string;
  created_on?: string;
}



const DynamicFormFieldsMaster = () => {
  const { toast } = useToast();
  const [formFields, setFormFields] = useState<DynamicFormField[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<DynamicFormField | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<DynamicFormField>[] = [
    // { header: "Form Module", accessor: "form_module" },
    { header: "Sub Module", accessor: "sub_module_name" },
    { header: "Label", accessor: "label" },
    { header: "Field Type", accessor: "field_type" },
    // { header: "Key", accessor: "key" },
    {
      header: "Required",
      accessor: "required",
      render: (row) => (
        <Badge variant={row.required ? "default" : "secondary"}>
          {row.required ? "Yes" : "No"}
        </Badge>
      ),
    },
    // { header: "Position", accessor: "position_on_form" },
    // {
    //   header: "Dropdown Type",
    //   accessor: "dropdown_type",
    //   render: (row) => (
    //     row.field_type === "dropdown" ? (
    //       <Badge variant="outline">
    //         {row.dropdown_type || "Not Set"}
    //       </Badge>
    //     ) : (
    //       <span className="text-muted-foreground">-</span>
    //     )
    //   ),
    // },
    // {
    //   header: "Data Source",
    //   accessor: "data_source",
    //   render: (row) => (
    //     row.field_type === "dropdown" && row.dropdown_type === "Dynamic" ? (
    //       <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
    //         {row.data_source || "Not Set"}
    //       </span>
    //     ) : (
    //       <span className="text-muted-foreground">-</span>
    //     )
    //   ),
    // },
    {
      header: "Status",
      accessor: "active",
      render: (row) => (
        <Badge variant={row.active === 1 ? "default" : "secondary"}>
          {row.active === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Fetch form fields from API
  const fetchFormFields = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/dynamic-fields/?page=${pageNum}&order_by=-id`);
      setFormFields(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch dynamic form fields",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    fetchFormFields(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.form_module?.trim()) {
      toast({
        title: "Validation Error",
        description: "Form module is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.sub_module?.trim()) {
      toast({
        title: "Validation Error",
        description: "Sub module is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.label?.trim()) {
      toast({
        title: "Validation Error",
        description: "Label is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.field_type?.trim()) {
      toast({
        title: "Validation Error",
        description: "Field type is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.key?.trim()) {
      toast({
        title: "Validation Error",
        description: "Key is required",
        variant: "destructive",
      });
      return;
    }

    // Validate comma-separated values if dropdown_type is Static
    if (formData.dropdown_type === "Static" && formData.field_type === "dropdown") {
      if (!formData.comma_separated_values?.trim()) {
        toast({
          title: "Validation Error",
          description: "Comma-separated values are required for static dropdowns",
          variant: "destructive",
        });
        return;
      }
      
      // Validate comma-separated format
      const values = formData.comma_separated_values.split(',').map(v => v.trim()).filter(v => v.length > 0);
      if (values.length < 2) {
        toast({
          title: "Validation Error",
          description: "At least 2 comma-separated values are required",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate data_source if dropdown_type is Dynamic
    if (formData.dropdown_type === "Dynamic" && formData.field_type === "dropdown") {
      if (!formData.data_source?.trim()) {
        toast({
          title: "Validation Error",
          description: "Data source is required for dynamic dropdowns",
          variant: "destructive",
        });
        return;
      }
    }

    const payload = {
      form_module: formData.form_module,
      sub_module: formData.sub_module,
      label: formData.label,
      field_type: formData.field_type,
      key: formData.key,
      required: formData.required === "Yes",
      position_on_form: parseInt(formData.position_on_form) || 1,
      dropdown_type: formData.dropdown_type,
      comma_separated_values: formData.comma_separated_values,
      data_source: formData.data_source,
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingField) {
        const payloadWithId = { ...payload, id: editingField.id };
        await put(`/master/dynamic-fields/`, payloadWithId);
        toast({ title: "Success", description: "Dynamic form field updated successfully" });
      } else {
        await post(`/master/dynamic-fields/`, payload);
        toast({ title: "Success", description: "Dynamic form field created successfully" });
      }

      fetchFormFields(page);
      setIsDialogOpen(false);
      setEditingField(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save dynamic form field",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (field: DynamicFormField) => {
    setEditingField(field);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this dynamic form field?")) {
      try {
        await del(`/master/dynamic-fields/${id}/`);
        setFormFields((prev) => prev.filter((f) => f.id !== id));
        toast({
          title: "Success",
          description: "Dynamic form field deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete dynamic form field",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredFormFields = formFields.filter((f) =>
    f.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.form_module.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.sub_module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Custom form fields for the dialog
  const getFormFields = () => {
    const baseFields = [
      {
        name: "form_module",
        label: "Form Module",
        type: "dropdown" as const,
        apiEndpoint: "/master/modules/",
        required: true,
      },
      {
        name: "sub_module",
        label: "Sub Module",
        type: "dropdown" as const,
        apiEndpoint: "/master/submodules/",
        required: true,
      },
      { name: "label", label: "Label", type: "text" as const, required: true },
      {
        name: "field_type",
        label: "Field Type",
        type: "static-dropdown" as const,
        options: [
          { value: "text", label: "Text" },
          { value: "number", label: "Number" },
          { value: "dropdown", label: "Dropdown" },
          { value: "date", label: "Date" },
          { value: "checkbox", label: "Checkbox" },
          { value: "radio", label: "Radio" },
          { value: "select", label: "Select" },
          { value: "textarea", label: "Textarea" },
          { value: "file", label: "File" },
          { value: "image", label: "Image" },
          { value: "video", label: "Video" },
          { value: "audio", label: "Audio" },
          { value: "link", label: "Link" },
          { value: "email", label: "Email" },
          { value: "phone", label: "Phone" },
          { value: "url", label: "URL" },
          { value: "password", label: "Password" },
          { value: "username", label: "Username" },
          { value: "secret", label: "Secret" },
          { value: "api_key", label: "API Key" }
        ],
        required: true,
      },
      { name: "key", label: "Key", type: "text" as const, required: true },
      {
        name: "required",
        label: "Required",
        type: "static-dropdown" as const,
        options: [
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" }
        ],
        required: true,
      },
      { name: "position_on_form", label: "Position on Form", type: "number" as const, required: true },
      {
        name: "dropdown_type",
        label: "Dropdown Type (if field_type is dropdown)",
        type: "static-dropdown" as const,
        options: [
          { value: "Static", label: "Static" },
          { value: "Dynamic", label: "Dynamic" }
        ],
        required: false,
      },
      {
        name: "comma_separated_values",
        label: "Comma-separated values (for static dropdowns)",
        type: "comma-dropdown" as const,
        required: false,
        placeholder: "Enter comma-separated values, e.g., Option1,Option2,Option3",
        showWhen: { field: "dropdown_type", value: "Static" }
      },
      {
        name: "data_source",
        label: "Data Source (for dynamic dropdowns)",
        type: "dropdown" as const,
        apiEndpoint: "/master/content-types/dropdown/",
        required: false,
        showWhen: { field: "dropdown_type", value: "Dynamic" }
      },
      {
        name: "status",
        label: "Active",
        type: "checkbox" as const,
        required: false,
      }
    ];

    return baseFields;
  };

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dynamic Form Fields Master</h1>
          <p className="text-muted-foreground">
            Manage dynamic form fields for modules and submodules
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingField ? "Edit Dynamic Form Field" : "Add Dynamic Form Field"}
          description="Fill out the details below"
          fields={getFormFields()}
          onSubmit={handleSave}
          initialValues={
            editingField
              ? {
                  form_module: editingField.form_module,
                  sub_module: editingField.sub_module,
                  label: editingField.label,
                  field_type: editingField.field_type,
                  key: editingField.key,
                  required: editingField.required ? "Yes" : "No",
                  position_on_form: editingField.position_on_form.toString(),
                  dropdown_type: editingField.dropdown_type,
                  comma_separated_values: editingField.comma_separated_values,
                  data_source: editingField.data_source,
                  status: editingField.active === 1 ? "Active" : "Inactive",
                }
              : {}
          }
          trigger={
            <Button
              onClick={() => {
                setEditingField(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Dynamic Form Field
            </Button>
          }
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dynamic form fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form Fields Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dynamic Form Fields</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredFormFields} rowsPerPage={10} />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DynamicFormFieldsMaster;
