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

const localizedStringValidation = Joi.object({
  en: Joi.string().min(2).required().messages({
    'string.empty': 'English text is required',
    'string.min': 'English text must be at least 2 characters',
  }),
  ar: Joi.string().min(2).required().messages({
    'string.empty': 'النص العربي مطلوب',
    'string.min': 'النص العربي يجب أن يكون على الأقل حرفين',
  }),
});

const courseSchemaValidation = Joi.object({
  instructor: Joi.string().required().messages({
    'string.empty': 'Instructor is required',
    'any.required': 'Instructor is required'
  }),
  name: localizedStringValidation.required().messages({
    'any.required': 'Course name is required'
  }),
  jobTitle: localizedStringValidation.required().messages({
    'any.required': 'Job title is required'
  }),
  categoryID: Joi.string().required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required'
  }),
  description: localizedStringValidation.required().messages({
    'any.required': 'Description is required'
  }),
  IfYouLike: localizedStringValidation.optional(),
  IfYouLikeValue: localizedStringValidation.optional(),
  SkillsNeeded: localizedStringValidation.optional(),
  SkillsNeededValue: localizedStringValidation.optional(),
  organization: Joi.string().optional(),
  Skills: Joi.array().items(localizedStringValidation).optional(),
  WhatYouWillLearn: Joi.array().items(localizedStringValidation).optional(),
  outComes: Joi.object({
    outComesTitle: localizedStringValidation.optional(),
    outComesDescription: Joi.array().items(localizedStringValidation).optional()
  }).optional(),
  reviews: Joi.array().items(Joi.string()).optional()
});

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
    name: { en: "", ar: "" },
    jobTitle: { en: "", ar: "" },
    instructor: "",
    categoryID: "",
    description: { en: "", ar: "" },
    IfYouLike: { en: "", ar: "" },
    IfYouLikeValue: { en: "", ar: "" },
    SkillsNeeded: { en: "", ar: "" },
    SkillsNeededValue: { en: "", ar: "" },
    organization: "",
    relatedCourses: [] as RelatedCourse[],
    Skills: [] as Skill[],
    WhatYouWillLearn: [] as LearningOutcome[],
    outComes: {
      outComesTitle: { en: "", ar: "" },
      outComesDescription: [] as LearningOutcome[]
    },
    reviews: [] as string[],
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
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  field?: keyof typeof newCourse,
  lang?: 'en' | 'ar'
) => {
  const { name, value } = e.target;

  if (field && lang) {
    setNewCourse(prev => ({
      ...prev,
      [field]: {
        ...(prev[field] as Record<string, any>), // Type assertion
        [lang]: value
      }
    }));
  } else {
    setNewCourse(prev => ({ ...prev, [name]: value }));
  }

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
        { 
          relatedCourseID: "", 
          name: { en: "", ar: "" },
          relatedImageFile: undefined, 
          relatedImagePreview: "" 
        }
      ]
    }));
  };

  // Function to remove a related course
  const removeRelatedCourse = (index: number) => {
    setNewCourse(prev => {
      const updatedCourses = [...prev.relatedCourses];
      if (updatedCourses[index].relatedImagePreview) {
        URL.revokeObjectURL(updatedCourses[index].relatedImagePreview!);
      }
      updatedCourses.splice(index, 1);
      return { ...prev, relatedCourses: updatedCourses };
    });
  };

  // Handle related course input changes
  const handleRelatedCourseChange = (
    index: number, 
    field: keyof RelatedCourse, 
    value: string | { en: string; ar: string },
    lang?: 'en' | 'ar'
  ) => {
    setNewCourse(prev => {
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

  // Skills management functions
  const addSkill = () => {
    setNewCourse(prev => ({
      ...prev,
      Skills: [...prev.Skills, { en: "", ar: "" }]
    }));
  };

  const removeSkill = (index: number) => {
    setNewCourse(prev => {
      const updatedSkills = [...prev.Skills];
      updatedSkills.splice(index, 1);
      return { ...prev, Skills: updatedSkills };
    });
  };

  const handleSkillChange = (index: number, lang: 'en' | 'ar', value: string) => {
    setNewCourse(prev => {
      const updatedSkills = [...prev.Skills];
      updatedSkills[index] = { ...updatedSkills[index], [lang]: value };
      return { ...prev, Skills: updatedSkills };
    });
  };

  // Learning outcomes management functions
  const addLearningOutcome = () => {
    setNewCourse(prev => ({
      ...prev,
      WhatYouWillLearn: [...prev.WhatYouWillLearn, { en: "", ar: "" }]
    }));
  };

  const removeLearningOutcome = (index: number) => {
    setNewCourse(prev => {
      const updatedOutcomes = [...prev.WhatYouWillLearn];
      updatedOutcomes.splice(index, 1);
      return { ...prev, WhatYouWillLearn: updatedOutcomes };
    });
  };

  const handleLearningOutcomeChange = (index: number, lang: 'en' | 'ar', value: string) => {
    setNewCourse(prev => {
      const updatedOutcomes = [...prev.WhatYouWillLearn];
      updatedOutcomes[index] = { ...updatedOutcomes[index], [lang]: value };
      return { ...prev, WhatYouWillLearn: updatedOutcomes };
    });
  };

  // Course outcomes management functions
  const addOutcomeDescription = () => {
    setNewCourse(prev => ({
      ...prev,
      outComes: {
        ...prev.outComes,
        outComesDescription: [...prev.outComes.outComesDescription, { en: "", ar: "" }]
      }
    }));
  };

  const removeOutcomeDescription = (index: number) => {
    setNewCourse(prev => {
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
    setNewCourse(prev => {
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
    setNewCourse(prev => ({
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

  // Reviews management functions
  const addReview = () => {
    setNewCourse(prev => ({
      ...prev,
      reviews: [...prev.reviews, ""]
    }));
  };

  const removeReview = (index: number) => {
    setNewCourse(prev => {
      const updatedReviews = [...prev.reviews];
      updatedReviews.splice(index, 1);
      return { ...prev, reviews: updatedReviews };
    });
  };

  const handleReviewChange = (index: number, value: string) => {
    setNewCourse(prev => {
      const updatedReviews = [...prev.reviews];
      updatedReviews[index] = value;
      return { ...prev, reviews: updatedReviews };
    });
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = courseSchemaValidation.validate(newCourse, {
      abortEarly: false,
      allowUnknown: true
    });
    
    if (validationResult.error) {
      const newErrors: Record<string, string> = {};
      validationResult.error.details.forEach((detail) => {
        const path = detail.path.join('.');
        newErrors[path] = detail.message;
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
    
    const formData = new FormData();
    
    // Add multilingual fields as JSON
    formData.append('name', JSON.stringify(newCourse.name));
    formData.append('jobTitle', JSON.stringify(newCourse.jobTitle));
    formData.append('description', JSON.stringify(newCourse.description));
    
    // Add regular fields
    formData.append('instructor', newCourse.instructor);
    formData.append('categoryID', newCourse.categoryID);
    
    // Add optional fields
    if (newCourse.IfYouLike.en || newCourse.IfYouLike.ar) {
      formData.append('IfYouLike', JSON.stringify(newCourse.IfYouLike));
    }
    if (newCourse.IfYouLikeValue) {
      formData.append('IfYouLikeValue', JSON.stringify(newCourse.IfYouLikeValue));
    }
    if (newCourse.SkillsNeeded.en || newCourse.SkillsNeeded.ar) {
      formData.append('SkillsNeeded', JSON.stringify(newCourse.SkillsNeeded));
    }
    if (newCourse.SkillsNeededValue) {
      formData.append('SkillsNeededValue', JSON.stringify(newCourse.SkillsNeededValue));
    }
    if (newCourse.organization) {
      formData.append('organization', newCourse.organization);
    }

    // Add new fields
    if (newCourse.Skills.length > 0) {
      formData.append('Skills', JSON.stringify(newCourse.Skills));
    }
    if (newCourse.WhatYouWillLearn.length > 0) {
      formData.append('WhatYouWillLearn', JSON.stringify(newCourse.WhatYouWillLearn));
    }
    if (newCourse.outComes.outComesTitle.en || newCourse.outComes.outComesTitle.ar) {
      formData.append('outComes', JSON.stringify(newCourse.outComes));
    }
    if (newCourse.reviews.length > 0) {
      formData.append('reviews', JSON.stringify(newCourse.reviews));
    }

    // Add image files
    if (courseImageFile) {
      formData.append('courseImage', courseImageFile);
    }
    if (logoImageFile) {
      formData.append('logoImage', logoImageFile);
    }

    // Add related courses
    newCourse.relatedCourses.forEach((course, index) => {
      formData.append(`relatedCourses[${index}][relatedCourseID]`, course.relatedCourseID);
      formData.append(`relatedCourses[${index}][name]`, JSON.stringify(course.name));
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
          name: { en: "", ar: "" },
          jobTitle: { en: "", ar: "" },
          instructor: "",
          categoryID: "",
          description: { en: "", ar: "" },
          IfYouLike: { en: "", ar: "" },
          IfYouLikeValue: { en: "", ar: "" },
          SkillsNeeded: { en: "", ar: "" },
          SkillsNeededValue: { en: "", ar: "" },
          organization: "",
          relatedCourses: [],
          Skills: [],
          WhatYouWillLearn: [],
          outComes: {
            outComesTitle: { en: "", ar: "" },
            outComesDescription: []
          },
          reviews: [],
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

  // console.log(courses, "Courses Data");
  
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
                {/* Course Name - English */}
                <div className="space-y-2">
                  <Label htmlFor="name-en">Course Name (English) *</Label>
                  <Input
                    id="name-en"
                    value={newCourse.name.en}
                    onChange={(e) => handleInputChange(e, 'name', 'en')}
                    className={errors['name.en'] ? "border-red-500" : ""}
                  />
                  {errors['name.en'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['name.en']}</p>
                  )}
                </div>
                
                {/* Course Name - Arabic */}
                <div className="space-y-2">
                  <Label htmlFor="name-ar">اسم الكورس (عربي) *</Label>
                  <Input
                    id="name-ar"
                    value={newCourse.name.ar}
                    onChange={(e) => handleInputChange(e, 'name', 'ar')}
                    className={errors['name.ar'] ? "border-red-500" : ""}
                    dir="rtl"
                  />
                  {errors['name.ar'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['name.ar']}</p>
                  )}
                </div>

                {/* Job Title - English */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle-en">Job Title (English) *</Label>
                  <Input
                    id="jobTitle-en"
                    value={newCourse.jobTitle.en}
                    onChange={(e) => handleInputChange(e, 'jobTitle', 'en')}
                    className={errors['jobTitle.en'] ? "border-red-500" : ""}
                  />
                  {errors['jobTitle.en'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['jobTitle.en']}</p>
                  )}
                </div>
                
                {/* Job Title - Arabic */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle-ar">المسمى الوظيفي (عربي) *</Label>
                  <Input
                    id="jobTitle-ar"
                    value={newCourse.jobTitle.ar}
                    onChange={(e) => handleInputChange(e, 'jobTitle', 'ar')}
                    className={errors['jobTitle.ar'] ? "border-red-500" : ""}
                    dir="rtl"
                  />
                  {errors['jobTitle.ar'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['jobTitle.ar']}</p>
                  )}
                </div>

                {/* Instructor and Category */}
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
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description-en">Description (English) *</Label>
                  <Textarea
                    id="description-en"
                    value={newCourse.description.en}
                    onChange={(e) => handleInputChange(e, 'description', 'en')}
                    rows={3}
                    className={errors['description.en'] ? "border-red-500" : ""}
                  />
                  {errors['description.en'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['description.en']}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description-ar">الوصف (عربي) *</Label>
                  <Textarea
                    id="description-ar"
                    value={newCourse.description.ar}
                    onChange={(e) => handleInputChange(e, 'description', 'ar')}
                    rows={3}
                    className={errors['description.ar'] ? "border-red-500" : ""}
                    dir="rtl"
                  />
                  {errors['description.ar'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['description.ar']}</p>
                  )}
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* If You Like - English */}
                <div className="space-y-2">
                  <Label htmlFor="IfYouLike-en">If You Like (English)</Label>
                  <Input
                    id="IfYouLike-en"
                    value={newCourse.IfYouLike.en}
                    onChange={(e) => handleInputChange(e, 'IfYouLike', 'en')}
                    className={errors['IfYouLike.en'] ? "border-red-500" : ""}
                  />
                  {errors['IfYouLike.en'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['IfYouLike.en']}</p>
                  )}
                </div>
                
                {/* If You Like - Arabic */}
                <div className="space-y-2">
                  <Label htmlFor="IfYouLike-ar">إذا كنت تحب (عربي)</Label>
                  <Input
                    id="IfYouLike-ar"
                    value={newCourse.IfYouLike.ar}
                    onChange={(e) => handleInputChange(e, 'IfYouLike', 'ar')}
                    className={errors['IfYouLike.ar'] ? "border-red-500" : ""}
                    dir="rtl"
                  />
                  {errors['IfYouLike.ar'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['IfYouLike.ar']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="IfYouLikeValue">If You Like Value</Label>
                  <Input
                    id="IfYouLikeValue-en"
                    value={newCourse.IfYouLikeValue.en}
                    onChange={(e) => handleInputChange(e, 'IfYouLikeValue', 'en')}
                    className={errors['IfYouLikeValue.en'] ? "border-red-500" : ""}
                  />
                  {errors['IfYouLikeValue.en'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['IfYouLikeValue.en']}</p>
                  )}
                </div>
                {/* If You Like Value - Arabic */}
                <div className="space-y-2">
                  <Label htmlFor="IfYouLikeValue">If You Like Value (عربي)</Label>
                  <Input
                    id="IfYouLikeValue-ar"
                    value={newCourse.IfYouLikeValue.ar}
                    onChange={(e) => handleInputChange(e, 'IfYouLikeValue', 'ar')}
                    className={errors['IfYouLikeValue.ar'] ? "border-red-500" : ""}
                  />
                  {errors['IfYouLikeValue.ar'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['IfYouLikeValue.ar']}</p>
                  )}
                </div>

                {/* Skills Needed - English */}
                <div className="space-y-2">
                  <Label htmlFor="SkillsNeeded-en">Skills Needed (English)</Label>
                  <Input
                    id="SkillsNeeded-en"
                    value={newCourse.SkillsNeeded.en}
                    onChange={(e) => handleInputChange(e, 'SkillsNeeded', 'en')}
                    className={errors['SkillsNeeded.en'] ? "border-red-500" : ""}
                  />
                  {errors['SkillsNeeded.en'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['SkillsNeeded.en']}</p>
                  )}
                </div>
                
                {/* Skills Needed - Arabic */}
                <div className="space-y-2">
                  <Label htmlFor="SkillsNeeded-ar">المهارات المطلوبة (عربي)</Label>
                  <Input
                    id="SkillsNeeded-ar"
                    value={newCourse.SkillsNeeded.ar}
                    onChange={(e) => handleInputChange(e, 'SkillsNeeded', 'ar')}
                    className={errors['SkillsNeeded.ar'] ? "border-red-500" : ""}
                    dir="rtl"
                  />
                  {errors['SkillsNeeded.ar'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['SkillsNeeded.ar']}</p>
                  )}
                </div>

                 {/* Skills Needed Value - English */}
                <div className="space-y-2">
                  <Label htmlFor="SkillsNeededValue-en">Skills Needed Value (English)</Label>
                  <Input
                    id="SkillsNeededValue-en"
                    value={newCourse.SkillsNeededValue.en}
                    onChange={(e) => handleInputChange(e, 'SkillsNeededValue', 'en')}
                    className={errors['SkillsNeededValue.en'] ? "border-red-500" : ""}
                  />
                  {errors['SkillsNeededValue.en'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['SkillsNeededValue.en']}</p>
                  )}
                </div>
                
                {/* Skills Needed Value - Arabic */}
                <div className="space-y-2">
                  <Label htmlFor="SkillsNeededValue-ar">المهارات المطلوبة (عربي)</Label>
                  <Input
                    id="SkillsNeededValue-ar"
                    value={newCourse.SkillsNeededValue.ar}
                    onChange={(e) => handleInputChange(e, 'SkillsNeededValue', 'ar')}
                    className={errors['SkillsNeededValue.ar'] ? "border-red-500" : ""}
                    dir="rtl"
                  />
                  {errors['SkillsNeededValue.ar'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['SkillsNeededValue.ar']}</p>
                  )}
                </div>
                {/* Organization */}
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

                {newCourse.Skills.map((skill, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Skill #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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

                {newCourse.WhatYouWillLearn.map((outcome, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Learning Outcome #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLearningOutcome(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
                      value={newCourse.outComes.outComesTitle.en}
                      onChange={(e) => handleOutcomeTitleChange('en', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outcome-title-ar">عنوان النتيجة (عربي)</Label>
                    <Input
                      id="outcome-title-ar"
                      value={newCourse.outComes.outComesTitle.ar}
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

                {newCourse.outComes.outComesDescription.map((desc, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Description #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOutcomeDescription(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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

              {/* Reviews Section */}
              {/* <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Reviews</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addReview}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Review
                  </Button>
                </div>

                {newCourse.reviews.map((review, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Review #{index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReview(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`review-${index}`}>Review Text</Label>
                      <Input
                        id={`review-${index}`}
                        value={review}
                        onChange={(e) => handleReviewChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div> */}

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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`relatedCourseName-en-${index}`}>Course Name (English)</Label>
                        <Input
                          id={`relatedCourseName-en-${index}`}
                          value={course.name.en}
                          onChange={(e) => handleRelatedCourseChange(index, 'name', e.target.value, 'en')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`relatedCourseName-ar-${index}`}>اسم الكورس (عربي)</Label>
                        <Input
                          id={`relatedCourseName-ar-${index}`}
                          value={course.name.ar}
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