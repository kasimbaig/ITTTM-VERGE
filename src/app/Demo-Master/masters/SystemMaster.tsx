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

interface System {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  created_by?: string;
  created_on?: string;
}

const SystemMaster = () => {
  const { toast } = useToast();
  const [systems, setSystems] = useState<System[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<System | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<System>[] = [
    { header: "System Name", accessor: "name" },
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

  // Fetch systems from API
  const fetchSystems = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/systems/?page=${pageNum}`);
      setSystems(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch systems",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSystems(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "System name is required",
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
      if (editingSystem) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingSystem.id };
        await post(`/master/systems/`, updatePayload);
        toast({ title: "Success", description: "System updated successfully" });
      } else {
        // CREATE
        await post(`/master/systems/`, payload);
        toast({ title: "Success", description: "System created successfully" });
      }

      fetchSystems(page);
      setIsDialogOpen(false);
      setEditingSystem(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save system",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (system: System) => {
    setEditingSystem(system);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this system?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/systems/`, payload);
        setSystems((prev) => prev.filter((s) => s.id !== id));
        toast({
          title: "Success",
          description: "System deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete system",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredSystems = systems.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">System Master</h1>
          <p className="text-muted-foreground">
            Manage systems
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingSystem ? "Edit System" : "Add System"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "System Name", type: "text", required: true },
            { name: "code", label: "System Code", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingSystem
              ? {
                  name: editingSystem.name,
                  code: editingSystem.code,
                  status: editingSystem.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new system
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingSystem(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add System
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
              placeholder="Search systems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Systems Table */}
      <Card>
        <CardHeader>
          <CardTitle>Systems</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredSystems} rowsPerPage={10} />
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

export default SystemMaster;