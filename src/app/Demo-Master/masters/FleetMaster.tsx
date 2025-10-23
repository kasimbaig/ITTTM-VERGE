import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DataTable, Column } from "@/components/ui/table";
import { DynamicFormDialog } from "@/components/DynamicFormDialog";

interface Fleet {
  id: string;
  name: string;
  code: string;
  command: string;
  vesselCount: number;
  status: "active" | "inactive";
  description: string;
  createdAt: string;
}

const FleetMaster = () => {
  const { toast } = useToast();
  const [fleets, setFleets] = useState<Fleet[]>([
    {
      id: "1",
      name: "Eastern Fleet",
      code: "EF",
      command: "Eastern Naval Command",
      vesselCount: 45,
      status: "active",
      description: "Fleet operations in the Eastern region",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Western Fleet",
      code: "WF",
      command: "Western Naval Command",
      vesselCount: 52,
      status: "active",
      description: "Fleet operations in the Western region",
      createdAt: "2024-01-15",
    },
    {
      id: "3",
      name: "Southern Fleet",
      code: "SF",
      command: "Southern Naval Command",
      vesselCount: 38,
      status: "active",
      description: "Fleet operations in the Southern region",
      createdAt: "2024-01-20",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Table columns
  const columns: Column<Fleet>[] = [
    { header: "Fleet Name", accessor: "name" },
    { header: "Code", accessor: "code", render: (fleet) => <Badge>{fleet.code}</Badge> },
    { header: "Command", accessor: "command" },
    { header: "Vessels", accessor: "vesselCount" },
    {
      header: "Status",
      accessor: "status",
      render: (fleet) => (
        <Badge variant={fleet.status === "active" ? "default" : "secondary"}>
          {fleet.status}
        </Badge>
      ),
    },
    { header: "Created", accessor: "createdAt" },
    {
      header: "Actions",
      accessor: "actions",
      render: (fleet) => (
        <div className="space-x-2 text-right">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingFleet(fleet);
              setIsDialogOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(fleet.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Form fields for DynamicFormDialog
  const fields = [
    { name: "name", label: "Fleet Name", type: "text", required: true },
    { name: "code", label: "Fleet Code", type: "text", required: true },
    {
      name: "command",
      label: "Command",
      type: "dropdown",
      options: [
        { value: "Eastern Naval Command", label: "Eastern Naval Command" },
        { value: "Western Naval Command", label: "Western Naval Command" },
        { value: "Southern Naval Command", label: "Southern Naval Command" },
        { value: "Naval Headquarters", label: "Naval Headquarters" },
      ],
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "dropdown",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    { name: "description", label: "Description", type: "textarea" },
  ];

  const filteredFleets = fleets.filter(
    (fleet) =>
      fleet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fleet.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fleet.command.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (formData: any) => {
    if (editingFleet) {
      setFleets((prev) =>
        prev.map((fleet) =>
          fleet.id === editingFleet.id ? { ...fleet, ...formData } : fleet
        )
      );
      toast({ title: "Success", description: "Fleet updated successfully" });
    } else {
      const newFleet: Fleet = {
        id: Date.now().toString(),
        vesselCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        ...formData,
      };
      setFleets((prev) => [...prev, newFleet]);
      toast({ title: "Success", description: "Fleet created successfully" });
    }
    setIsDialogOpen(false);
    setEditingFleet(null);
  };

  const handleDelete = (id: string) => {
    setFleets((prev) => prev.filter((fleet) => fleet.id !== id));
    toast({ title: "Success", description: "Fleet deleted successfully" });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Fleet Master</h1>
          <p className="text-muted-foreground mt-2">Manage fleet configurations</p>
        </div>
        <Button
          variant="naval"
          onClick={() => {
            setEditingFleet(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Fleet
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fleets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Fleet Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet List</CardTitle>
          <CardDescription>Total: {filteredFleets.length} fleets</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredFleets} />
        </CardContent>
      </Card>

      {/* Reusable Popup */}
      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingFleet ? "Edit Fleet" : "Add Fleet"}
        description={
          editingFleet ? "Update fleet information" : "Create a new fleet"
        }
        fields={[
            { name: "name", label: "Unit Name", type: "text", required: true },
            { name: "code", label: "Unit Code", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
            {
              name: "status",
              label: "Status",
              type: "dropdown",
              options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ],
            },
          ]}
        initialValues={editingFleet || {}}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default FleetMaster;
