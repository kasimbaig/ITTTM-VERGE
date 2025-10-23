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

interface Compartment {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  created_by?: string;
  created_on?: string;
}

const CompartmentMaster = () => {
  const { toast } = useToast();
  const [compartments, setCompartments] = useState<Compartment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompartment, setEditingCompartment] = useState<Compartment | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<Compartment>[] = [
    { header: "Compartment Name", accessor: "name" },
    { header: "Code", accessor: "code" },
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

  // Fetch compartments from API
  const fetchCompartments = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/compartments/?page=${pageNum}`);
      setCompartments(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch compartments",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCompartments(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Compartment name is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingCompartment) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingCompartment.id };
        await post(`/master/compartments/`, updatePayload);
        toast({ title: "Success", description: "Compartment updated successfully" });
      } else {
        // CREATE
        await post(`/master/compartments/`, payload);
        toast({ title: "Success", description: "Compartment created successfully" });
      }

      fetchCompartments(page);
      setIsDialogOpen(false);
      setEditingCompartment(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save compartment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (compartment: Compartment) => {
    setEditingCompartment(compartment);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this compartment?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/compartments/`, payload);
        setCompartments((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Success",
          description: "Compartment deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete compartment",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredCompartments = compartments.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Compartment</h1>
          <p className="text-muted-foreground">
            Manage compartments
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingCompartment ? "Edit Compartment" : "Add Compartment"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Compartment Name", type: "text", required: true },
            { name: "code", label: "Compartment Code", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingCompartment
              ? {
                  name: editingCompartment.name,
                  code: editingCompartment.code,
                  status: editingCompartment.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new compartment
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingCompartment(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Compartment
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
              placeholder="Search compartments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Compartments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compartments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredCompartments} rowsPerPage={10} />
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

export default CompartmentMaster;