import { Book, Users, TrendingUp, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import CourseTable from "@/components/dashboard/Course/CourseTable";
import RevenueChart from "@/components/dashboard/RevenueChart";
import EnrollmentChart from "@/components/dashboard/EnrollmentChart";
import { useDispatch, useSelector } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { fetchAllCourses } from "./../store/slices/courseSlice";
import { useEffect } from "react";
import { fetchUsers } from "@/store/slices/userSlice";
import { useAppDispatch } from "@/hooks/use-AppDispatch";

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
  const { courses = [] } = useSelector((state: any) => state.course);
  const { users } = useSelector((state: any) => state.user);
  const dispatch = useAppDispatch();
  console.log("Courses from Redux:", courses);
  console.log("User from Redux:", users);
  useEffect(() => {
    dispatch(fetchAllCourses());
    dispatch(fetchUsers());

  }, [dispatch]);

   const recentCourses = Array.isArray(courses) ? courses.slice(0, 5) : [];
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
            title="Active Enrollments"
            value="4,921"
            icon={<TrendingUp size={20} />}
            trend={{ value: 7, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value="$124,592"
            icon={<DollarSign size={20} />}
            trend={{ value: 21, isPositive: true }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-8">
          <RevenueChart />
          <EnrollmentChart />
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
