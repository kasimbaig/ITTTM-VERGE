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

interface Country {
  id: number;
  name: string;
  code: string;
  active: number;
}

interface State {
  id: number;
  name: string;
  code: string;
  country_name?: string;
  country?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

const StateMaster = () => {
  const { toast } = useToast();
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Table columns
  const columns: Column<State>[] = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
    { header: "Country", accessor: "country_name" },
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

  // Fetch countries from API
  const fetchCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const res = await get(`/master/countries/`);
      const countriesData = res.results || res.data || [];
      setCountries(countriesData);
    } catch (err) {
      console.error("Failed to fetch countries", err);
      toast({
        title: "Error",
        description: "Failed to fetch countries",
        variant: "destructive",
      });
      setCountries([]);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  // Fetch states from API
  const fetchStates = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/states/?page=${pageNum}`);
      setStates(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      console.error("Failed to fetch states", err);
      toast({
        title: "Error",
        description: "Failed to fetch states",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchStates(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "State name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.country) {
      toast({
        title: "Validation Error",
        description: "Country selection is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      country: parseInt(formData.country),
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingState) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingState.id };
        await post(`/master/states/`, updatePayload);
        toast({ title: "Success", description: "State updated successfully" });
      } else {
        // CREATE
        await post(`/master/states/`, payload);
        toast({ title: "Success", description: "State created successfully" });
      }

      fetchStates(page); // refresh table
      setIsDialogOpen(false);
      setEditingState(null);
    } catch (err) {
      console.error("Failed to save state", err);
      toast({
        title: "Error",
        description: "Failed to save state",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (state: State) => {
    setEditingState(state);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this state?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/states/`, payload);
        setStates((prev) => prev.filter((s) => s.id !== id));
        toast({
          title: "Success",
          description: "State deleted successfully",
        });
      } catch (err) {
        console.error("Delete failed", err);
        toast({
          title: "Error",
          description: "Failed to delete state",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.country_name && s.country_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">State</h1>
          <p className="text-muted-foreground">
            Manage states and provinces
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingState ? "Edit State" : "Add State"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "State Name", type: "text", required: true },
            { name: "code", label: "State Code", type: "text" },
            {
              name: "country",
              label: "Country",
              type: "dropdown",
              required: true,
              options: (() => {
                if (isLoadingCountries) {
                  return [{ id: "loading", name: "Loading countries..." }];
                }
                if (countries.length === 0) {
                  return [{ id: "no-countries", name: "No countries available" }];
                }
                return countries.map(country => ({ 
                  id: country.id, 
                  name: country.name 
                }));
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
            editingState
              ? {
                  name: editingState.name,
                  code: editingState.code,
                  country: editingState.country || "",
                  status: editingState.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new state
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingState(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add State
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
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* States Table */}
      <Card>
        <CardHeader>
          <CardTitle>States</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredStates} rowsPerPage={10} />
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

export default StateMaster;
