import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllCourses,
  updateCourse,
  deleteCourse,
} from "@/store/slices/courseSlice";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { RootState, Course, Category, Instructor } from "@/types";

interface CourseTableProps {
  courses: Course[];
  categories?: Category[]; // Made optional
  searchQuery: string;
  categoryFilter: string;
}

function TableErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md my-4">
      <h2 className="text-lg font-medium text-red-800">Error loading courses:</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <Button
        variant="outline"
        onClick={resetErrorBoundary}
        className="border-red-500 text-red-600 hover:bg-red-50"
      >
        Reload Courses
      </Button>
    </div>
  );
}

const paginate = (items: Course[], pageNumber: number, pageSize: number) => {
  const startIndex = (pageNumber - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
};

export default function CourseTable({
  courses = [],
  categories = [], // Default empty array
  searchQuery,
  categoryFilter,
}: CourseTableProps) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.course);
  const { instructors } = useSelector((state: RootState) => state.instructor);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [logoImageUrl, setLogoImageUrl] = useState<string>("");
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(null);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCourse) {
      setLogoImageUrl(selectedCourse.logoImage || "");
      if (selectedCourse.courseImage) {
        setCourseImagePreview(selectedCourse.courseImage);
      }
    }
  }, [selectedCourse]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeInstructors = Array.isArray(instructors) ? instructors : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCourses = safeCourses.filter((course: Course) => {
    const matchesSearch =
      searchQuery === "" ||
      course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || course.categoryID === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const paginatedCourses = paginate(filteredCourses, currentPage, itemsPerPage);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const getCategoryName = (id: string) => {
    if (!id || !Array.isArray(safeCategories)) return id;
    const category = safeCategories.find(cat => cat._id === id);
    return category ? category.categoryName : id;
  };

  const handleDeleteClick = (_id:string ) => {
    setCourseToDelete( _id );
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        await dispatch(deleteCourse(courseToDelete)).unwrap();
        toast({
          title: "Course deleted",
          description: "The course has been successfully removed",
          variant: "success",
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Error deleting course",
          variant: "destructive",
        });
      } finally {
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
      }
    }
  };

  const handleEditClick = (course: Course) => {
    setSelectedCourse({ ...course });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedCourse && selectedCourse._id) {
      try {
        const formData = new FormData();
        
        formData.append("name", selectedCourse.name);
        formData.append("instructor", selectedCourse.instructor);
        formData.append("categoryID", selectedCourse.categoryID);
        formData.append("description", selectedCourse.description);
        
        if (selectedCourse.IfYouLike) formData.append("IfYouLike", selectedCourse.IfYouLike);
        if (selectedCourse.IfYouLikeValue) formData.append("IfYouLikeValue", selectedCourse.IfYouLikeValue);
        if (selectedCourse.SkillsNeeded) formData.append("SkillsNeeded", selectedCourse.SkillsNeeded);
        if (selectedCourse.SkillsNeededValue) formData.append("SkillsNeededValue", selectedCourse.SkillsNeededValue);
        if (selectedCourse.organization) formData.append("organization", selectedCourse.organization);
        
        if (logoImageUrl) formData.append("logoImage", logoImageUrl);
        
        if (courseImageFile) formData.append("courseImage", courseImageFile);

        console.log("FormData:", formData);
        console.log("Selected Course:", selectedCourse);
        console.log("Logo Image URL:", logoImageUrl);
        console.log(selectedCourse.categoryID);
        
 
        
        await dispatch(updateCourse({
          id: selectedCourse._id,
          courseData: formData,
        })).unwrap();

        toast({
          title: "Course updated",
          description: "The course has been successfully updated",
          variant: "success",
        });
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Error updating course",
          variant: "destructive",
        });
      } finally {
        setEditDialogOpen(false);
        setSelectedCourse(null);
        setLogoImageUrl("");
        setCourseImageFile(null);
        setCourseImagePreview(null);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSelectedCourse((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setSelectedCourse((prev) => ({ ...prev!, [field]: value }));
  };

  const handleLogoImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setLogoImageUrl(value);
    setSelectedCourse((prev) => ({ ...prev!, logoImage: value }));
  };

  const handleClearLogoImageUrl = () => {
    setLogoImageUrl("");
    setSelectedCourse((prev) => ({ ...prev!, logoImage: "" }));
  };

  const handleCourseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseImageFile(file);
      setCourseImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveCourseImage = () => {
    setCourseImageFile(null);
    if (courseImagePreview) URL.revokeObjectURL(courseImagePreview);
    setCourseImagePreview(null);
    setSelectedCourse((prev) => ({ ...prev!, courseImage: "" }));
  };

  if (loading) return <div className="p-4 text-center">Loading courses...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error loading courses</div>;

  // console.log(categories.map((category) => category._id));

  // console.log(courses);
  
  return (
    <ErrorBoundary
      FallbackComponent={TableErrorFallback}
      onReset={() => dispatch(fetchAllCourses())}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Id</TableHead>
              <TableHead className="text-center">Title</TableHead>
              <TableHead className="text-center">Instructor</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Created At</TableHead>
              <TableHead className="text-center">Enrollments</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((course: Course) => (
                <TableRow
                  key={course._id}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="text-center">
                    {course.courseId}
                  </TableCell>
                  <TableCell className="font-medium text-center">
                    {course.name}
                  </TableCell>
                  <TableCell className="text-center">
                    {course.instructor}
                  </TableCell>
                  <TableCell className="text-center">
                    {getCategoryName(course.categoryID)}
                  </TableCell>
                  <TableCell className="text-center">
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {course.enrolled}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/courses/${course._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => course._id && handleDeleteClick(course._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No courses found. Try adjusting your filters.
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
              Showing {paginatedCourses.length} of {filteredCourses.length} courses
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the course and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

         {/* Edit Course Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Make changes to the course details below.
              </DialogDescription>
            </DialogHeader>
            {selectedCourse && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={selectedCourse.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Select
                      value={selectedCourse.instructor}
                      onValueChange={(value) => handleSelectChange("instructor", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {safeInstructors.map((instructor) => (
                          <SelectItem key={instructor._id} value={instructor._id}>
                            {instructor.Name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryID">Category</Label>
                    <Select
                      value={selectedCourse.categoryID}
                      onValueChange={(value) => handleSelectChange("categoryID", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          
                          <SelectItem key={category._id} value={category._id}>
                            {category.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      value={selectedCourse.organization || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={selectedCourse.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="IfYouLike">If You Like</Label>
                    <Input
                      id="IfYouLike"
                      name="IfYouLike"
                      value={selectedCourse.IfYouLike || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="IfYouLikeValue">If You Like Value</Label>
                    <Input
                      id="IfYouLikeValue"
                      name="IfYouLikeValue"
                      value={selectedCourse.IfYouLikeValue || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="SkillsNeeded">Skills Needed</Label>
                    <Input
                      id="SkillsNeeded"
                      name="SkillsNeeded"
                      value={selectedCourse.SkillsNeeded || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="SkillsNeededValue">Skills Needed Value</Label>
                    <Input
                      id="SkillsNeededValue"
                      name="SkillsNeededValue"
                      value={selectedCourse.SkillsNeededValue || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logoImage">Logo Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logoImage"
                        name="logoImage"
                        value={logoImageUrl}
                        onChange={handleLogoImageUrlChange}
                        placeholder="https://example.com/logo.png"
                      />
                      {logoImageUrl && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleClearLogoImageUrl}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {logoImageUrl && (
                      <div className="mt-2">
                        <img
                          src={logoImageUrl}
                          alt="Logo preview"
                          className="h-20 rounded-md object-cover border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseImage">Course Image</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          id="courseImage"
                          type="file"
                          accept="image/*"
                          onChange={handleCourseImageChange}
                        />
                        {courseImagePreview && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveCourseImage}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {courseImagePreview && (
                        <div className="mt-1">
                          <img
                            src={courseImagePreview}
                            alt="Course preview"
                            className="h-20 rounded-md object-cover border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setLogoImageUrl("");
                      setCourseImageFile(null);
                      setCourseImagePreview(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-coursera-blue hover:bg-coursera-blue-dark"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}