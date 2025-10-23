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
  command_name: string;
  code: string;
  active: number;
}

interface Station {
  id: number;
  name: string;
  code: string;
  command_name?: string;
  command?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

const StationMaster = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<Station[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoadingCommands, setIsLoadingCommands] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Table columns
  const columns: Column<Station>[] = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
    { header: "Command", accessor: "command_name" },
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
  const fetchCommands = async () => {
    setIsLoadingCommands(true);
    try {
      const res = await get(`/master/commands/`);

      const commandsData = res.results || res.data || [];
      setCommands(commandsData);

    } catch (err) {
      console.error("Failed to fetch commands", err);
      toast({
        title: "Error",
        description: "Failed to fetch commands",
        variant: "destructive",
      });
      setCommands([]);
    } finally {
      setIsLoadingCommands(false);
    }
  };

  // Fetch stations from API
  const fetchStations = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/stations/?page=${pageNum}`);
      setStations(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      console.error("Failed to fetch stations", err);
      toast({
        title: "Error",
        description: "Failed to fetch stations",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommands();
  }, []);

  useEffect(() => {
    fetchStations(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Station name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.command) {
      toast({
        title: "Validation Error",
        description: "Command selection is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      command: parseInt(formData.command),
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingStation) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingStation.id };
        await post(`/master/stations/`, updatePayload);
        toast({ title: "Success", description: "Station updated successfully" });
      } else {
        // CREATE
        await post(`/master/stations/`, payload);
        toast({ title: "Success", description: "Station created successfully" });
      }

      fetchStations(page); // refresh table
      setIsDialogOpen(false);
      setEditingStation(null);
    } catch (err) {
      console.error("Failed to save station", err);
      toast({
        title: "Error",
        description: "Failed to save station",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this station?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/stations/`, payload);
        setStations((prev) => prev.filter((s) => s.id !== id));
        toast({
          title: "Success",
          description: "Station deleted successfully",
        });
      } catch (err) {
        console.error("Delete failed", err);
        toast({
          title: "Error",
          description: "Failed to delete station",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.command_name && s.command_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Station</h1>
          <p className="text-muted-foreground">
            Manage naval stations and their locations
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingStation ? "Edit Station" : "Add Station"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Station Name", type: "text", required: true },
            { name: "code", label: "Station Code", type: "text" },
            {
              name: "command",
              label: "Command",
              type: "dropdown",
              required: true,
              options: (() => {
                if (isLoadingCommands) {
                  return [{ id: "loading", name: "Loading commands..." }];
                }
                if (commands.length === 0) {
                  return [{ id: "no-commands", name: "No commands available" }];
                }
                const mappedOptions = commands.map(cmd => ({ 
                  id: cmd.id, 
                  name: cmd.command_name || cmd.name || 'Unknown Command' 
                }));
;
                return mappedOptions;
              })(),
            },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingStation
              ? {
                  name: editingStation.name,
                  code: editingStation.code,
                  command: editingStation.command || "",
                  status: editingStation.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new station
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingStation(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Station
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
              placeholder="Search stations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stations</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredStations} rowsPerPage={10} />
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

export default StationMaster;
