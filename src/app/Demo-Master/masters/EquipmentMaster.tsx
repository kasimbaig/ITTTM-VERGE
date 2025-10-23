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

interface Equipment {
  id: number;
  name: string;
  code?: string;
  active: number; // 1 = Active, 2 = Inactive
  createdBy: string;
  created_on: string;
}

const EquipmentMaster = () => {
  const { toast } = useToast();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<Equipment>[] = [
    { header: "Equipment Name", accessor: "name" },
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

  // Fetch equipments from API
  const fetchEquipments = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/equipments/?page=${pageNum}`);
      setEquipments(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch equipments",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEquipments(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Equipment name is required",
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
      if (editingEquipment) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingEquipment.id };
        await post(`/master/equipments/`, updatePayload);
        toast({ title: "Success", description: "Equipment updated successfully" });
      } else {
        // CREATE
        await post(`/master/equipments/`, payload);
        toast({ title: "Success", description: "Equipment created successfully" });
      }

      fetchEquipments(page);
      setIsDialogOpen(false);
      setEditingEquipment(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save equipment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this equipment?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/equipments/`, payload);
        setEquipments((prev) => prev.filter((equipment) => equipment.id !== id));
        toast({
          title: "Success",
          description: "Equipment deleted successfully",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete equipment",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredEquipments = equipments.filter((equipment) =>
    equipment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Equipment Master</h1>
          <p className="text-muted-foreground">
            Manage equipment and assets
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingEquipment ? "Edit Equipment" : "Add Equipment"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Equipment Name", type: "text", required: true },
            { name: "code", label: "Equipment Code", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingEquipment
              ? {
                  name: editingEquipment.name,
                  code: editingEquipment.code,
                  status: editingEquipment.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new equipment
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingEquipment(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Equipment
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
              placeholder="Search equipments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredEquipments} rowsPerPage={10} />
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

export default EquipmentMaster;