import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash, Eye } from "lucide-react";
import { deleteUser } from "@/store/slices/userSlice";
import { useState } from "react";
import UserEditDialog from "./UserEditDialog";
import UserViewDialog from "./UserViewDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/use-AppDispatch";
import { RootState } from "@/store/store";

export default function UserTable() {
  const dispatch = useAppDispatch();
  const {
    loading,
    error,
    users = [],
    searchQuery,
    roleFilter,
    statusFilter,
  } = useAppSelector((state: RootState) => state.user);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const matchesSearch =
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
    : [];

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete user"
        );
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(7)].map((_, i) => (
                <TableHead key={`head-${i}`}>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={`row-${i}`}>
                {[...Array(7)].map((_, j) => (
                  <TableCell key={`cell-${i}-${j}`}>
                    <Skeleton className="h-4 w-[80%]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

 

  return (
  <div className="rounded-md border p-4 space-y-4">
    {/* Error message card */}
    {error && (
      <div className="rounded-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">
        <strong className="font-medium">Error:</strong> {error}
      </div>
    )}

    {/* User table */}
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Enrolled Courses</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.username}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    user.role === "User"
                      ? "border-blue-500 text-blue-500"
                      : user.role === "Admin" || "admin"
                      ? "border-purple-500 text-purple-500"
                      : "border-gray-500 text-gray-500"
                  }
                >
                  {user.role.charAt(0).toUpperCase() +
                    user.role.slice(1).toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {user.enrolledCourses || 0}
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(user._id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={7} className="text-center h-24">
              No users found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>

    {/* Dialogs */}
    {editingUser && (
      <UserEditDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    )}
    {viewingUser && (
      <UserViewDialog
        user={viewingUser}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    )}
  </div>
);
}
