import { User } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface SubscriptionsChartProps {
  users: User[];
}

export default function SubscriptionsChart({ users }: SubscriptionsChartProps) {
  const subscribedCount = users.filter(u => u.isSubscribed).length;
  const notSubscribedCount = users.length - subscribedCount;

  const data = [
    { name: 'Subscribed', value: subscribedCount },
    { name: 'Not Subscribed', value: notSubscribedCount }
  ];

  const COLORS = ['#0056D2', '#6C757D'];

  return (
    <div className="col-span-4 p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium">Users Subscription Status</h3>
      <div className="h-80 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}