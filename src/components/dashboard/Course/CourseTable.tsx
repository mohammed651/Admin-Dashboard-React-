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
import { Edit, Trash, Eye, Plus, X } from "lucide-react";
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
import { RootState, Course, Category } from "@/types";

interface CourseTableProps {
  courses: Course[];
  categories?: Category[];
  searchQuery: string;
  categoryFilter: string;
}

interface RelatedCourse {
  relatedCourseID: string;
  name: {
    en: string;
    ar: string;
  };
  relatedImageFile?: File;
  relatedImagePreview?: string;
}

interface Skill {
  en: string;
  ar: string;
}

interface LearningOutcome {
  en: string;
  ar: string;
}

interface CourseOutcome {
  outComesTitle: {
    en: string;
    ar: string;
  };
  outComesDescription: LearningOutcome[];
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
  categories = [],
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
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
  const [courseImagePreview, setCourseImagePreview] = useState<string | null>(null);
  const [logoImagePreview, setLogoImagePreview] = useState<string | null>(null);
  const relatedImageRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  useEffect(() => {
    if (selectedCourse) {
      if (selectedCourse.courseImage) {
        setCourseImagePreview(selectedCourse.courseImage);
      }
      if (selectedCourse.logoImage) {
        setLogoImagePreview(selectedCourse.logoImage);
      }
    }
  }, [selectedCourse]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeInstructors = Array.isArray(instructors) ? instructors : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCourses = safeCourses.filter((course: Course) => {
  const courseName =
    typeof course.name === 'string' ? course.name : course.name?.en || '';
  const courseInstructor = course.instructor || '';

  const matchesSearch =
    searchQuery === "" ||
    courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    courseInstructor.toLowerCase().includes(searchQuery.toLowerCase());

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

  const handleDeleteClick = (_id: string) => {
    setCourseToDelete(_id);
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
  function normalizeMultilang(value: any): { en: string; ar: string } {
  if (typeof value === 'string') {
    return { en: value, ar: '' };
  }
  if (typeof value === 'object' && value !== null) {
    return {
      en: value.en || '',
      ar: value.ar || ''
    };
  }
  return { en: '', ar: '' };
}


  const handleEditClick = (course: Course) => {
    // Parse any stringified fields
    console.log("Course before parsing:", course);
    
   const parsedCourse = {
  ...course,
  name: normalizeMultilang(course.name),
  jobTitle: normalizeMultilang(course.jobTitle),
  description: normalizeMultilang(course.description),
  IfYouLike: normalizeMultilang(course.IfYouLike),
  IfYouLikeValue: normalizeMultilang(course.IfYouLikeValue),
  SkillsNeeded: normalizeMultilang(course.SkillsNeeded),
  SkillsNeededValue: normalizeMultilang(course.SkillsNeededValue),
  Skills: typeof course.Skills === 'string' ? JSON.parse(course.Skills) : course.Skills || [],
  WhatYouWillLearn: typeof course.WhatYouWillLearn === 'string' ? JSON.parse(course.WhatYouWillLearn) : course.WhatYouWillLearn || [],
  outComes: typeof course.outComes === 'string' ? JSON.parse(course.outComes) : course.outComes || {
    outComesTitle: { en: '', ar: '' },
    outComesDescription: []
  },
  relatedCourses: typeof course.relatedCourses === 'string' ? JSON.parse(course.relatedCourses) : course.relatedCourses || []
};
    
    setSelectedCourse(parsedCourse);
    setEditDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field?: string,
    lang?: 'en' | 'ar'
  ) => {
    const { name, value } = e.target;

    if (field && lang) {
      setSelectedCourse((prev: any) => ({
        ...prev,
        [field]: {
          ...(prev[field] as Record<string, any>),
          [lang]: value
        }
      }));
    } else {
      setSelectedCourse((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setSelectedCourse((prev: any) => ({ ...prev, [field]: value }));
  };

  // Image handling functions
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
  };

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
  };

  // Related courses functions
  const addRelatedCourse = () => {
    setSelectedCourse((prev: any) => ({
      ...prev,
      relatedCourses: [
        ...prev.relatedCourses,
        { 
          relatedCourseID: "", 
          name: { en: "", ar: "" },
          relatedImageFile: undefined, 
          relatedImagePreview: "" 
        }
      ]
    }));
  };

  const removeRelatedCourse = (index: number) => {
    setSelectedCourse((prev: any) => {
      const updatedCourses = [...prev.relatedCourses];
      if (updatedCourses[index].relatedImagePreview) {
        URL.revokeObjectURL(updatedCourses[index].relatedImagePreview!);
      }
      updatedCourses.splice(index, 1);
      return { ...prev, relatedCourses: updatedCourses };
    });
  };

  const handleRelatedCourseChange = (
    index: number, 
    field: keyof RelatedCourse, 
    value: string | { en: string; ar: string },
    lang?: 'en' | 'ar'
  ) => {
    setSelectedCourse((prev: any) => {
      const updatedCourses = [...prev.relatedCourses];
      
      if (field === 'name' && lang && typeof value === 'string') {
        updatedCourses[index] = { 
          ...updatedCourses[index], 
          name: {
            ...updatedCourses[index].name,
            [lang]: value
          }
        };
      } else if (field === 'name' && typeof value === 'object') {
        updatedCourses[index] = { 
          ...updatedCourses[index], 
          name: value
        };
      } else if (typeof value === 'string') {
        updatedCourses[index] = { 
          ...updatedCourses[index], 
          [field]: value 
        };
      }
      
      return { ...prev, relatedCourses: updatedCourses };
    });
  };

  const handleRelatedImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedCourse((prev: any) => {
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

  const handleRemoveRelatedImage = (index: number) => {
    setSelectedCourse((prev: any) => {
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

  // Skills management
  const addSkill = () => {
    setSelectedCourse((prev: any) => ({
      ...prev,
      Skills: [...prev.Skills, { en: "", ar: "" }]
    }));
  };

  const removeSkill = (index: number) => {
    setSelectedCourse((prev: any) => {
      const updatedSkills = [...prev.Skills];
      updatedSkills.splice(index, 1);
      return { ...prev, Skills: updatedSkills };
    });
  };

  const handleSkillChange = (index: number, lang: 'en' | 'ar', value: string) => {
    setSelectedCourse((prev: any) => {
      const updatedSkills = [...prev.Skills];
      updatedSkills[index] = { ...updatedSkills[index], [lang]: value };
      return { ...prev, Skills: updatedSkills };
    });
  };

  // Learning outcomes management
  const addLearningOutcome = () => {
    setSelectedCourse((prev: any) => ({
      ...prev,
      WhatYouWillLearn: [...prev.WhatYouWillLearn, { en: "", ar: "" }]
    }));
  };

  const removeLearningOutcome = (index: number) => {
    setSelectedCourse((prev: any) => {
      const updatedOutcomes = [...prev.WhatYouWillLearn];
      updatedOutcomes.splice(index, 1);
      return { ...prev, WhatYouWillLearn: updatedOutcomes };
    });
  };

  const handleLearningOutcomeChange = (index: number, lang: 'en' | 'ar', value: string) => {
    setSelectedCourse((prev: any) => {
      const updatedOutcomes = [...prev.WhatYouWillLearn];
      updatedOutcomes[index] = { ...updatedOutcomes[index], [lang]: value };
      return { ...prev, WhatYouWillLearn: updatedOutcomes };
    });
  };

  // Course outcomes management
  const addOutcomeDescription = () => {
    setSelectedCourse((prev: any) => ({
      ...prev,
      outComes: {
        ...prev.outComes,
        outComesDescription: [...prev.outComes.outComesDescription, { en: "", ar: "" }]
      }
    }));
  };

  const removeOutcomeDescription = (index: number) => {
    setSelectedCourse((prev: any) => {
      const updatedDescriptions = [...prev.outComes.outComesDescription];
      updatedDescriptions.splice(index, 1);
      return {
        ...prev,
        outComes: {
          ...prev.outComes,
          outComesDescription: updatedDescriptions
        }
      };
    });
  };

  const handleOutcomeDescriptionChange = (index: number, lang: 'en' | 'ar', value: string) => {
    setSelectedCourse((prev: any) => {
      const updatedDescriptions = [...prev.outComes.outComesDescription];
      updatedDescriptions[index] = { ...updatedDescriptions[index], [lang]: value };
      return {
        ...prev,
        outComes: {
          ...prev.outComes,
          outComesDescription: updatedDescriptions
        }
      };
    });
  };

  const handleOutcomeTitleChange = (lang: 'en' | 'ar', value: string) => {
    setSelectedCourse((prev: any) => ({
      ...prev,
      outComes: {
        ...prev.outComes,
        outComesTitle: {
          ...prev.outComes.outComesTitle,
          [lang]: value
        }
      }
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedCourse || !selectedCourse._id) return;

    try {
      const formData = new FormData();
      
      // Add multilingual fields as JSON
      formData.append('name', JSON.stringify(selectedCourse.name));
      formData.append('jobTitle', JSON.stringify(selectedCourse.jobTitle));
      formData.append('description', JSON.stringify(selectedCourse.description));
      
      // Add regular fields
      formData.append('instructor', selectedCourse.instructor);
      formData.append('categoryID', selectedCourse.categoryID);
      
      // Add optional fields
      if (selectedCourse.IfYouLike) {
        formData.append('IfYouLike', JSON.stringify(selectedCourse.IfYouLike));
      }
      if (selectedCourse.IfYouLikeValue) {
        formData.append('IfYouLikeValue', JSON.stringify(selectedCourse.IfYouLikeValue));
      }
      if (selectedCourse.SkillsNeeded) {
        formData.append('SkillsNeeded', JSON.stringify(selectedCourse.SkillsNeeded));
      }
      if (selectedCourse.SkillsNeededValue) {
        formData.append('SkillsNeededValue', JSON.stringify(selectedCourse.SkillsNeededValue));
      }
      if (selectedCourse.organization) {
        formData.append('organization', selectedCourse.organization);
      }

      // Add arrays and objects
      if (selectedCourse.Skills.length > 0) {
        formData.append('Skills', JSON.stringify(selectedCourse.Skills));
      }
      if (selectedCourse.WhatYouWillLearn.length > 0) {
        formData.append('WhatYouWillLearn', JSON.stringify(selectedCourse.WhatYouWillLearn));
      }
      if (selectedCourse.outComes) {
        formData.append('outComes', JSON.stringify(selectedCourse.outComes));
      }
      if (selectedCourse.relatedCourses.length > 0) {
        formData.append('relatedCourses', JSON.stringify(selectedCourse.relatedCourses));
      }

      // Add image files
      if (courseImageFile) {
        formData.append('courseImage', courseImageFile);
      }
      if (logoImageFile) {
        formData.append('logoImage', logoImageFile);
      }

      // Add related course images
      selectedCourse.relatedCourses.forEach((course: RelatedCourse, index: number) => {
        if (course.relatedImageFile) {
          formData.append(`relatedCourses[${index}][relatedImage]`, course.relatedImageFile);
        }
      });

      await dispatch(updateCourse({
        id: selectedCourse._id,
        courseData: formData,
      })).unwrap();

      toast({
        title: "Course updated",
        description: "The course has been successfully updated",
        variant: "success",
      });

      setEditDialogOpen(false);
      setSelectedCourse(null);
      setCourseImageFile(null);
      setLogoImageFile(null);
      setCourseImagePreview(null);
      setLogoImagePreview(null);
      
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Error updating course",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-4 text-center">Loading courses...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error loading courses</div>;

  console.log("Filtered Courses:", filteredCourses);
  
  return (
    <ErrorBoundary
      FallbackComponent={TableErrorFallback}
      onReset={() => dispatch(fetchAllCourses())}
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Title</TableHead>
              <TableHead className="text-center">Instructor</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Created At</TableHead>
              <TableHead className="text-center">views</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCourses.length > 0 ? (
              paginatedCourses.map((course: Course) => (
                <TableRow key={course._id} className="hover:bg-gray-50">
                  
                  <TableCell className="font-medium text-center">
                    {typeof course.name === 'object' ? course.name.en : course.name}
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
                    {course.views}
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
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Make changes to the course details below.
              </DialogDescription>
            </DialogHeader>
            {selectedCourse && (
              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Course Name - English */}
                  <div className="space-y-2">
                    <Label htmlFor="name-en">Course Name (English)</Label>
                    <Input
                      id="name-en"
                      value={selectedCourse.name?.en || ''}
                      onChange={(e) => handleInputChange(e, 'name', 'en')}
                    />
                  </div>
                  
                  {/* Course Name - Arabic */}
                  <div className="space-y-2">
                    <Label htmlFor="name-ar">اسم الكورس (عربي)</Label>
                    <Input
                      id="name-ar"
                      value={selectedCourse.name?.ar || ''}
                      onChange={(e) => handleInputChange(e, 'name', 'ar')}
                      dir="rtl"
                    />
                  </div>

                  {/* Job Title - English */}
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle-en">Job Title (English)</Label>
                    <Input
                      id="jobTitle-en"
                      value={selectedCourse.jobTitle?.en || ''}
                      onChange={(e) => handleInputChange(e, 'jobTitle', 'en')}
                    />
                  </div>
                  
                  {/* Job Title - Arabic */}
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle-ar">المسمى الوظيفي (عربي)</Label>
                    <Input
                      id="jobTitle-ar"
                      value={selectedCourse.jobTitle?.ar || ''}
                      onChange={(e) => handleInputChange(e, 'jobTitle', 'ar')}
                      dir="rtl"
                    />
                  </div>

                  {/* Instructor */}
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

                  {/* Category */}
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
                        {safeCategories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description-en">Description (English)</Label>
                    <Textarea
                      id="description-en"
                      value={selectedCourse.description?.en || ''}
                      onChange={(e) => handleInputChange(e, 'description', 'en')}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description-ar">الوصف (عربي)</Label>
                    <Textarea
                      id="description-ar"
                      value={selectedCourse.description?.ar || ''}
                      onChange={(e) => handleInputChange(e, 'description', 'ar')}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* If You Like - English */}
                  <div className="space-y-2">
                    <Label htmlFor="IfYouLike-en">If You Like (English)</Label>
                    <Input
                      id="IfYouLike-en"
                      value={selectedCourse.IfYouLike?.en || ''}
                      onChange={(e) => handleInputChange(e, 'IfYouLike', 'en')}
                    />
                  </div>
                  
                  {/* If You Like - Arabic */}
                  <div className="space-y-2">
                    <Label htmlFor="IfYouLike-ar">إذا كنت تحب (عربي)</Label>
                    <Input
                      id="IfYouLike-ar"
                      value={selectedCourse.IfYouLike?.ar || ''}
                      onChange={(e) => handleInputChange(e, 'IfYouLike', 'ar')}
                      dir="rtl"
                    />
                  </div>

                  {/* If You Like Value - English */}
                  <div className="space-y-2">
                    <Label htmlFor="IfYouLikeValue-en">If You Like Value (English)</Label>
                    <Input
                      id="IfYouLikeValue-en"
                      value={selectedCourse.IfYouLikeValue?.en || ''}
                      onChange={(e) => handleInputChange(e, 'IfYouLikeValue', 'en')}
                    />
                  </div>
                  
                  {/* If You Like Value - Arabic */}
                  <div className="space-y-2">
                    <Label htmlFor="IfYouLikeValue-ar">If You Like Value (عربي)</Label>
                    <Input
                      id="IfYouLikeValue-ar"
                      value={selectedCourse.IfYouLikeValue?.ar || ''}
                      onChange={(e) => handleInputChange(e, 'IfYouLikeValue', 'ar')}
                      dir="rtl"
                    />
                  </div>

                  {/* Skills Needed - English */}
                  <div className="space-y-2">
                    <Label htmlFor="SkillsNeeded-en">Skills Needed (English)</Label>
                    <Input
                      id="SkillsNeeded-en"
                      value={selectedCourse.SkillsNeeded?.en || ''}
                      onChange={(e) => handleInputChange(e, 'SkillsNeeded', 'en')}
                    />
                  </div>
                  
                  {/* Skills Needed - Arabic */}
                  <div className="space-y-2">
                    <Label htmlFor="SkillsNeeded-ar">المهارات المطلوبة (عربي)</Label>
                    <Input
                      id="SkillsNeeded-ar"
                      value={selectedCourse.SkillsNeeded?.ar || ''}
                      onChange={(e) => handleInputChange(e, 'SkillsNeeded', 'ar')}
                      dir="rtl"
                    />
                  </div>

                  {/* Skills Needed Value - English */}
                  <div className="space-y-2">
                    <Label htmlFor="SkillsNeededValue-en">Skills Needed Value (English)</Label>
                    <Input
                      id="SkillsNeededValue-en"
                      value={selectedCourse.SkillsNeededValue?.en || ''}
                      onChange={(e) => handleInputChange(e, 'SkillsNeededValue', 'en')}
                    />
                  </div>
                  
                  {/* Skills Needed Value - Arabic */}
                  <div className="space-y-2">
                    <Label htmlFor="SkillsNeededValue-ar">المهارات المطلوبة (عربي)</Label>
                    <Input
                      id="SkillsNeededValue-ar"
                      value={selectedCourse.SkillsNeededValue?.ar || ''}
                      onChange={(e) => handleInputChange(e, 'SkillsNeededValue', 'ar')}
                      dir="rtl"
                    />
                  </div>

                  {/* Organization */}
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      value={selectedCourse.organization || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Skills</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSkill}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Skill
                    </Button>
                  </div>

                  {selectedCourse.Skills?.map((skill: Skill, index: number) => (
                    <div key={index} className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Skill #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(index)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`skill-en-${index}`}>Skill (English)</Label>
                          <Input
                            id={`skill-en-${index}`}
                            value={skill.en}
                            onChange={(e) => handleSkillChange(index, 'en', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`skill-ar-${index}`}>المهارة (عربي)</Label>
                          <Input
                            id={`skill-ar-${index}`}
                            value={skill.ar}
                            onChange={(e) => handleSkillChange(index, 'ar', e.target.value)}
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What You Will Learn Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>What You Will Learn</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLearningOutcome}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Learning Outcome
                    </Button>
                  </div>

                  {selectedCourse.WhatYouWillLearn?.map((outcome: LearningOutcome, index: number) => (
                    <div key={index} className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Learning Outcome #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLearningOutcome(index)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`outcome-en-${index}`}>Outcome (English)</Label>
                          <Input
                            id={`outcome-en-${index}`}
                            value={outcome.en}
                            onChange={(e) => handleLearningOutcomeChange(index, 'en', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`outcome-ar-${index}`}>النتيجة (عربي)</Label>
                          <Input
                            id={`outcome-ar-${index}`}
                            value={outcome.ar}
                            onChange={(e) => handleLearningOutcomeChange(index, 'ar', e.target.value)}
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Course Outcomes Section */}
                <div className="space-y-4">
                  <Label>Course Outcomes</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="outcome-title-en">Outcome Title (English)</Label>
                      <Input
                        id="outcome-title-en"
                        value={selectedCourse.outComes?.outComesTitle?.en || ''}
                        onChange={(e) => handleOutcomeTitleChange('en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outcome-title-ar">عنوان النتيجة (عربي)</Label>
                      <Input
                        id="outcome-title-ar"
                        value={selectedCourse.outComes?.outComesTitle?.ar || ''}
                        onChange={(e) => handleOutcomeTitleChange('ar', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Outcome Descriptions</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOutcomeDescription}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Description
                    </Button>
                  </div>

                  {selectedCourse.outComes?.outComesDescription?.map((desc: LearningOutcome, index: number) => (
                    <div key={index} className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Description #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOutcomeDescription(index)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`outcome-desc-en-${index}`}>Description (English)</Label>
                          <Input
                            id={`outcome-desc-en-${index}`}
                            value={desc.en}
                            onChange={(e) => handleOutcomeDescriptionChange(index, 'en', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`outcome-desc-ar-${index}`}>الوصف (عربي)</Label>
                          <Input
                            id={`outcome-desc-ar-${index}`}
                            value={desc.ar}
                            onChange={(e) => handleOutcomeDescriptionChange(index, 'ar', e.target.value)}
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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

                  {selectedCourse.relatedCourses?.map((course: RelatedCourse, index: number) => (
                    <div key={index} className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Related Course #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRelatedCourse(index)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`relatedCourseName-en-${index}`}>Course Name (English)</Label>
                          <Input
                            id={`relatedCourseName-en-${index}`}
                            value={course.name?.en || ''}
                            onChange={(e) => handleRelatedCourseChange(index, 'name', e.target.value, 'en')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`relatedCourseName-ar-${index}`}>اسم الكورس (عربي)</Label>
                          <Input
                            id={`relatedCourseName-ar-${index}`}
                            value={course.name?.ar || ''}
                            onChange={(e) => handleRelatedCourseChange(index, 'name', e.target.value, 'ar')}
                            dir="rtl"
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
                      setCourseImageFile(null);
                      setLogoImageFile(null);
                      setCourseImagePreview(null);
                      setLogoImagePreview(null);
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