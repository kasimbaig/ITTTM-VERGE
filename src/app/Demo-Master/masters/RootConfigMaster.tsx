import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column, TablePagination } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DynamicFormDialog } from "@/components/DynamicFormDialog";
import { get, post, getUnitId } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/ui/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";

interface RouteConfig {
  id: number;
  vessel: number;
  sub_module: number;
  level: number;
  route_type: "internal" | "external";
  directorate: number;
  user: number;
  description: string;
  permissions: {
    permission_type: "edit" | "comment";
    is_granted: boolean;
  }[];
  active: number;
  module?: string;
  subModule?: string;
  ship?: string;
  unit?: string;
  userName?: string;
  // API response fields
  vessel_name?: string;
  sub_module_name?: string;
  user_name?: string;
  directorate_name?: string;
  module_name?: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface Module {
  id: number;
  name: string;
}

interface SubModule {
  id: number;
  name: string;
  module: {
    id: number;
    name: string;
  };
}

interface Vessel {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
}

interface User {
  id: number;
  loginname: string;
}

const RouteConfigMaster = () => {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<RouteConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RouteConfig | null>(null);

  const [modules, setModules] = useState<DropdownOption[]>([]);
  const [subModules, setSubModules] = useState<DropdownOption[]>([]);
  const [ships, setShips] = useState<DropdownOption[]>([]);
  const [units, setUnits] = useState<DropdownOption[]>([]);
  const [users, setUsers] = useState<DropdownOption[]>([]);
  
  const [dropdownsLoading, setDropdownsLoading] = useState(false);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [subModulesLoading, setSubModulesLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [editingModuleId, setEditingModuleId] = useState<string>("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const localUnitId = getUnitId();

  /

  // Delete dialog hook
  const deleteDialog = useDeleteDialog({
    onConfirm: async (itemId) => {
      if (itemId) {
        await handleDelete(itemId as number);
      }
    },
    title: "Delete Route Config",
    description: "Are you sure you want to delete this route configuration? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel"
  });

  const columns: Column<RouteConfig>[] = [
    { header: "Module", accessor: "module_name" },
    { header: "Sub Module", accessor: "sub_module_name" },
    { header: "Vessel", accessor: "vessel_name" },
    { header: "Directorate", accessor: "directorate_name" },
    { header: "User", accessor: "user_name" },
    { header: "Level", accessor: "level" },
    { header: "Route Type", accessor: "route_type" },
    {
      header: "Permissions",
      accessor: "permissions",
      render: (row) => (
        <div>
          {row.permissions?.map((perm, index) => (
            <Badge key={index} variant={perm.is_granted ? "default" : "secondary"} className="mr-1">
              {perm.permission_type}: {perm.is_granted ? "Granted" : "Denied"}
            </Badge>
          ))}
        </div>
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
            onClick={() => deleteDialog.openDialog({ id: row.id, name: row.description })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const fetchDropdownData = async () => {
    if (dropdownsLoaded) return;
    
    try {
      setDropdownsLoading(true);
      
      const modulesRes = await get(`/master/modules/`);
      let modulesData = [];
      
      if (Array.isArray(modulesRes)) {
        modulesData = modulesRes;
      } else if (modulesRes && Array.isArray(modulesRes.results)) {
        modulesData = modulesRes.results;
      } else if (modulesRes && Array.isArray(modulesRes.data)) {
        modulesData = modulesRes.data;
      }
      
      const modulesOptions = modulesData.map((module: Module) => ({
        value: module.id.toString(),
        label: module.name || `Module ${module.id}`
      }));
      setModules(modulesOptions);

      const vesselsRes = await get(`/master/vessels/`);
      let vesselsData = [];
      
      if (Array.isArray(vesselsRes)) {
        vesselsData = vesselsRes;
      } else if (vesselsRes && Array.isArray(vesselsRes.results)) {
        vesselsData = vesselsRes.results;
      } else if (vesselsRes && Array.isArray(vesselsRes.data)) {
        vesselsData = vesselsRes.data;
      }
      
      const vesselsOptions = vesselsData.map((vessel: Vessel) => ({
        value: vessel.id.toString(),
        label: vessel.name || `Vessel ${vessel.id}`
      }));
      setShips(vesselsOptions);

      const unitsRes = await get(`master/units/`);
      let unitsData = [];
      
      if (Array.isArray(unitsRes)) {
        unitsData = unitsRes;
      } else if (unitsRes && Array.isArray(unitsRes.results)) {
        unitsData = unitsRes.results;
      } else if (unitsRes && Array.isArray(unitsRes.data)) {
        unitsData = unitsRes.data;
      }
      
      const unitsOptions = unitsData.map((unit: Unit) => ({
        value: unit.id.toString(),
        label: unit.name || `Unit ${unit.id}`
      }));
      setUnits(unitsOptions);

      
      setDropdownsLoaded(true);
      
    } catch (err: any) {
      console.error('Error fetching dropdown data:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch dropdown data",
        variant: "destructive",
      });
    } finally {
      setDropdownsLoading(false);
    }
  };

  const fetchUsersByUnit = async (unitId: string) => {
    if (!unitId) {
      setUsers([]);
      return;
    }

    try {
      const usersRes = await get(`/api/auth/users/?unit_id=${unitId}`);
      let usersData = [];
      
      if (usersRes && usersRes.results && Array.isArray(usersRes.results.data)) {
        usersData = usersRes.results.data;
      } else if (Array.isArray(usersRes)) {
        usersData = usersRes;
      } else if (usersRes && Array.isArray(usersRes.results)) {
        usersData = usersRes.results;
      } else if (usersRes && Array.isArray(usersRes.data)) {
        usersData = usersRes.data;
      }
      
      const usersOptions = usersData.map((user: User) => ({
        value: user.id.toString(),
        label: user.loginname || `User ${user.id}`
      }));
      
      setUsers(usersOptions);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch users",
        variant: "destructive",
      });
      setUsers([]);
    }
  };

  const fetchSubModules = async (moduleId: string) => {
    if (!moduleId) {
      setSubModules([]);
      return;
    }

    try {
      setSubModulesLoading(true);
      const subModulesRes = await get(`/master/submodules/?module_id=${moduleId}`);
      let subModulesData = [];
      
      if (Array.isArray(subModulesRes)) {
        subModulesData = subModulesRes;
      } else if (subModulesRes && Array.isArray(subModulesRes.data)) {
        subModulesData = subModulesRes.data;
      } else if (subModulesRes && Array.isArray(subModulesRes.results)) {
        subModulesData = subModulesRes.results;
      }
      
      const subModulesOptions = subModulesData.map((subModule: SubModule) => ({
        value: subModule.id.toString(),
        label: subModule.name || `Sub Module ${subModule.id}`
      }));
      
      setSubModules(subModulesOptions);
    } catch (err: any) {
      console.error('Error fetching submodules:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to fetch submodules",
        variant: "destructive",
      });
      setSubModules([]);
    } finally {
      setSubModulesLoading(false);
    }
  };

  const fetchModuleBySubModuleId = async (subModuleId: number): Promise<string> => {
    try {
      const subModuleRes = await get(`/master/submodules/?id=${subModuleId}`);
      let subModuleData = null;
      
      if (subModuleRes && subModuleRes.data && Array.isArray(subModuleRes.data) && subModuleRes.data.length > 0) {
        subModuleData = subModuleRes.data[0];
      } else if (Array.isArray(subModuleRes) && subModuleRes.length > 0) {
        subModuleData = subModuleRes[0];
      }
      
      if (subModuleData && subModuleData.module) {
        return subModuleData.module.name || `Module ${subModuleData.module.id}`;
      }
      
      return `Module for SubModule ${subModuleId}`;
    } catch (err: any) {
      console.error('Error fetching module by submodule ID:', err);
      return `Module for SubModule ${subModuleId}`;
    }
  };

  const fetchConfigs = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const res = await get(`/config/route-configs/?page=${pageNum}`);
      
      // Process each config to fetch module names
      const processedConfigs = await Promise.all(
        (res.results || []).map(async (config: RouteConfig) => {
          try {
            const moduleName = await fetchModuleBySubModuleId(config.sub_module);
            return {
              ...config,
              module_name: moduleName
            };
          } catch (err) {
            console.error('Error processing config:', err);
            return {
              ...config,
              module_name: `Module for SubModule ${config.sub_module}`
            };
          }
        })
      );
      
      setConfigs(processedConfigs);
      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch route configs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs(page);
  }, [page]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (isDialogOpen && !dropdownsLoaded) {
      fetchDropdownData();
    }
  }, [isDialogOpen, dropdownsLoaded]);

