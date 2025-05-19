import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { Course, MultilangText } from '@/types';

interface ViewsChartProps {
  courses: ReadonlyArray<Course>; // تحديد أن المصفوفة للقراءة فقط
}

const getDisplayName = (name: string | MultilangText): string => {
  if (typeof name === 'string') return name;
  return name.en || Object.values(name)[0] || 'Unnamed Course';
};

export default function ViewsChart({ courses }: ViewsChartProps) {
  const viewsData = useMemo(() => {
    return [...courses] // إنشاء نسخة قابلة للتعديل
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(course => ({
        name: getDisplayName(course.name).substring(0, 20) + 
              (getDisplayName(course.name).length > 20 ? '...' : ''),
        views: course.views || 0
      }));
  }, [courses]);

  return (
    <div className="col-span-4 p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium">Top Courses by Views</h3>
      <div className="h-80 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={viewsData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value} views`, "Views"]} />
            <Bar dataKey="views" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}