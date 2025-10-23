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

interface Unit {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  createdBy: string;
  created_on: string;
}

const UnitMaster = () => {
  const { toast } = useToast();
  const [units, setUnits] = useState<Unit[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);


  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<Unit>[] = [
    { header: "Unit Name", accessor: "name" },
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

  // Fetch units from API
  const fetchUnits = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/units/?page=${pageNum}`);
      setUnits(res.results || []);
      setTotalPages(Math.ceil(res.count / 10));
    } catch (err) {     
      console.error("Failed to fetch units", err);
      toast({
        title: "Error",
        description: "Failed to fetch units",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUnits(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Unit name is required",
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
      if (editingUnit) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingUnit.id };
        await post(`/master/units/`, updatePayload);
        toast({ title: "Success", description: "Unit updated successfully" });
      } else {
        // CREATE
        await post(`/master/units/`, payload);
        toast({ title: "Success", description: "Unit created successfully" });
      }

      fetchUnits(page); // refresh table
      setIsDialogOpen(false);
      setEditingUnit(null);
    } catch (err) {
      console.error("Failed to save unit", err);
      toast({
        title: "Error",
        description: "Failed to save unit",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsDialogOpen(true);
  };


  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this unit?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/units/`, payload);
        setUnits((prev) => prev.filter((unit) => unit.id !== id));
        toast({
          title: "Success",
          description: "Unit deleted successfully",
        });
      } catch (err) {
        console.error("Delete failed", err);
        toast({
          title: "Error",
          description: "Failed to delete unit",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredUnits = units.filter((unit) =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Unit Master</h1>
          <p className="text-muted-foreground">
            Manage organizational units and commands
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingUnit ? "Edit Unit" : "Add Unit"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Unit Name", type: "text", required: true },
            { name: "code", label: "Unit Code", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingUnit
              ? {
                  name: editingUnit.name,
                  code: editingUnit.code,
                  status: editingUnit.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new unit
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingUnit(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
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
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Units Table */}
      <Card>
        <CardHeader>

        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredUnits} rowsPerPage={10}  />
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="border-2 border-black text-black"
        >
          Previous
        </Button>
        <span className="text-sm font-medium">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="border-2 border-black"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default UnitMaster;