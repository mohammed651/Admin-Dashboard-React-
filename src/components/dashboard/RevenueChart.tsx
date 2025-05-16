
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  {
    name: "Jan",
    revenue: 4000,
  },
  {
    name: "Feb",
    revenue: 3000,
  },
  {
    name: "Mar",
    revenue: 5000,
  },
  {
    name: "Apr",
    revenue: 8000,
  },
  {
    name: "May",
    revenue: 6000,
  },
  {
    name: "Jun",
    revenue: 9500,
  },
  {
    name: "Jul",
    revenue: 11000,
  },
  {
    name: "Aug",
    revenue: 9800,
  },
  {
    name: "Sep",
    revenue: 12000,
  },
  {
    name: "Oct",
    revenue: 14000,
  },
  {
    name: "Nov",
    revenue: 16500,
  },
  {
    name: "Dec",
    revenue: 18000,
  },
];

export default function RevenueChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue breakdown for the current year</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
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
            <YAxis 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value) => [`$${value}`, "Revenue"]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="revenue" fill="#0056D2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