  useEffect(() => {
    if (selectedModule) {
      fetchSubModules(selectedModule);
    } else {
      setSubModules([]);
    }
  }, [selectedModule]);

  useEffect(() => {
    if (selectedUnit) {
      fetchUsersByUnit(selectedUnit);
     } else {
      setUsers([]);
    }
  }, [selectedUnit]);

  // Check if selected unit matches the current unit ID
// Check if selected unit matches the current unit ID - FIXED COMPARISON
const shouldShowUserFields = selectedUnit.toString() === localUnitId.toString();


  const handleSave = async (formData: any) => {
    // Validate level field - prevent negative values
    const levelStr = formData.level?.toString().trim();
    if (!levelStr) {
      toast({
        title: "Validation Error",
        description: "Level is required",
        variant: "destructive",
      });
      return;
    }

    // Check if level contains negative sign or is not a valid positive number
    if (levelStr.includes('-') || levelStr.includes('+') || isNaN(parseInt(levelStr)) || parseInt(levelStr) < 0) {
      toast({
        title: "Validation Error",
        description: "Level must be a positive number (0 or greater). Negative values are not allowed.",
        variant: "destructive",
      });
      return;
    }

    const level = parseInt(levelStr);
    if (level < 0) {
      toast({
        title: "Validation Error",
        description: "Level must be a number greater than or equal to 0",
        variant: "destructive",
      });
      return;
    }

    // Additional validation for required fields
    if (!formData.ship || !formData.subModule || !formData.unit || !formData.routeType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Only require permission type if user fields are shown
    if (shouldShowUserFields && !formData.permissionType) {
      toast({
        title: "Validation Error",
        description: "Permission Type is required when Directorate matches current unit",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      vessel: parseInt(formData.ship),
      sub_module: parseInt(formData.subModule),
      level: level,
      route_type: formData.routeType,
      directorate: parseInt(formData.unit),
      user: shouldShowUserFields && formData.user ? parseInt(formData.user) : null,
      permissions: shouldShowUserFields ? [
        {
          permission_type: formData.permissionType || "edit",
          is_granted: true
        }
      ] : []
    };

    try {
      if (editingConfig) {
        // UPDATE - using POST with ID in payload
        const updatePayload = { ...payload, id: editingConfig.id };
        await post(`/config/route-configs/`, updatePayload);
        toast({ title: "Success", description: "Route Config updated successfully" });
      } else {
        // CREATE
        await post(`/config/route-configs/`, payload);
        toast({ title: "Success", description: "Route Config created successfully" });
      }

      fetchConfigs(page);
      setIsDialogOpen(false);
      setEditingConfig(null);
      setSelectedModule("");
      setSelectedUnit("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save route config",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (config: RouteConfig) => {
    setEditingConfig(config);
    
    // Fetch the module ID for the submodule to set the correct module selection
    try {
      const subModuleRes = await get(`/master/submodules/?id=${config.sub_module}`);
      let subModuleData = null;
      
      if (subModuleRes && subModuleRes.data && Array.isArray(subModuleRes.data) && subModuleRes.data.length > 0) {
        subModuleData = subModuleRes.data[0];
      } else if (Array.isArray(subModuleRes) && subModuleRes.length > 0) {
        subModuleData = subModuleRes[0];
      }
      
      if (subModuleData && subModuleData.module) {
        const moduleId = subModuleData.module.id.toString();
        setSelectedModule(moduleId);
        setEditingModuleId(moduleId);
      } else {
        setSelectedModule("");
        setEditingModuleId("");
      }
    } catch (err) {
      console.error('Error fetching module for edit:', err);
      setSelectedModule("");
      setEditingModuleId("");
    }
    
    setSelectedUnit(config.directorate?.toString() || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const payload = { id: id, delete: true };
      await post(`/config/route-configs/`, payload);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Success",
        description: "Route Config deleted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete route config",
        variant: "destructive",
      });
      throw err; // Re-throw to let the dialog handle the error state
    }
  };

  const handleAddButtonClick = () => {
    setEditingConfig(null);
    setSelectedModule("");
    setSelectedUnit("");
    setIsDialogOpen(true);
  };

  const handleModuleChange = (moduleId: string) => {

    setSelectedModule(moduleId);
    setSubModules([]);
  };

  const handleUnitChange = (unitId: string) => {

    setSelectedUnit(unitId);
  };

  const filteredConfigs = configs.filter((c) =>
    c.vessel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sub_module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.directorate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Base form fields
  const baseFormFields = [
    {
      name: "module",
      label: "Module",
      type: "searchable-dropdown",
      options: modules,
      placeholder: "Select module",
      loading: dropdownsLoading,
      onChange: handleModuleChange,
      required: true,
      row: 1,
      width: "w-auto"
    },
    {
      name: "subModule",
      label: "Sub Module",
      type: "searchable-dropdown",
      options: subModules,
      placeholder: selectedModule ? "Select sub module" : "Please select module first",
      loading: subModulesLoading,
      disabled: !selectedModule,
      clearable: true,
      required: true,
      row: 1,
      width: "w-auto"
    },
    {
      name: "ship",
      label: "Vessel",
      type: "searchable-dropdown",
      options: ships,
      placeholder: "Select vessel",
      loading: dropdownsLoading,
      required: true,
      row: 2,
      width: "w-auto"
    },
    {
      name: "routeType",
      label: "Route Type",
      type: "radio",
      options: [
        { value: "internal", label: "Internal" },
        { value: "external", label: "External" }
      ],
      required: true,
      row: 2,
      width: "w-auto"
    },
    {
      name: "level",
      label: "Level",
      type: "text",
      placeholder: "Enter level (minimum 0)",
      required: true,
      row: 3,
      width: "w-auto",
      onChange: (value: string) => {
        // Prevent negative values
        if (value.includes('-')) {
          toast({
            title: "Invalid Input",
            description: "Negative values are not allowed. Please enter a positive number.",
            variant: "destructive",
          });
          return ""; // Return empty string to clear the field
        }
        
        // Allow only digits
        const cleanValue = value.replace(/[^0-9]/g, '');
        
        // Show warning if user tries to enter non-numeric characters
        if (value !== cleanValue && value.length > 0) {
          toast({
            title: "Invalid Input",
            description: "Only numbers are allowed in the level field.",
            variant: "destructive",
          });
        }
        
        return cleanValue;
      }
    },
    {
      name: "unit",
      label: "Directorate",
      type: "searchable-dropdown",
      options: units,
      placeholder: "Select directorate",
      loading: dropdownsLoading,
      onChange: handleUnitChange,
      required: true,
      row: 3,
      width: "w-auto"
    }
  ];

  // User and permission fields (only shown when unit matches)
  const userPermissionFields = shouldShowUserFields ? [
    {
      name: "user",
      label: "User",
      type: "searchable-dropdown",
      options: users,
      placeholder: selectedUnit ? "Select user" : "Please select directorate first",
      loading: dropdownsLoading,
      disabled: !selectedUnit,
      clearable: true,
      row: 4,
      width: "w-auto"
    },
    {
      name: "permissionType",
      label: "Permission Type",
      type: "radio",
      options: [
        { value: "edit", label: "Edit" },
        { value: "comment", label: "Comment" }
      ],
      required: true,
      row: 4
    }
  ] : [];

  // Route type field is now included in baseFormFields

  // Combine all fields based on condition
  const formFields = [
    ...baseFormFields,
    ...userPermissionFields
  ];


  return (
    <div className="">
      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={filteredConfigs}
            rowsPerPage={10}
            showImport={false}
            showExport={false}
            title="Route Config Master"
            description="Manage route configuration settings"
            showSearch={true}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search configs..."
            showAddButton={true}
            addButtonText="Add Route Config"
            onAddButtonClick={handleAddButtonClick}
          />
        </CardContent>
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Card>

      <DynamicFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {

          setIsDialogOpen(open);
          if (!open) {
            setEditingConfig(null);
            setSelectedModule("");
            setSelectedUnit("");
            setEditingModuleId("");
          }
        }}
        title={editingConfig ? "Edit Route Config" : "Add Route Config"}
        description="Fill out the details below"
        fields={formFields}
        onSubmit={handleSave}
        initialValues={
          editingConfig
            ? {
                module: editingModuleId,
                subModule: editingConfig.sub_module?.toString(),
                ship: editingConfig.vessel?.toString(),
                level: editingConfig.level,
                unit: editingConfig.directorate?.toString(),
                user: editingConfig.user?.toString(),
                routeType: editingConfig.route_type,
                permissionType: editingConfig.permissions?.[0]?.permission_type,
              }
            : {}
        }
      />
      
      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.title}
        description={deleteDialog.description}
        itemName={deleteDialog.itemToDelete?.name}
        isLoading={deleteDialog.isLoading}
        confirmText={deleteDialog.confirmText}
        cancelText={deleteDialog.cancelText}
      />
    </div>
  );
};

export default RouteConfigMaster;