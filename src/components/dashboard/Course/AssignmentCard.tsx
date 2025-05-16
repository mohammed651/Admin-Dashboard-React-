import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/hooks/use-AppDispatch";
import { RootState } from "@/store/store";
import { getAssignment } from "@/store/slices/assignmentSlice";

interface Question {
  _id: string;
  content: string;
  options: string[];
  difficulty?: string;
  explanation?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number;
}

interface AssignmentDetailsProps {
  assignmentId: string;
}

function AssignmentDetails({ assignmentId }: AssignmentDetailsProps) {
  const dispatch = useAppDispatch();
  const [isMounted, setIsMounted] = useState(true);
  const { currentAssignment, loading, error } = useSelector(
    (state: RootState) => state.assignment
  );

  useEffect(() => {
    setIsMounted(true);
    
    const fetchAssignment = async () => {
      try {
        if (assignmentId && isMounted) {
          await dispatch(getAssignment(assignmentId)).unwrap();
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
      }
    };

    fetchAssignment();

    return () => {
      setIsMounted(false);
    };
  }, [dispatch, assignmentId, isMounted]);

  if (loading) return <div className="p-4">جاري التحميل...</div>;
  if (error) return <div className="p-4 text-red-600">حدث خطأ: {error.message || "Unknown error"}</div>;
  if (!currentAssignment) return <div className="p-4">لم يتم العثور على بيانات الاختبار.</div>;

  return (
    <div className="p-4 border rounded shadow-sm bg-white space-y-4">
      <h2 className="text-xl font-semibold">{currentAssignment.title}</h2>
      {currentAssignment.description && <p>{currentAssignment.description}</p>}
      <p><strong>مدة الاختبار:</strong> {currentAssignment.timeLimit} دقيقة</p>
      <p><strong>درجة النجاح:</strong> {currentAssignment.passingScore}%</p>

      {currentAssignment.questions?.length > 0 ? (
        <>
          <h3 className="text-lg font-medium mt-4">الأسئلة:</h3>
          <div className="space-y-3">
            {currentAssignment.questions.map((q, i) => (
              <div key={q._id || i} className="p-3 border rounded bg-gray-50">
                <p className="font-semibold">س{i + 1}: {q.content}</p>
                {q.options?.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {q.options.map((opt, j) => (
                      <li key={j}>{opt}</li>
                    ))}
                  </ul>
                )}
                {q.difficulty && (
                  <p className="text-xs text-gray-500 mt-1">الصعوبة: {q.difficulty}</p>
                )}
                {q.explanation && (
                  <p className="text-xs text-blue-600 mt-1">شرح: {q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500">لا توجد أسئلة متاحة</p>
      )}
    </div>
  );
}

export default AssignmentDetails;