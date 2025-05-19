import { Book, Users, Eye, UserCheck } from "lucide-react"; // تغيير الأيقونات
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import CourseTable from "@/components/dashboard/Course/CourseTable";
import ViewsChart from "@/components/dashboard/ViewsChart"; // مكون جديد
import SubscriptionsChart from "@/components/dashboard/SubscriptionsChart"; // مكون جديد
import { useDispatch, useSelector } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { fetchAllCourses } from "./../store/slices/courseSlice";
import { useEffect } from "react";
import { fetchUsers } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/hooks/use-AppDispatch";
import { RootState } from "@/store/store"; // تأكد من وجود هذا الملف

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded-md my-4">
      <h2 className="text-lg font-medium text-red-800">
        Something went wrong:
      </h2>
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

export default function Dashboard() {
  const { courses = [] } = useSelector((state: RootState) => state.course);
  const { users = [] } = useSelector((state: RootState) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllCourses());
    dispatch(fetchUsers());
  }, [dispatch]);

  // حساب البيانات المطلوبة
  const totalViews = Array.isArray(courses)
  ? courses.reduce((sum, course) => sum + (course.views || 0), 0)
  : 0;



  const subscribedUsers = users.filter(user => user.isSubscribed === true).length;
  const recentCourses = courses.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Courses"
            value={courses.length}
            icon={<Book size={20} />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Users"
            value={users.length}
            icon={<Users size={20} />}
            trend={{ value: 18, isPositive: true }}
          />
          <StatCard
            title="Total Views"
            value={totalViews.toLocaleString()}
            icon={<Eye size={20} />} // أيقونة العين للمشاهدات
            trend={{ value: 25, isPositive: true }}
          />
          <StatCard
            title="Subscribed Users"
            value={subscribedUsers}
            icon={<UserCheck size={20} />} // أيقونة المستخدم المشترك
            trend={{ value: 10, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-8">
          <ViewsChart courses={courses} /> {/* مكون جديد لعرض المشاهدات */}
          <SubscriptionsChart users={users} /> {/* مكون جديد لعرض الاشتراكات */}
        </div>

        {/* Recent Courses */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Recent Courses</h2>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => dispatch(fetchAllCourses())}
          >
            <CourseTable
              courses={recentCourses} 
              searchQuery=""
              categories={[]}
              categoryFilter="all"
            />
          </ErrorBoundary>
        </div>
      </div>
    </DashboardLayout>
  );
}