import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/table";
import { Edit, Plus, Search, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { get, post, put, del } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: number;
  loginname: string;
  email: string;
  role_name: string;
  status: number; // 1 = Active, 2 = Inactive
  first_name?: string;
  last_name?: string;
  phone_no?: string; // Changed from phone_number to phone_no
  unit?: number;
  vessel?: number;
  process?: number;
  role?: number;
  user_role?: string; // Changed from role to user_role
  unit_name?: string;
  vessel_name?: string;
  process_name?: string;
}

interface Vessel {
  id: number;
  name: string;
  code: string;
}

interface Unit {
  id: number;
  name: string;
  code: string;
}

interface Process {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface Role {
  id: number;
  role_name: string;
  process_name: string;
  user_role?: number; // The actual role ID used in API calls
}

const UserMaster = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    loginname: "",
    password: "",
    email: "",
    phone_number: "", // Keep as phone_number in form, convert to phone_no in payload
    unit: "",
    vessel: "",
    process: "",
    role: "", // Keep as role in form, convert to user_role in payload
    status: "Active"
  });

  // API data states
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingVessels, setIsLoadingVessels] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const columns: Column<User>[] = [
    { header: "Username", accessor: "loginname" },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role_name" }, // or "role"
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge variant={row.status === 1 ? "default" : "secondary"}>
          {row.status === 1 ? "Active" : "Inactive"}
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

  // Fetch users from API
  const fetchUsers = async (pageNum: number = 1) => {
    try {
      const res = await get(`api/auth/users/?page=${pageNum}&order_by=-loginname`);

      // Access the actual array
      setUsers(res.results?.data || []);

      setTotalPages(Math.ceil((res.count || 0) / 10));
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  // Fetch vessels
  const fetchVessels = async () => {
    setIsLoadingVessels(true);
    try {
      const res = await get('/master/vessels/');
      setVessels(res.data || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch vessels",
        variant: "destructive",
      });
    } finally {
      setIsLoadingVessels(false);
    }
  };

  // Fetch units
  const fetchUnits = async () => {
    setIsLoadingUnits(true);
    try {
      const res = await get('/master/units/');
      setUnits(res.data || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch units",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUnits(false);
    }
  };

  // Fetch processes
  const fetchProcesses = async () => {
    setIsLoadingProcesses(true);
    try {
      const res = await get('/access/processes/?is_dropdown=true');
      setProcesses(res || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch processes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProcesses(false);
    }
  };

  // Fetch roles based on selected process
  const fetchRoles = async (processId: string) => {
    if (!processId) {
      setRoles([]);
      return;
    }
    
    setIsLoadingRoles(true);
    try {
      const res = await get(`/access/role-process-mappings/?process_id=${processId}`);
      
      // Handle different response structures like in RoleAccess
      const rolesData = res?.results || res?.data || res || [];
      const rolesArray = Array.isArray(rolesData) ? rolesData : [];
      setRoles(rolesArray);
    } catch (err) {
      console.error('Error fetching roles:', err);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    fetchVessels();
    fetchUnits();
    fetchProcesses();
  }, [page]);


  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // If process changes, fetch roles for that process
    if (field === 'process') {
      fetchRoles(value);
      // Clear role selection when process changes
      setFormData(prev => ({
        ...prev,
        role: ""
      }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      loginname: "",
      password: "",
      email: "",
      phone_number: "",
      unit: "",
      vessel: "",
      process: "",
      role: "",
      status: "Active"
    });
    setRoles([]);
  };

  // Save / Update API
  const handleSave = async () => {
    if (!formData.loginname?.trim()) {
      toast({
        title: "Validation Error",
        description: "Login name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.first_name?.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.last_name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Last name is required",
        variant: "destructive",
      });
      return;
    }

    if (!editingUser && !formData.password?.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required for new users",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      loginname: formData.loginname,
      email: formData.email,
      phone_no: formData.phone_number, // Changed from phone_number to phone_no
      unit: formData.unit ? parseInt(formData.unit) : null,
      vessel: formData.vessel ? parseInt(formData.vessel) : null,
      process: formData.process ? parseInt(formData.process) : null,
      role: formData.role ? parseInt(formData.role) : null, // Send role ID
      status: formData.status === "Active" ? 1 : 2, // Changed from active to status
    };

    // Only include password for new users
    if (!editingUser && formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingUser) {
        await put(`api/auth/users/${editingUser.id}/`, payload);
        toast({ title: "Success", description: "User updated successfully" });
      } else {
        await post(`api/auth/users/`, payload);
        toast({ title: "Success", description: "User created successfully" });
      }

      fetchUsers(page);
      setIsDialogOpen(false);
      setEditingUser(null);
      resetForm();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      loginname: user.loginname || "",
      password: "",
      email: user.email || "",
      phone_number: user.phone_no || "", // Use phone_no from API
      unit: user.unit?.toString() || "",
      vessel: user.vessel?.toString() || "",
      process: user.process?.toString() || "",
      role: user.role?.toString() || "", // Use role ID for form
      status: user.status === 1 ? "Active" : "Inactive"
    });
    
    // If user has a process, fetch roles for that process
    if (user.process) {
      fetchRoles(user.process.toString());
    }
    
    setIsDialogOpen(true);
  };

  const handleDialogOpen = () => {
    resetForm();
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    resetForm();
  };

  // Delete API
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await del(`api/auth/users/${id}/`);
        
        // Check if the response indicates successful deletion
        if (response.status === 204 || response.message === "Successfully deleted") {
          setUsers((prev) => prev.filter((user) => user.id !== id));
          toast({
            title: "Success",
            description: "User deleted successfully",
          });
        } else {
          // Handle other successful responses
          setUsers((prev) => prev.filter((user) => user.id !== id));
          toast({
            title: "Success",
            description: "User deleted successfully",
          });
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  // Filter by search
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) =>
        user.loginname.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Master</h1>
          <p className="text-muted-foreground">
            Manage users and roles
          </p>
        </div>

        <Button onClick={handleDialogOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredUsers} rowsPerPage={10} />
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

      {/* User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingUser ? "Edit User" : "Add User"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={handleDialogClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            {/* Login Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Login Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loginname">Login Name *</Label>
                  <Input
                    id="loginname"
                    value={formData.loginname}
                    onChange={(e) => handleInputChange('loginname', e.target.value)}
                    placeholder="Enter login name"
                  />
                </div>
                
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Assignment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Assignment Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUnits ? (
                        <SelectItem value="loading" disabled>Loading units...</SelectItem>
                      ) : (
                        units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id.toString()}>
                            {unit.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vessel">Vessel</Label>
                  <Select
                    value={formData.vessel}
                    onValueChange={(value) => handleInputChange('vessel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vessel" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingVessels ? (
                        <SelectItem value="loading" disabled>Loading vessels...</SelectItem>
                      ) : (
                        vessels.map((vessel) => (
                          <SelectItem key={vessel.id} value={vessel.id.toString()}>
                            {vessel.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Process and Role */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Process & Role</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="process">Process</Label>
                  <Select
                    value={formData.process}
                    onValueChange={(value) => handleInputChange('process', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select process" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingProcesses ? (
                        <SelectItem value="loading" disabled>Loading processes...</SelectItem>
                      ) : (
                        processes.map((process) => (
                          <SelectItem key={process.id} value={process.id.toString()}>
                            {process.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                    disabled={!formData.process}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.process ? "Select role" : "Select process first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRoles ? (
                        <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                      ) : roles.length > 0 ? (
                        roles.map((role) => {
                          // Use user_role if available, otherwise fall back to id
                          const roleValue = role.user_role?.toString() || role.id.toString();
                          return (
                            <SelectItem key={role.id} value={roleValue}>
                              {role.role_name}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem value="no-roles" disabled>
                          {formData.process ? "No roles available" : "Select process first"}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserMaster;