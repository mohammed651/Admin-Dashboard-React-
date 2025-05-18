import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash,
  UserIcon,
  UsersIcon,
  EyeIcon,
  Video,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import { fetchCourseById } from "@/store/slices/courseSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createModule, deleteModule } from "@/store/slices/moduleSlice";
import { createTopic, deleteTopic } from "@/store/slices/topicSlice";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchAllInstructors,
  selectAllInstructors,
} from "@/store/slices/instructorSlice";
import { selectAllCategories } from "@/store/slices/categorySlice";
import { fetchCategories } from "@/store/slices/categorySlice";
import { useAppDispatch } from "@/hooks/use-AppDispatch";
import { uploadVideoStream } from "@/store/slices/videoSlice";
import { createAssignment } from "@/store/slices/assignmentSlice";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";
import VideoPlayer from "@/components/dashboard/Course/VideoPlayer";
import { createQuestion } from "@/store/slices/questionSlice";
import AssignmentDetails from "@/components/dashboard/Course/AssignmentCard";

interface CourseModule {
  _id: string;
  moduleTitle: string;
  topics: Topic[];
}

interface Topic {
  _id: string;
  title: string;
  description?: string;
  videos?: any[];
  assignments?: any[];
}

interface CourseData {
  _id: string;
  instructor: string;
  name: string;
  categoryID: string;
  IfYouLike: string;
  IfYouLikeValue: string;
  SkillsNeeded: string;
  SkillsNeededValue: string;
  logoImage: string;
  organization: string;
  views: number;
  enrolled: number;
  modules: CourseModule[];
  description: string;
  reviews: any[];
  courseImage: string;
  relatedCourses: any[];
  createdAt: string;
  updatedAt: string;
  courseId: number;
}
interface Assignment {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number;
  retryDelay: number;
}

interface Question {
  content: string;
  type: "truefalse" | "msq";
  options: string[];
  correctAnswers: number[];
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export default function CourseDetails() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { currentCourse, loading, error } = useSelector(
    (state: any) => state.course
  );
  const instructors = useSelector(selectAllInstructors);
  const categories = useSelector(selectAllCategories);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [contentTypeDialogOpen, setContentTypeDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({ moduleTitle: ""});
  const [newTopic, setNewTopic] = useState({ title: "", description: "" });
  const [newVideo, setNewVideo] = useState({
    videoTitle: "",
    videoFile: null as File | null,
    transeScript: "",
    discuseion: "",
  });
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    passingScore: 80,
    timeLimit: 60,
    retryDelay: 60,
    questions: [] as Question[],
  });

  const [newQuestion, setNewQuestion] = useState({
    content: "",
    type: "msq" as "truefalse" | "msq",
    options: [""],
    correctAnswers: [] as number[],
    explanation: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
      dispatch(fetchAllInstructors());
      dispatch(fetchCategories());
    }
  }, [id, dispatch]);

  const getInstructorName = (instructorId: string): string => {
    if (!Array.isArray(instructors)) return instructorId;
    const instructor = instructors.find((inst) => inst._id === instructorId);
    return instructor ? instructor.Name : instructorId;
  };

  const getCategoryName = (categoryId: string): string => {
    if (!Array.isArray(categories)) return `Category ${categoryId}`;
    const category = categories.find(
      (cat) => cat._id.toString() === categoryId.toString()
    );
    return category ? category.categoryName : `Category ${categoryId}`;
  };

  const handleAddModule = async () => {
    try {
      if (!id || !currentCourse?.data?._id) return;

      await dispatch(
        createModule({
          courseId: currentCourse.data._id,
          moduleData: newModule,
        })
      ).unwrap();

      setNewModule({ moduleTitle: ""});
      setModuleDialogOpen(false);
      toast({
        title: "Success",
        description: "Module added successfully.",
        variant: "success",
      });
      dispatch(fetchCourseById(id));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add module.",
        variant: "destructive",
      });
    }
  };

  const handleAddTopic = async () => {
    if (!selectedModuleId) {
      toast({
        title: "Error",
        description: "No module selected.",
        variant: "destructive",
      });
      return;
    }

    try {
     const result = await dispatch(
        createTopic({
          moduleId: selectedModuleId,
          topicData: newTopic,
        })
      ).unwrap();
      setSelectedTopicId(result.data._id);
      setNewTopic({ title: "", description: "" });
      setTopicDialogOpen(false);
      setContentTypeDialogOpen(true);

      toast({
        title: "Success",
        description: "Topic added successfully.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add topic.",
        variant: "destructive",
      });
    }
  };

  const handleAddVideo = async () => {
    if (!newVideo.videoFile || !selectedTopicId) {
      toast({
        title: "Error",
        description:
          "Please select a video file and ensure a topic is selected.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const cloudinaryResponse = await uploadVideoToCloudinary(
        newVideo.videoFile,
        (percent) => setUploadProgress(percent)
      );

      const videoData = {
        videoTitle: newVideo.videoTitle,
        url: cloudinaryResponse.url,
        transeScript: newVideo.transeScript,
        discuseion: newVideo.discuseion,
        duration: cloudinaryResponse.duration,
        public_id: cloudinaryResponse.public_id,
      };

      await dispatch(
        uploadVideoStream({
          topicId: selectedTopicId, // Use selectedTopicId directly
          formData: videoData,
        })
      ).unwrap();

      // Reset state
      setNewVideo({
        videoTitle: "",
        videoFile: null,
        transeScript: "",
        discuseion: "",
      });
      setVideoDialogOpen(false);
      setContentTypeDialogOpen(false);

      toast({
        title: "Success",
        description: "Video added successfully.",
        variant: "success",
      });

      dispatch(fetchCourseById(id));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add video.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddAssignment = async () => {
    try {
      if (!selectedTopicId) {
        throw new Error("Topic not selected");
      }

      // First create all questions and wait for their IDs
      const questionCreationPromises = newAssignment.questions.map((q) =>
        dispatch(createQuestion(q)).unwrap()
      );

      const createdQuestions = await Promise.all(questionCreationPromises);
      const questionIds = createdQuestions.map((q) => q._id);
      console.log(createdQuestions);

      // Then create the assignment with the question IDs
      await dispatch(
        createAssignment({
          title: newAssignment.title,
          description: newAssignment.description,
          passingScore: newAssignment.passingScore,
          timeLimit: newAssignment.timeLimit,
          retryDelay: newAssignment.retryDelay,
          questions: questionIds,
          topicId: selectedTopicId,
          courseId: id,
        })
      ).unwrap();

      // Reset state
      setNewAssignment({
        title: "",
        description: "",
        passingScore: 80,
        timeLimit: 60,
        retryDelay: 60,
        questions: [],
      });
      setAssignmentDialogOpen(false);
      setContentTypeDialogOpen(false);

      toast({
        title: "Success",
        description: "Assignment added successfully.",
        variant: "success",
      });

      dispatch(fetchCourseById(id));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add assignment.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await dispatch(deleteModule(moduleId)).unwrap();
      toast({
        title: "Success",
        description: "Module deleted successfully.",
        variant: "success",
      });
      dispatch(fetchCourseById(id));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTopic = async (topicId: string, moduleId: string) => {
    try {
      await dispatch(deleteTopic(topicId)).unwrap();
      toast({
        title: "Success",
        description: "Topic deleted successfully.",
        variant: "success",
      });
      dispatch(fetchCourseById(id));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete topic.",
        variant: "destructive",
      });
    }
  };

  const toggleModule = (moduleId: string) =>
    setExpandedModule(expandedModule === moduleId ? null : moduleId);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please select a valid video file.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum allowed size is 100MB.",
        variant: "destructive",
      });
      return;
    }

    setNewVideo((prev) => ({
      ...prev,
      videoFile: file,
    }));
  };

  const handleAddQuestion = () => {
    setNewAssignment((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setNewQuestion({
      content: "",
      type: "msq",
      options: [""],
      correctAnswers: [],
      explanation: "",
      difficulty: "medium",
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setNewAssignment((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleAddOption = () => {
    setNewQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const handleRemoveOption = (index: number) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswers: prev.correctAnswers.filter((a) => a !== index),
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleCorrectAnswerToggle = (index: number) => {
    setNewQuestion((prev) => {
      const newCorrectAnswers = [...prev.correctAnswers];
      const answerIndex = newCorrectAnswers.indexOf(index);

      if (answerIndex === -1) {
        newCorrectAnswers.push(index);
      } else {
        newCorrectAnswers.splice(answerIndex, 1);
      }

      return { ...prev, correctAnswers: newCorrectAnswers };
    });
  };

  // Loading state skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Course Header Skeleton */}
          <div className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Course Image Skeleton */}
                <div className="w-full md:w-1/3 lg:w-1/4">
                  <Skeleton className="rounded-lg aspect-[4/3] w-full h-full" />
                </div>

                {/* Course Details Skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>

              {/* Modules Section Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>

                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-5 w-5 rounded" />
                          <Skeleton className="h-5 w-48" />
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Info Sidebar Skeleton */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </div>

              <div className="border rounded-lg p-4">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state (maintains layout with error message)
  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Course Header (empty state) */}
          <div className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 lg:w-1/4">
                  <div className="rounded-lg aspect-[4/3] bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-red-500">Error loading image</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-red-800 font-medium">
                      Error loading course
                    </h3>
                    <p className="text-red-600 mt-1">
                      {JSON.stringify(error, null, 2) + error.msgError ||
                        "An error occurred while loading the course"}
                    </p>
                  </div>
                  <Skeleton className="h-8 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the layout remains but with disabled/empty states */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Description</h2>
                <p className="text-gray-600">
                  No description available due to error
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Modules</h2>
                  <Button disabled>
                    <Plus className="mr-2 h-4 w-4" /> Add Module
                  </Button>
                </div>
                <div className="text-center py-8 text-gray-500">
                  Cannot load modules due to error
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Course Information</h3>
                <div className="text-gray-500">
                  Information not available due to error
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentCourse?.data) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Course Header (not found state) */}
          <div className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 lg:w-1/4">
                  <div className="rounded-lg aspect-[4/3] bg-gray-100 flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-gray-500">Course not found</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Course Not Found
                  </h1>
                  <p className="text-gray-600">
                    The requested course could not be found or may have been
                    removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const courseData: CourseData = currentCourse.data;
  console.log(courseData);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Course Image */}
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="rounded-lg overflow-hidden shadow-md aspect-[4/3] bg-gray-50">
                  {courseData.courseImage ? (
                    <img
                      src={courseData.courseImage}
                      alt={courseData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Details */}
              <div className="flex-1 space-y-4">
                {/* Category and Organization */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getCategoryName(courseData.categoryID)}
                  </span>

                  {courseData.organization && (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {courseData.organization}
                    </span>
                  )}
                </div>

                {/* Course Title */}
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {courseData.name}
                </h1>

                {/* Instructor and Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <span>By {getInstructorName(courseData.instructor)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4 text-gray-500" />
                    <span>{courseData.enrolled} Enrolled</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <EyeIcon className="h-4 w-4 text-gray-500" />
                    <span>{courseData.views} Views</span>
                  </div>
                </div>

                {/* Course Description */}
                <p className="text-gray-700 leading-relaxed">
                  {courseData.description}
                </p>

                {/* Skills and Interests */}
                <div className="flex flex-wrap gap-4 pt-2">
                  {courseData.SkillsNeeded && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Skills Needed
                      </h3>
                      <p className="text-sm text-gray-600">
                        {courseData.SkillsNeeded}
                      </p>
                    </div>
                  )}

                  {courseData.IfYouLike && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        You'll Like If
                      </h3>
                      <p className="text-sm text-gray-600">
                        {courseData.IfYouLike}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-gray-600">{courseData.description}</p>
            </div>

            {/* Modules Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Modules</h2>
                <Button onClick={() => setModuleDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Module
                </Button>
              </div>

              {courseData.modules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No modules yet
                </div>
              ) : (
                <div className="space-y-2">
                  {courseData.modules.map((module) => (
                    <div
                      key={module._id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <button onClick={() => toggleModule(module._id)}>
                            {expandedModule === module._id ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-medium">
                              {module.moduleTitle}
                            </h3>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedModuleId(module._id);
                              setTopicDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Topic
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteModule(module._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {expandedModule === module._id && (
                        <div className="p-4 border-t">
                          {module.topics?.length > 0 ? (
                            <div className="space-y-3">
                              {module.topics.map((topic) => (
                                <div
                                  key={topic._id}
                                  className="flex justify-between items-start p-3 bg-gray-50 rounded"
                                >
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {topic.title}
                                    </h4>
                                    {topic.description && (
                                      <p className="text-sm text-gray-600">
                                        {topic.description}
                                      </p>
                                    )}
                                    {/* Display content type */}
                                    {/* Display content type */}
                                    <div className="mt-4 space-y-8">
                                      {/* Videos Section */}
                                      {topic.videos?.length > 0 && (
                                        <div>
                                          <h3 className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                                            <Video className="w-4 h-4 mr-2" />
                                            Videos ({topic.videos.length})
                                          </h3>

                                          <div className="space-y-4">
                                            {topic.videos.map(
                                              (videoId, index) => (
                                                <VideoPlayer
                                                  key={index}
                                                  id={videoId}
                                                />
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Assignments Section */}
                                      {topic.assignments?.length > 0 && (
                                        <div>
                                          <h3 className="flex items-center text-sm font-semibold text-green-800 mb-2">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Assignments (
                                            {topic.assignments.length})
                                          </h3>

                                          <div className="space-y-4">
                                            {topic.assignments.map(
                                              (assignment, index) => (
                                                <AssignmentDetails
                                                  key={index}
                                                  assignmentId={assignment._id}
                                                />
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    {/* Add Content Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedModuleId(module._id);
                                        setSelectedTopicId(topic._id); // Add this state
                                        setContentTypeDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-4 w-4 mr-1" /> Add
                                      Content
                                    </Button>
                                    {/* Delete Button */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() =>
                                        handleDeleteTopic(topic._id, module._id)
                                      }
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              No topics yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Info Sidebar */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Course Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Category ID</p>
                  <p>{getCategoryName(courseData.categoryID)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p>{courseData.organization || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enrollments</p>
                  <p>{courseData.enrolled}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Views</p>
                  <p>{courseData.views}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p>{new Date(courseData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {courseData.SkillsNeeded && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Skills Needed</h3>
                <p>{courseData.SkillsNeeded}</p>
                {courseData.SkillsNeededValue && (
                  <p className="text-sm text-gray-600 mt-1">
                    {courseData.SkillsNeededValue}
                  </p>
                )}
              </div>
            )}

            {courseData.IfYouLike && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">If You Like</h3>
                <p>{courseData.IfYouLike}</p>
                {courseData.IfYouLikeValue && (
                  <p className="text-sm text-gray-600 mt-1">
                    {courseData.IfYouLikeValue}
                  </p>
                )}
              </div>
            )}

            {courseData.logoImage && (
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Course Logo</h3>
                <img
                  src={courseData.logoImage}
                  alt="Course Logo"
                  className="h-20 object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Module Dialog */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
            <DialogDescription>
              Create a new module for this course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Module Title *</Label>
              <Input
                value={newModule.moduleTitle}
                onChange={(e) =>
                  setNewModule({ ...newModule, moduleTitle: e.target.value })
                }
                placeholder="Introduction to Programming"
                required
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddModule}>Add Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Topic Dialog */}
      <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
            <DialogDescription>
              Create a new topic for the selected module
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic Title *</Label>
              <Input
                value={newTopic.title}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, title: e.target.value })
                }
                placeholder="Variables and Data Types"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newTopic.description}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, description: e.target.value })
                }
                placeholder="Learn about basic programming concepts"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTopic}>Add Topic</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Content Type Dialog */}
      <Dialog
        open={contentTypeDialogOpen}
        onOpenChange={setContentTypeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Content to Topic</DialogTitle>
            <DialogDescription>
              Select the type of content for this topic
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setContentTypeDialogOpen(false);
                setVideoDialogOpen(true);
              }}
            >
              <Video className="h-6 w-6" />
              <span>Video</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => {
                setContentTypeDialogOpen(false);
                setAssignmentDialogOpen(true);
              }}
            >
              <FileText className="h-6 w-6" />
              <span>Assignment</span>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setContentTypeDialogOpen(false);
                dispatch(fetchCourseById(id));
              }}
            >
              Skip for now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Video Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Video Content</DialogTitle>
            <DialogDescription>Upload a video for this topic</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Video Title *</Label>
              <Input
                value={newVideo.videoTitle}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, videoTitle: e.target.value })
                }
                placeholder="Introduction to Variables"
                required
              />
            </div>

            {/* Input for file selection */}
            <div className="space-y-2">
              <Label>Video File *</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                required
              />

              {/* Name of the selected video */}
              {newVideo.videoFile && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  Selected: {newVideo.videoFile.name}
                </p>
              )}

              {/* Progress bar during upload */}
              {isUploading && (
                <div className="relative w-full bg-gray-100 rounded-full h-4 mt-3 shadow-inner overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-black drop-shadow">
                    {uploadProgress}%
                  </span>
                </div>
              )}

              {/* Preview of the selected video */}
              {newVideo.videoFile && !isUploading && (
                <video
                  src={URL.createObjectURL(newVideo.videoFile)}
                  className="mt-2 rounded max-h-48 w-full object-contain"
                  controls
                />
              )}
            </div>

            {/* Transcript and Discussion fields */}
            <div className="space-y-2">
              <Label>Transcript</Label>
              <Textarea
                value={newVideo.transeScript}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, transeScript: e.target.value })
                }
                placeholder="Video transcript text"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Discussion Points</Label>
              <Textarea
                value={newVideo.discuseion}
                onChange={(e) =>
                  setNewVideo({ ...newVideo, discuseion: e.target.value })
                }
                placeholder="Key discussion points for this video"
                rows={3}
              />
            </div>
          </div>

          {/* Footer with action buttons */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVideo} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Assignment Dialog */}
      <Dialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Assignment</DialogTitle>
            <DialogDescription>
              Create an assignment for this topic
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Assignment Title *</Label>
              <Input
                value={newAssignment.title}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, title: e.target.value })
                }
                placeholder="Variables Quiz"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newAssignment.description}
                onChange={(e) =>
                  setNewAssignment({
                    ...newAssignment,
                    description: e.target.value,
                  })
                }
                placeholder="Assignment description and instructions"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newAssignment.passingScore}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      passingScore: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Time Limit (min)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newAssignment.timeLimit}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      timeLimit: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Retry Delay (min)</Label>
                <Input
                  type="number"
                  min="1"
                  value={newAssignment.retryDelay}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      retryDelay: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <h3 className="font-medium">Questions</h3>

              {/* List of added questions */}
              {newAssignment.questions.map((q, qIndex) => (
                <div key={qIndex} className="border p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Question {qIndex + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRemoveQuestion(qIndex)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm mb-2">{q.content}</p>
                  <div className="space-y-1">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center">
                        <input
                          type={q.type === "msq" ? "checkbox" : "radio"}
                          checked={q.correctAnswers.includes(optIndex)}
                          readOnly
                          className="mr-2"
                        />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add new question form */}
              <div className="border p-4 rounded-lg space-y-4">
                <h4 className="font-medium">Add New Question</h4>

                <div className="space-y-2">
                  <Label>Question Content *</Label>
                  <Input
                    value={newQuestion.content}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        content: e.target.value,
                      })
                    }
                    placeholder="Enter question text"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Question Type *</Label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        type: e.target.value as "truefalse" | "msq",
                        correctAnswers: [], // Reset correct answers when type changes
                      })
                    }
                    className="border rounded-md px-3 py-2 w-full"
                  >
                    <option value="msq">Multiple Choice</option>
                    <option value="truefalse">True/False</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Options *</Label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type={newQuestion.type === "msq" ? "checkbox" : "radio"}
                        checked={newQuestion.correctAnswers.includes(index)}
                        onChange={() => handleCorrectAnswerToggle(index)}
                        className="mr-2"
                      />
                      <Input
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {newQuestion.options.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={
                      newQuestion.options.length >=
                      (newQuestion.type === "truefalse" ? 2 : 10)
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        difficulty: e.target.value as
                          | "easy"
                          | "medium"
                          | "hard",
                      })
                    }
                    className="border rounded-md px-3 py-2 w-full"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Explanation</Label>
                  <Textarea
                    value={newQuestion.explanation}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        explanation: e.target.value,
                      })
                    }
                    placeholder="Explanation for the correct answer"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleAddQuestion}
                  disabled={
                    !newQuestion.content ||
                    newQuestion.options.some((opt) => !opt.trim()) ||
                    newQuestion.correctAnswers.length === 0 ||
                    (newQuestion.type === "truefalse" &&
                      newQuestion.options.length !== 2)
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Question
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignmentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAssignment}
              disabled={newAssignment.questions.length === 0}
            >
              Add Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
