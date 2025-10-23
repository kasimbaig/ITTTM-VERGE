import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog, FieldConfig } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";

interface Dockyard {
  id: number;
  name: string;
  code: string;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
  created_by: number;
}

const DockyardMaster = () => {
  const { toast } = useToast();
  const [dockyards, setDockyards] = useState<Dockyard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDockyard, setEditingDockyard] = useState<Dockyard | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Table columns
  const columns: Column<Dockyard>[] = [
    { header: "Name", accessor: "name" },
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
    // { header: "Created By", accessor: "created_by" },
    // { header: "Created Date", accessor: "created_on" },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={() => handleEdit(row)}>
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

  // Form fields
  const fields: FieldConfig[] = [
    { name: "name", label: "Dockyard Name", type: "text", required: true },
    { name: "code", label: "Dockyard Code", type: "text", required: true },
    {
      name: "status",
      label: "Active",
      type: "checkbox",
      required: false,
    },
  ];

  // Fetch dockyards with pagination
  const fetchDockyards = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      const res = await get(`/master/dockyards/?page=${pageNum}`);
      setDockyards(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 5));
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch dockyards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDockyards(page);
  }, [page]);

  // Save (Create / Update)
  const handleSave = async (formData: any) => {
    const payload = {
      name: formData.name,
      code: formData.code,
      active: formData.status === "Active" ? 1 : 2,
    };
    try {
      if (editingDockyard) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingDockyard.id };
        await post("/master/dockyards/", updatePayload);
        toast({ title: "Success", description: "Dockyard updated successfully" });
      } else {
        // CREATE
        await post("/master/dockyards/", payload);
        toast({ title: "Success", description: "Dockyard created successfully" });
      }
      fetchDockyards(page);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save dockyard",
        variant: "destructive",
      });
    } finally {
      setIsDialogOpen(false);
      setEditingDockyard(null);
    }
  };

  // Edit
  const handleEdit = (dockyard: Dockyard) => {
    setEditingDockyard({
      ...dockyard,
      status: dockyard.active === 1 ? "Active" : "Inactive",
    } as any);
    setIsDialogOpen(true);
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this dockyard?")) {
      try {
        const payload = { id: id, delete: true };
        await post("/master/dockyards/", payload);
        setDockyards((prev) => prev.filter((d) => d.id !== id));
        toast({
          title: "Success",
          description: "Dockyard deleted successfully",
        });
        fetchDockyards(page);
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete dockyard",
          variant: "destructive",
        });
      }
    }
  };

  // Search
  const filteredDockyards = dockyards.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dockyard Master</h1>
          <p className="text-muted-foreground">
            Manage dockyards and shipbuilding facilities
          </p>
        </div>
        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingDockyard ? "Edit Dockyard" : "Add New Dockyard"}
          description={
            editingDockyard
              ? "Update dockyard information"
              : "Create a new dockyard facility"
          }
          fields={fields}
          onSubmit={handleSave}
          initialValues={
            editingDockyard
              ? {
                  name: editingDockyard.name,
                  code: editingDockyard.code,
                  status: editingDockyard.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new dockyard
                }
          }
          trigger={
            <Button
              className="bg-gradient-primary"
              onClick={() => setEditingDockyard(null)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dockyard
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
              placeholder="Search dockyards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Dockyards</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredDockyards} rowsPerPage={5} />
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

export default DockyardMaster;
