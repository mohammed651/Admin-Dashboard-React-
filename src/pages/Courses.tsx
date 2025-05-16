import { useState, useRef, useEffect } from "react";
import { Plus, Filter, Search, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CourseTable from "@/components/dashboard/Course/CourseTable";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { createNewCourse, fetchAllCourses } from './../store/slices/courseSlice';
import { fetchAllInstructors } from '../store/slices/instructorSlice';
import { 
  fetchCategories, 
  selectCategoryStatus as selectCategoriesStatus
} from '../store/slices/categorySlice';
import Joi from 'joi';
import { ErrorBoundary } from 'react-error-boundary';
import { RootState, Category, Instructor } from "@/types";
import { useAppDispatch } from "@/hooks/use-AppDispatch";

const courseSchemaValidation = Joi.object({
  instructor: Joi.string().required().messages({
    'string.empty': 'Instructor is required',
    'any.required': 'Instructor is required'
  }),
  name: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Course name is required',
    'string.min': 'Course name must be at least 3 characters',
    'string.max': 'Course name cannot exceed 255 characters',
    'any.required': 'Course name is required'
  }),
  categoryID: Joi.string().required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required'
  }),
  description: Joi.string().min(25).max(500).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 25 characters',
    'string.max': 'Description cannot exceed 500 characters',
    'any.required': 'Description is required'
  }),
  IfYouLike: Joi.string().optional(),
  IfYouLikeValue: Joi.string().optional(),
  SkillsNeeded: Joi.string().optional(),
  SkillsNeededValue: Joi.string().optional(),
  organization: Joi.string().optional(),
});
interface RelatedCourse {
  relatedCourseID: string;
  name: string;
  relatedImageFile?: File;
  relatedImagePreview?: string;
}
function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md my-4">
      <h2 className="text-lg font-medium text-red-800">Something went wrong:</h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <Button 
        variant="outline" 
        onClick={resetErrorBoundary}
        className="border-red-500 text-red-600 hover:bg-red-50"
      >
        Try again
      </Button>
    </div>
  );
}

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();

  // Redux state
  const { courses = [] } = useSelector((state: RootState) => state.course);
  const { instructors = [], status: instructorStatus } = useSelector((state: RootState) => state.instructor);
  const categories = useSelector((state: RootState) => state.category.categories);
  const categoriesStatus = useSelector(selectCategoriesStatus);

  // Form state
  const [newCourse, setNewCourse] = useState({
    name: "",
    instructor: "",
    categoryID: "",
    description: "",
    IfYouLike: "",
    IfYouLikeValue: "",
    SkillsNeeded: "",
    SkillsNeededValue: "",
    organization: "",
    relatedCourses: [] as RelatedCourse[],
  });

  // Refs and states for file uploads
  const courseImageRef = useRef<HTMLInputElement>(null);
  const logoImageRef = useRef<HTMLInputElement>(null);
   const relatedImageRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(null);
  const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllCourses());
    dispatch(fetchAllInstructors());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Course image handling functions
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
    if (courseImageRef.current) courseImageRef.current.value = "";
  };

  // Logo image handling functions
  const handleLogoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoImageFile(file);
      setLogoImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogoImage = () => {
    setLogoImageFile(null);
    if (logoImagePreview) URL.revokeObjectURL(logoImagePreview);
    setLogoImagePreview(null);
    if (logoImageRef.current) logoImageRef.current.value = "";
  };

  // Function to add a new related course
  const addRelatedCourse = () => {
    setNewCourse(prev => ({
      ...prev,
      relatedCourses: [
        ...prev.relatedCourses,
        { relatedCourseID: "", name: "", relatedImageFile: undefined, relatedImagePreview: "" }
      ]
    }));
  };

  // Function to remove a related course
  const removeRelatedCourse = (index: number) => {
    setNewCourse(prev => {
      const updatedCourses = [...prev.relatedCourses];
      // Clean up the object URL if exists
      if (updatedCourses[index].relatedImagePreview) {
        URL.revokeObjectURL(updatedCourses[index].relatedImagePreview!);
      }
      updatedCourses.splice(index, 1);
      return { ...prev, relatedCourses: updatedCourses };
    });
  };

  // Handle related course input changes
  const handleRelatedCourseChange = (index: number, field: keyof RelatedCourse, value: string) => {
    setNewCourse(prev => {
      const updatedCourses = [...prev.relatedCourses];
      updatedCourses[index] = { ...updatedCourses[index], [field]: value };
      return { ...prev, relatedCourses: updatedCourses };
    });
  };

  // Handle related course image upload
  const handleRelatedImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCourse(prev => {
        const updatedCourses = [...prev.relatedCourses];
        updatedCourses[index] = {
          ...updatedCourses[index],
          relatedImageFile: file,
          relatedImagePreview: URL.createObjectURL(file)
        };
        return { ...prev, relatedCourses: updatedCourses };
      });
    }
  };

  // Handle remove related course image
  const handleRemoveRelatedImage = (index: number) => {
    setNewCourse(prev => {
      const updatedCourses = [...prev.relatedCourses];
      if (updatedCourses[index].relatedImagePreview) {
        URL.revokeObjectURL(updatedCourses[index].relatedImagePreview!);
      }
      updatedCourses[index] = {
        ...updatedCourses[index],
        relatedImageFile: undefined,
        relatedImagePreview: ""
      };
      if (relatedImageRefs.current[index]) {
        relatedImageRefs.current[index]!.value = "";
      }
      return { ...prev, relatedCourses: updatedCourses };
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationResult = courseSchemaValidation.validate(newCourse, {
      abortEarly: false,
      allowUnknown: true
    });

    if (validationResult.error) {
      const newErrors: Record<string, string> = {};
      validationResult.error.details.forEach((detail) => {
        newErrors[detail.path[0]] = detail.message;
      });
      setErrors(newErrors);
      const firstError = document.querySelector('[class*="border-red-500"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!courseImageFile && !logoImageFile) {
      setErrors(prev => ({
        ...prev,
        imageError: 'Please upload at least one image (course image or logo)'
      }));
      return;
    }

    setErrors({});
    
    // Create FormData
    const formData = new FormData();
    // Append all text fields
    formData.append('name', newCourse.name);
    formData.append('instructor', newCourse.instructor);
    formData.append('categoryID', newCourse.categoryID);
    formData.append('description', newCourse.description);

    if (newCourse.IfYouLike) formData.append('IfYouLike', newCourse.IfYouLike);
    if (newCourse.IfYouLikeValue) formData.append('IfYouLikeValue', newCourse.IfYouLikeValue);
    if (newCourse.SkillsNeeded) formData.append('SkillsNeeded', newCourse.SkillsNeeded);
    if (newCourse.SkillsNeededValue) formData.append('SkillsNeededValue', newCourse.SkillsNeededValue);
    if (newCourse.organization) formData.append('organization', newCourse.organization);

    // Append image files if they exist
    if (courseImageFile) {
      formData.append('courseImage', courseImageFile);
    }
    if (logoImageFile) {
      formData.append('logoImage', logoImageFile);
    }
    newCourse.relatedCourses.forEach((course, index) => {
      formData.append(`relatedCourses[${index}][relatedCourseID]`, course.relatedCourseID);
      formData.append(`relatedCourses[${index}][name]`, course.name);
      if (course.relatedImageFile) {
        formData.append(`relatedCourses[${index}][relatedImage]`, course.relatedImageFile);
      }
    });

    try {
      const resultAction = await dispatch(createNewCourse(formData) as any);
      if (createNewCourse.fulfilled.match(resultAction)) {
        toast({
          title: "Course created",
          description: "Your course has been successfully created",
          variant: "success",
        });

        // Reset form
        setNewCourse({
          name: "",
          instructor: "",
          categoryID: "",
          description: "",
          IfYouLike: "",
          IfYouLikeValue: "",
          SkillsNeeded: "",
          SkillsNeededValue: "",
          organization: "",
          relatedCourses: [],
        });
        handleRemoveCourseImage();
        handleRemoveLogoImage();
        setIsDialogOpen(false);
        dispatch(fetchAllCourses());
      } else if (createNewCourse.rejected.match(resultAction)) {
        toast({
          title: "Error",
          description: resultAction.payload.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const safeInstructors = Array.isArray(instructors) ? instructors : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header and Add Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <Button
            className="bg-coursera-blue hover:bg-coursera-blue-dark"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> {!isMobile && "Add New Course"}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {safeCategories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4" /> {!isMobile && "Filter"}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {(instructorStatus === 'failed' || categoriesStatus === 'failed') && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  Failed to load data. Please try again later.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {(instructorStatus === 'loading' || categoriesStatus === 'loading') ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => dispatch(fetchAllCourses())}>
            <CourseTable 
              courses={courses}
              categories={categories}
              searchQuery={searchQuery} 
              categoryFilter={categoryFilter} 
            />
          </ErrorBoundary>
        )}
        
        {/* Add Course Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new course for your learning platform.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newCourse.name}
                    onChange={handleInputChange}
                    required
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor *</Label>
                  <Select
                    value={newCourse.instructor}
                    onValueChange={(value) => {
                      setNewCourse(prev => ({ ...prev, instructor: value }));
                      if (errors.instructor) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.instructor;
                          return newErrors;
                        });
                      }
                    }}
                  >
                    <SelectTrigger className={errors.instructor ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select an instructor" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeInstructors.map((instructor) => (
                        <SelectItem key={instructor._id} value={instructor._id}>
                          {instructor.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.instructor && (
                    <p className="text-red-500 text-xs mt-1">{errors.instructor}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryID">Category *</Label>
                  <Select
                    value={newCourse.categoryID}
                    onValueChange={(value) => {
                      setNewCourse(prev => ({ ...prev, categoryID: value }));
                      if (errors.categoryID) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.categoryID;
                          return newErrors;
                        });
                      }
                    }}
                  >
                    <SelectTrigger className={errors.categoryID ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {safeCategories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryID && (
                    <p className="text-red-500 text-xs mt-1">{errors.categoryID}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={newCourse.organization}
                    onChange={handleInputChange}
                    className={errors.organization ? "border-red-500" : ""}
                  />
                  {errors.organization && (
                    <p className="text-red-500 text-xs mt-1">{errors.organization}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newCourse.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="IfYouLike">If You Like</Label>
                  <Input
                    id="IfYouLike"
                    name="IfYouLike"
                    value={newCourse.IfYouLike}
                    onChange={handleInputChange}
                    className={errors.IfYouLike ? "border-red-500" : ""}
                  />
                  {errors.IfYouLike && (
                    <p className="text-red-500 text-xs mt-1">{errors.IfYouLike}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="IfYouLikeValue">If You Like Value</Label>
                  <Input
                    id="IfYouLikeValue"
                    name="IfYouLikeValue"
                    value={newCourse.IfYouLikeValue}
                    onChange={handleInputChange}
                    className={errors.IfYouLikeValue ? "border-red-500" : ""}
                  />
                  {errors.IfYouLikeValue && (
                    <p className="text-red-500 text-xs mt-1">{errors.IfYouLikeValue}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="SkillsNeeded">Skills Needed</Label>
                  <Input
                    id="SkillsNeeded"
                    name="SkillsNeeded"
                    value={newCourse.SkillsNeeded}
                    onChange={handleInputChange}
                    className={errors.SkillsNeeded ? "border-red-500" : ""}
                  />
                  {errors.SkillsNeeded && (
                    <p className="text-red-500 text-xs mt-1">{errors.SkillsNeeded}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="SkillsNeededValue">Skills Needed Value</Label>
                  <Input
                    id="SkillsNeededValue"
                    name="SkillsNeededValue"
                    value={newCourse.SkillsNeededValue}
                    onChange={handleInputChange}
                    className={errors.SkillsNeededValue ? "border-red-500" : ""}
                  />
                  {errors.SkillsNeededValue && (
                    <p className="text-red-500 text-xs mt-1">{errors.SkillsNeededValue}</p>
                  )}
                </div>
              </div>
              {/* Related Courses Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Related Courses</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRelatedCourse}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Related Course
                </Button>
              </div>

              {newCourse.relatedCourses.map((course, index) => (
                <div key={index} className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Related Course #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRelatedCourse(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`relatedCourseID-${index}`}>Course ID</Label>
                      <Input
                        id={`relatedCourseID-${index}`}
                        value={course.relatedCourseID}
                        onChange={(e) => handleRelatedCourseChange(index, 'relatedCourseID', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`relatedCourseName-${index}`}>Course Name</Label>
                      <Input
                        id={`relatedCourseName-${index}`}
                        value={course.name}
                        onChange={(e) => handleRelatedCourseChange(index, 'name', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`relatedImage-${index}`}>Course Image</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          id={`relatedImage-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleRelatedImageChange(index, e)}
                          ref={(el) => (relatedImageRefs.current[index] = el)}
                        />
                        {course.relatedImagePreview && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveRelatedImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {course.relatedImagePreview && (
                        <div className="mt-1">
                          <img
                            src={course.relatedImagePreview}
                            alt={`Related course ${index + 1} preview`}
                            className="h-20 rounded-md object-cover border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

              {/* Image Uploads */}
              <div className="space-y-4">
                {/* Logo Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="logoImage">Logo Image</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        id="logoImage"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoImageChange}
                        ref={logoImageRef}
                        className={`flex-1 ${errors.logoImage ? "border-red-500" : ""}`}
                      />
                      {logoImagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveLogoImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {errors.logoImage && (
                      <p className="text-red-500 text-xs mt-1">{errors.logoImage}</p>
                    )}
                    {logoImagePreview && (
                      <div className="mt-1">
                        <img
                          src={logoImagePreview}
                          alt="Logo preview"
                          className="h-20 rounded-md object-cover border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                

                {/* Course Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="courseImage">Course Image</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        id="courseImage"
                        type="file"
                        accept="image/*"
                        onChange={handleCourseImageChange}
                        ref={courseImageRef}
                        className={`flex-1 ${errors.courseImage ? "border-red-500" : ""}`}
                      />
                      {courseImagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveCourseImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {errors.courseImage && (
                      <p className="text-red-500 text-xs mt-1">{errors.courseImage}</p>
                    )}
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
                {errors.imageError && (
                  <p className="text-red-500 text-xs mt-1">{errors.imageError}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-coursera-blue hover:bg-coursera-blue-dark"
                >
                  Create Course
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}