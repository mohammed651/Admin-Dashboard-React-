
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RevenueChart from "@/components/dashboard/RevenueChart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const revenueByPeriod = [
  {
    name: "Q1",
    revenue: 24000,
  },
  {
    name: "Q2",
    revenue: 35000,
  },
  {
    name: "Q3",
    revenue: 42000,
  },
  {
    name: "Q4",
    revenue: 52000,
  },
];

const revenueByCategoryData = [
  { name: "Development", value: 56000 },
  { name: "Business", value: 38000 },
  { name: "Design", value: 27000 },
  { name: "Marketing", value: 24000 },
  { name: "Data Science", value: 22000 },
];

const topCoursesData = [
  {
    id: 1,
    title: "Advanced Machine Learning",
    instructor: "Sarah Johnson",
    enrollments: 1203,
    revenue: 65450,
  },
  {
    id: 2,
    title: "Complete Web Development Bootcamp",
    instructor: "John Smith",
    enrollments: 1087,
    revenue: 52350,
  },
  {
    id: 3,
    title: "Financial Analysis Masterclass",
    instructor: "Michael Brown",
    enrollments: 934,
    revenue: 48500,
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    instructor: "Emily Chen",
    enrollments: 867,
    revenue: 38200,
  },
  {
    id: 5,
    title: "Python for Data Science",
    instructor: "David Wilson",
    enrollments: 756,
    revenue: 32700,
  },
];

const COLORS = ["#0056D2", "#2978E0", "#003C92", "#E6F0FC", "#6C757D"];

export default function Revenue() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
        
        <RevenueChart />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Revenue</CardTitle>
              <CardDescription>Revenue breakdown by quarter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueByPeriod}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0056D2" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Revenue distribution across course categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Generating Courses</CardTitle>
            <CardDescription>Courses ranked by total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead className="text-right">Enrollments</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCoursesData.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell className="text-right">{course.enrollments.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${course.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
