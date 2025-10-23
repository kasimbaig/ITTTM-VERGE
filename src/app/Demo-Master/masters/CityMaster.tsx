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
  active: number;
}

interface City {
  id: number;
  name: string;
  code: string;
  state_name?: string;
  country_name?: string;
  state?: number;
  country?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
}

const CityMaster = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Table columns
  const columns: Column<City>[] = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
    { header: "State", accessor: "state_name" },
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

  // Fetch states from API based on country
  const fetchStates = async (countryId?: number) => {
    setIsLoadingStates(true);
    try {
      const endpoint = countryId ? `/master/states/?country=${countryId}` : `/master/states/`;
      const res = await get(endpoint);
      const statesData = res.results || res.data || [];
      setStates(statesData);
    } catch (err) {
      console.error("Failed to fetch states", err);
      toast({
        title: "Error",
        description: "Failed to fetch states",
        variant: "destructive",
      });
      setStates([]);
    } finally {
      setIsLoadingStates(false);
    }
  };

  // Fetch cities from API
  const fetchCities = async (pageNum: number = 1) => {
    try {
      const res = await get(`/master/cities/?page=${pageNum}`);
      setCities(res.results || []);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      console.error("Failed to fetch cities", err);
      toast({
        title: "Error",
        description: "Failed to fetch cities",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchCities(page);
  }, [page]);

  // Handle initial country selection when dialog opens
  useEffect(() => {
    if (isDialogOpen && editingCity && editingCity.country) {
      setSelectedCountryId(editingCity.country);
      fetchStates(editingCity.country);
    }
  }, [isDialogOpen, editingCity]);

  // Handle country selection change
  const handleCountryChange = (countryId: number) => {
    setSelectedCountryId(countryId);
    // Clear states only if no country selected
    if (!countryId) {
      setStates([]);
    } else {
      // Fetch states for the selected country
      fetchStates(countryId);
    }
  };

  // Save / Update API
  const handleSave = async (formData: any) => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "City name is required",
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

    if (!formData.state) {
      toast({
        title: "Validation Error",
        description: "State selection is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      country: parseInt(formData.country),
      state: parseInt(formData.state),
      active: formData.status === "Active" ? 1 : 2,
    };

    try {
      if (editingCity) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingCity.id };
        await post(`/master/cities/`, updatePayload);
        toast({ title: "Success", description: "City updated successfully" });
      } else {
        // CREATE
        await post(`/master/cities/`, payload);
        toast({ title: "Success", description: "City created successfully" });
      }

      fetchCities(page); // refresh table
      setIsDialogOpen(false);
      setEditingCity(null);
    } catch (err) {
      console.error("Failed to save city", err);
      toast({
        title: "Error",
        description: "Failed to save city",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setIsDialogOpen(true);
    // If editing a city with a country, fetch states for that country
    if (city.country) {
      setSelectedCountryId(city.country);
      fetchStates(city.country);
    }
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this city?")) {
      try {
        const payload = { id: id, delete: true };
        await post(`/master/cities/`, payload);
        setCities((prev) => prev.filter((c) => c.id !== id));
        toast({
          title: "Success",
          description: "City deleted successfully",
        });
      } catch (err) {
        console.error("Delete failed", err);
        toast({
          title: "Error",
          description: "Failed to delete city",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.state_name && c.state_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.country_name && c.country_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">City</h1>
          <p className="text-muted-foreground">
            Manage cities and urban areas
          </p>
        </div>

        <DynamicFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title={editingCity ? "Edit City" : "Add City"}
          description="Fill out the details below"
          fields={[
            { name: "name", label: "City Name", type: "text", required: true },
            { name: "code", label: "City Code", type: "text" },
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
              onChange: (value: string) => {
                const countryId = parseInt(value);
                if (countryId && !isNaN(countryId)) {
                  handleCountryChange(countryId);
                }
              },
            },
            {
              name: "state",
              label: "State",
              type: "dropdown",
              required: true,
              options: (() => {
                // If no country selected, show placeholder
                if (!selectedCountryId) {
                  return [{ id: "", name: "Please select a country first" }];
                }
                // If loading states, show loading message
                if (isLoadingStates) {
                  return [{ id: "", name: "Loading states..." }];
                }
                // If no states found, show no states message
                if (states.length === 0) {
                  return [{ id: "", name: "No states available for selected country" }];
                }
                // Return actual states
                return states.map(state => ({ 
                  id: state.id, 
                  name: state.name 
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
            editingCity
              ? {
                  name: editingCity.name,
                  code: editingCity.code,
                  country: editingCity.country || "",
                  state: editingCity.state || "",
                  status: editingCity.active === 1 ? "Active" : "Inactive",
                }
              : {
                  status: "Active" // Default to Active when adding new city
                }
          }
          trigger={
            <Button
              onClick={() => {
                setEditingCity(null);
                setSelectedCountryId(null);
                setStates([]);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add City
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
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredCities} rowsPerPage={10} />
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

export default CityMaster;
