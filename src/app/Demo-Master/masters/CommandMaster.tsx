import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog } from "@/components/DynamicFormDialog";
import { get, post, put, del } from "@/lib/api";

interface Command {
  id: number;
  name: string;
  code: string;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

const CommandMaster = () => {
  const { toast } = useToast();
  const [commands, setCommands] = useState<Command[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Table columns
  const columns: Column<Command>[] = [
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
    // { header: "Created Date", accessor: "created_on" },
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

  // Fetch commands from API
  const fetchCommands = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/commands/?page=${pageNum}`);
      setCommands(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      console.error("Failed to fetch commands", err);
      toast({
        title: "Error",
        description: "Failed to fetch commands",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommands(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Command name is required",
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
      if (editingCommand) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingCommand.id };
        await post(`/master/commands/`, updatePayload);
        toast({ title: "Success", description: "Command updated successfully" });
      } else {
        // CREATE
        await post(`/master/commands/`, payload);
        toast({ title: "Success", description: "Command created successfully" });
      }

      fetchCommands(page); // refresh table
      setIsDialogOpen(false);
      setEditingCommand(null);
    } catch (err) {
      console.error("Failed to save command", err);
      toast({
        title: "Error",
        description: "Failed to save command",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (command: Command) => {
    setEditingCommand(command);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this command?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/commands/`, payload);
        setCommands((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Success",
          description: "Command deleted successfully",
        });
      } catch (err) {
        console.error("Delete failed", err);
        toast({
          title: "Error",
          description: "Failed to delete command",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredCommands = commands.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Command</h1>
          <p className="text-muted-foreground">
            Manage naval commands and their headquarters
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingCommand ? "Edit Command" : "Add Command"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Command Name", type: "text", required: true },
            { name: "code", label: "Command Code", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingCommand
              ? {
                  name: editingCommand.name,
                  code: editingCommand.code,
                  status: editingCommand.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new command
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingCommand(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Command
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
              placeholder="Search commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Commands Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredCommands} rowsPerPage={10} />
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

export default CommandMaster;
