// Users.tsx
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UserTable from "@/components/dashboard/UserTable";
import { useEffect } from "react";
import { fetchUsers, setRoleFilter, setSearchQuery, setStatusFilter } from "@/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/use-AppDispatch";
import { RootState } from "@/store/store";
import { AddAdminDialog } from "@/components/dashboard/AddAdminDialog";

export default function Users() {
  const dispatch = useAppDispatch();
  const { searchQuery, roleFilter, statusFilter, loading, error } = useAppSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
          <div className="flex gap-4">
            <AddAdminDialog />
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="pl-9"
            />
          </div>
          <div className="flex gap-4">
            <Select 
              value={roleFilter} 
              onValueChange={(value: 'all' | 'User' | 'Admin' | 'Instructor') => dispatch(setRoleFilter(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Instructor">Instructor</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={statusFilter} 
              onValueChange={(value: 'all' | 'active' | 'inactive') => dispatch(setStatusFilter(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading users...</p>
          </div>
        ) : (
          <UserTable />
        )}
      </div>
    </DashboardLayout>
  );
}