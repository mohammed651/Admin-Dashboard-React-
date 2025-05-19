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
import { useEffect, useState } from "react";
import UserEditDialog from "./UserEditDialog";
import UserViewDialog from "./UserViewDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/use-AppDispatch";
import { RootState } from "@/store/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const paginate = (items: User[], pageNumber: number, pageSize: number) => {
  const startIndex = (pageNumber - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};

export default function UserTable() {
  const dispatch = useAppDispatch();
  const {
    loading,
    error,
    users = [],
    searchQuery,
    roleFilter,
  isSubscribedFilter, 
  } = useAppSelector((state: RootState) => state.user);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredUsers = Array.isArray(users)
  ? users.filter((user) => {
      const matchesSearch =
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesSubscription = 
        isSubscribedFilter === "all" || 
        (isSubscribedFilter === "true" ? user.isSubscribed : !user.isSubscribed);

      return matchesSearch && matchesRole && matchesSubscription;
    })
  : [];

  // Paginate the filtered users
  const paginatedUsers = paginate(filteredUsers, currentPage, itemsPerPage);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, roleFilter, isSubscribedFilter]);

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

  console.log("Filtered Users:", filteredUsers);
  
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
            <TableHead className="text-center">subscribed</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
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
                <TableCell className="text-center">
                  {user.isSubscribed ? "Yes" : "No"}
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
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="itemsPerPage">per page</Label>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>

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