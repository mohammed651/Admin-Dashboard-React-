import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useAppDispatch, useAppSelector } from "@/hooks/use-AppDispatch";
import { useEffect, useState } from "react";
import { selectAllCategories } from "@/store/slices/categorySlice";
import { User, Course, Category } from "@/types"; // تأكد من استيراد الأنواع الصحيحة
import { fetchUsers } from "@/store/slices/userSlice";
import { fetchAllCourses } from "@/store/slices/courseSlice";
import { fetchCategories } from "@/store/slices/categorySlice";
import ViewsChart from "@/components/dashboard/ViewsChart";
import SubscriptionsChart from "@/components/dashboard/SubscriptionsChart";

const COLORS = ["#0056D2", "#2978E0", "#003C92", "#0056ff", "#6C757D"];

interface ChartData {
  name: string;
  value: number;
  image?: string;
}

interface PopularCourse {
  name: string;
  enrollments: number;
  category: string;
}

export default function Analytics() {
  const dispatch = useAppDispatch();
  // Type the Redux state
  const users = useAppSelector((state) => state.user.users) as User[];
  const courses = useAppSelector((state) => state.course.courses) as Course[];
  const categories = useAppSelector(selectAllCategories) as Category[];

  // State with proper types
  const [userRoleData, setUserRoleData] = useState<ChartData[]>([]);
  const [courseCategoryData, setCourseCategoryData] = useState<ChartData[]>([]);
  const [popularCoursesData, setPopularCoursesData] = useState<PopularCourse[]>(
    []
  );
  const [userActivityData, setUserActivityData] = useState<
    { name: string; activeUsers: number }[]
  >([]);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllCourses());
    dispatch(fetchCategories());
  }, []);
  // Process users data
  useEffect(() => {
    if (users && users.length > 0) {
      const roleCounts = users.reduce((acc: Record<string, number>, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      setUserRoleData(
        Object.entries(roleCounts).map(([name, value]) => ({
          name,
          value,
        }))
      );
    }
  }, [users]);

  // Process categories data
  useEffect(() => {
    if (categories && categories.length > 0) {
      const processedData = categories.map((category) => ({
        name: category.categoryName,
        value: category.courses?.length || 0,
        image: category.categoryImage,
      }));

      setCourseCategoryData(processedData);
    }
  }, [categories]);

  // Process courses data
  useEffect(() => {
    if (courses && courses.length > 0 && categories && categories.length > 0) {
      const popularCourses = [...courses]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map((course) => ({
          name:
            typeof course.name === "string"
              ? course.name
              : course.name?.en || "", // fallback to English or empty string
          enrollments: course.views || 0,
          category:
            categories.find((cat) => cat._id === course.categoryID)
              ?.categoryName || "Uncategorized",
        }));

      setPopularCoursesData(popularCourses);
    }
  }, [courses, categories]);

  // Mock user activity data
  useEffect(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    setUserActivityData(
      days.map((day) => ({
        name: day,
        activeUsers: Math.floor(Math.random() * 100) + 150,
      }))
    );
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Roles Distribution Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Roles Distribution</CardTitle>
              <CardDescription>Breakdown of users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {userRoleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {userRoleData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} users`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No user data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Course Categories Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Categories</CardTitle>
              <CardDescription>
                Distribution of courses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {courseCategoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {courseCategoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} courses`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No category data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Popular Courses Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Most Popular Courses</CardTitle>
              <CardDescription>Top courses by views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {popularCoursesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={popularCoursesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="enrollments" fill="#0056D2" name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No course data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[400px]">
            <ViewsChart courses={courses} />
          </div>
          <div className="h-[400px]">
            <SubscriptionsChart users={users} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
