import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/table";
import { Edit, Plus, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FieldConfig } from "@/components/DynamicFormDialog";
import { DynamicFormDialog } from "@/components/DynamicFormDialog";

import { get, post, put, del } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

// ---------------- Types ----------------
interface Module {
  id: number;
  name: string;
}

interface Submodule {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  module?: Module;
}

const SubmoduleMaster = () => {
  const { toast } = useToast();

  const [submodules, setSubmodules] = useState<Submodule[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubmodule, setEditingSubmodule] = useState<Submodule | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Columns for DataTable
  const columns: Column<Submodule>[] = [
    { header: "Module", accessor: "module", render: (row) => row.module?.name || "-" },
    { header: "Submodule Name", accessor: "name" },
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
          <Button variant="outline" size="icon" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleDelete(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Fetch Submodules
  const fetchSubmodules = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/submodules/?page=${pageNum}`);
      setSubmodules(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch submodules", variant: "destructive" });
    }
  };

  // Fetch Modules for dropdown
  const fetchModules = async () => {
    try {
      const res = await get(`/master/modules/`);
      setModules(res.results || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch modules", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchModules();
    fetchSubmodules(page);
  }, [page]);

  // Save / Update
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({ title: "Validation Error", description: "Submodule name is required", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      active: formData.status === "Active" ? 1 : 2,
      module: formData.module_id,
    };

    try {
      if (editingSubmodule) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingSubmodule.id };
        await post(`/master/submodules/`, updatePayload);
        toast({ title: "Success", description: "Submodule updated successfully" });
      } else {
        // CREATE
        await post(`/master/submodules/`, payload);
        toast({ title: "Success", description: "Submodule created successfully" });
      }
      fetchSubmodules(page);
      setIsDialogOpen(false);
      setEditingSubmodule(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save submodule", variant: "destructive" });
    }
  };

  const handleEdit = (submodule: Submodule) => {
    setEditingSubmodule(submodule);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this submodule?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/submodules/`, payload);
        setSubmodules((prev) => prev.filter((s) => s.id !== id));
        toast({ title: "Success", description: "Submodule deleted successfully" });
      } catch (err) {
        toast({ title: "Error", description: "Failed to delete submodule", variant: "destructive" });
      }
    }
  };

  const filteredSubmodules = submodules.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form fields
  const fields: FieldConfig[] = [
    {
      name: "module_id",
      label: "Module",
      type: "dropdown",
      apiEndpoint: "/master/modules/",
      required: true,
    },
    { name: "name", label: "Submodule Name", type: "text", required: true },
    { name: "code", label: "Submodule Code", type: "text" },
    { name: "status", label: "Active", type: "checkbox" },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Submodule Master</h1>
          <p className="text-muted-foreground">Manage submodules</p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingSubmodule ? "Edit Submodule" : "Add Submodule"}
          description="Fill out the details below"
          fields={fields}
          initialValues={
            editingSubmodule
              ? {
                name: editingSubmodule.name,
                code: editingSubmodule.code,
                module_id: editingSubmodule.module?.id || undefined,
                status: editingSubmodule.active === 1 ? "Active" : "Inactive",
              }
              : {
                status: "Active" // Default to Active when adding new submodule
              }
          }
          onSubmit={handleSave}
          trigger={
            <Button
              onClick={() => {
                setEditingSubmodule(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Submodule
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
              placeholder="Search submodules..."
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
          <CardTitle>Submodules</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredSubmodules} rowsPerPage={10} />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default SubmoduleMaster;
