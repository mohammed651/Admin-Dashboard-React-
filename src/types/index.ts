import { Types } from "mongoose";

export interface Category {
  _id: string;
  categoryImage: string;
  categoryName: string;
}
interface SocialMedia {
  LinkidIn?: string; // Optional LinkedIn URL
}
export interface Instructor {
   _id?: string; // Mongoose automatically adds this
  Name: string; // Required
  instructorImage?: string; // Optional
  job?: string; // Optional
  coursesTitle?: string[]; // Optional array of course titles
  SocialMedia?: SocialMedia; // Optional social media object
  description?: string; // Optional
  courses?: Course[]; // Array of references to Course documents
  createdAt?: Date; // Added by timestamps
  updatedAt?: Date; // Added by timestamps
}

export interface Course {
  _id: string;
  name: string;
  instructor: string;
  categoryID: string;
  description: string;
  IfYouLike?: string;
  IfYouLikeValue?: string;
  SkillsNeeded?: string;
  SkillsNeededValue?: string;
  organization?: string;
  logoImage?: string;
  courseImage?: string;
  enrolled: number;
  createdAt?: string;
  courseId?: number;
  views?: number;
}

export interface RootState {
  course: {
    courses: Course[];
    currentCourse: any;
    loading: boolean;
    error: string | null;
  };
  instructor: {
    instructors: Instructor[];
    status: string;
  };
  category: {
    categories: Category[];
    status: string;
  };
}

export interface SuccessStory {
  _id: string;
  name: string;
  certificateName: string;
  review: string;
  date: string;
  personImage: string;
}

export interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username: string;
  password?: string; // عادة لا تُرسل من السيرفر لكن أضفناها كاختيارية
  role: 'User' | 'Admin';
  status: 'active' | 'inactive';
  enrolledCourses?: number;
  joinDate: string;
  phone?: string;
  gender?: string;
  userImage?: string;
  location?: string;
  dob?: string;
  isConfirmed?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  courses?: [];
  // Optional: لو عايز تعرض progress في المستقبل
  progress?: {
    progressCourses: {
      courseId?: string;
      name?: string;
      passedModules?: {
        moduleId?: string;
        name?: string;
        passedTopics?: {
          topicId?: string;
          name?: string;
          passedSubTopics?: {
            subTopicId?: string;
            name?: string;
          }[];
        }[];
      }[];
    }[];
  };
}

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  roleFilter: 'all' | 'User' | 'Admin' | 'Instructor'; // Updated to match role types
  statusFilter: 'all' | 'active' | 'inactive';
}
export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'User' | 'Admin' | 'Instructor';
  status?: 'active' | 'inactive';
}

export interface VideoData {
  _id: string;
  title: string;
  videoUrl: string;
  transeScript: string;
  discuseion: string;
  duration: string;
  public_id: string;
  __v: number;
}
export interface VideoState {
  videoData: VideoData | null;
  loading: boolean;
  error: string | null;
}