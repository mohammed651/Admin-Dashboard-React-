import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  selectAllCategories,
  selectCategoryStatus,
  selectCategoryError,
  clearNotification,
} from "@/store/slices/categorySlice";
import { Category } from "@/types";

export default function Categories() {
  const dispatch = useDispatch();
  const categories = (useSelector(selectAllCategories) as Category[]) || [];
  const status = useSelector(selectCategoryStatus);
  const error = useSelector(selectCategoryError);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<{
    _id?: string;
    categoryName: string;
    categoryImageFile?: File | null; // جديد
  } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    console.log("Categories data:", categories);
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (status === "failed") {
      toast({
        title: "Error",
        description: error as string,
        variant: "destructive",
      });
    }
  }, [status, error]);

  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCategories = safeCategories.filter((category) =>
    category?.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentCategory?.categoryName) return;

  // إنشاء FormData لإرسال البيانات مع الصورة
  const formData = new FormData();
  formData.append("categoryName", currentCategory.categoryName);
  
  if (currentCategory.categoryImageFile) {
    formData.append("categoryImage", currentCategory.categoryImageFile);
  }

  if (currentCategory._id) {
    // تحديث (PUT أو PATCH)
    await dispatch(updateCategory({
      id: currentCategory._id,
      categoryData: formData,
    }));
  } else {
    // إنشاء جديد (POST)
    await dispatch(addCategory(formData));
  }

  setIsDialogOpen(false);
  setCurrentCategory(null);
};

  const handleDelete = () => {
    if (categoryToDelete) {
      dispatch(deleteCategory(categoryToDelete));
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <Button
            className="bg-coursera-blue hover:bg-coursera-blue-dark"
            onClick={() => {
              setCurrentCategory({ categoryName: "" });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>

        {/* عرض رسالة الخطأ هنا دون التأثير على التخطيط */}
        {status === "failed" && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error as string}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {status === "loading" ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-Center">Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">
                        {category.categoryName}
                      </TableCell>
                      <TableCell className="text-right">
                        {category.categoryImage && (
                          <img
                            src={category.categoryImage}
                            alt={category.categoryName}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentCategory({
                                _id: category._id,
                                categoryName: category.categoryName,
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCategoryToDelete(category._id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6">
                      {status === "failed"
                        ? "Error loading categories"
                        : "No categories found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Category Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentCategory?._id ? "Edit Category" : "Add New Category"}
              </DialogTitle>
              <DialogDescription>
                {currentCategory?._id
                  ? "Update the category name below."
                  : "Create a new category for your courses."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={currentCategory?.categoryName || ""}
                    onChange={(e) =>
                      setCurrentCategory((prev) => ({
                        ...prev!,
                        categoryName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryImage">Category Image</Label>
                  <Input
                    id="categoryImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setCurrentCategory((prev) => ({
                        ...prev!,
                        categoryImageFile: file, // هنخزن الملف مؤقتاً هنا
                      }));
                    }}
                  />
                  {/* لو عايز تعرض الصورة اللي متحملة */}
                  {currentCategory?.categoryImageFile && (
                    <img
                      src={URL.createObjectURL(
                        currentCategory.categoryImageFile
                      )}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setCurrentCategory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-coursera-blue hover:bg-coursera-blue-dark"
                >
                  {currentCategory?._id ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                category.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
