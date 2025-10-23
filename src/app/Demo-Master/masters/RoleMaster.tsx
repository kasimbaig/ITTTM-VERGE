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

interface Role {
  id: number;
  name: string;
  description?: string;
  active: number; // 1 = Active, 2 = Inactive
}

const RoleMaster = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const columns: Column<Role>[] = [
    { header: "Role Name", accessor: "name" },
    { header: "Description", accessor: "description" },
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

  const fetchRoles = async (pageNum: number = 1) => {
    try {
      const res = await get(`/access/user-roles/?page=${pageNum}&order_by=-name`);
      
      // Handle different response structures like in UserMaster
      const rolesData = res?.results?.data || res?.results || res?.data || res || [];
      const rolesArray = Array.isArray(rolesData) ? rolesData : [];
      setRoles(rolesArray);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRoles(page);
  }, [page]);

  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingRole) {
        await put(`/access/user-roles/${editingRole.id}/`, payload);
        toast({ title: "Success", description: "Role updated successfully" });
      } else {
        await post(`/access/user-roles/`, payload);
        toast({ title: "Success", description: "Role created successfully" });
      }

      fetchRoles(page);
      setIsDialogOpen(false);
      setEditingRole(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this role?")) {
      try {
        const response = await del(`/access/user-roles/${id}/`);
        
        // Check if the response indicates successful deletion
        if (response.status === 204 || response.message === "Successfully deleted") {
          setRoles((prev) => prev.filter((r) => r.id !== id));
          toast({
            title: "Success",
            description: "Role deleted successfully",
          });
        } else {
          // Handle other successful responses
          setRoles((prev) => prev.filter((r) => r.id !== id));
          toast({
            title: "Success",
            description: "Role deleted successfully",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete role",
          variant: "destructive",
        });
      }
    }
  };

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Role Master</h1>
          <p className="text-muted-foreground">
            Manage user roles
          </p>
        </div>
        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingRole ? "Edit Role" : "Add Role"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Role Name", type: "text", required: true },
            { name: "description", label: "Description", type: "text" },
            {
              name: "status",
              label: "Status",
              type: "dropdown",
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" }
              ],
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingRole
              ? {
                  name: editingRole.name,
                  description: editingRole.description,
                  status: editingRole.active === 1 ? "Active" : "Inactive",
                }
              : {}
          }
          trigger={
            <Button
              onClick={() => {
                setEditingRole(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          }
        />
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredRoles} rowsPerPage={10} />
        </CardContent>
      </Card>
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

export default RoleMaster;