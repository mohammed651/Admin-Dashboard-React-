
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "Week 1",
    enrollments: 120,
  },
  {
    name: "Week 2",
    enrollments: 145,
  },
  {
    name: "Week 3",
    enrollments: 132,
  },
  {
    name: "Week 4",
    enrollments: 187,
  },
  {
    name: "Week 5",
    enrollments: 210,
  },
  {
    name: "Week 6",
    enrollments: 190,
  },
  {
    name: "Week 7",
    enrollments: 235,
  },
  {
    name: "Week 8",
    enrollments: 262,
  },
];

export default function EnrollmentChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Enrollment Trends</CardTitle>
        <CardDescription>Weekly course enrollment activity</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="enrollments"
              stroke="#0056D2"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
