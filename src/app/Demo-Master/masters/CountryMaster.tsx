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
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

const CountryMaster = () => {
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Table columns
  const columns: Column<Country>[] = [
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

  // Fetch countries from API
  const fetchCountries = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/countries/?page=${pageNum}`);
      setCountries(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      console.error("Failed to fetch countries", err);
      toast({
        title: "Error",
        description: "Failed to fetch countries",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCountries(page);
  }, [page]);

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Country name is required",
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
      if (editingCountry) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingCountry.id };
        await post(`/master/countries/`, updatePayload);
        toast({ title: "Success", description: "Country updated successfully" });
      } else {
        // CREATE
        await post(`/master/countries/`, payload);
        toast({ title: "Success", description: "Country created successfully" });
      }

      fetchCountries(page); // refresh table
      setIsDialogOpen(false);
      setEditingCountry(null);
    } catch (err) {
      console.error("Failed to save country", err);
      toast({
        title: "Error",
        description: "Failed to save country",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setIsDialogOpen(true);
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this country?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/countries/`, payload);
        setCountries((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Success",
          description: "Country deleted successfully",
        });
      } catch (err) {
        console.error("Delete failed", err);
        toast({
          title: "Error",
          description: "Failed to delete country",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Country</h1>
          <p className="text-muted-foreground">
            Manage countries and their information
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingCountry ? "Edit Country" : "Add Country"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "Country Name", type: "text", required: true },
            { name: "code", label: "Country Code", type: "text" },
            {
              name: "status",
              label: "Active",
              type: "checkbox",
              required: false,
            },
          ]}
          onSubmit={handleSave}
          initialValues={
            editingCountry
              ? {
                  name: editingCountry.name,
                  code: editingCountry.code,
                  status: editingCountry.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new country
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingCountry(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Country
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
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Countries</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredCountries} rowsPerPage={10} />
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

export default CountryMaster;
