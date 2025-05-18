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

  console.log("Current Assignment:", currentAssignment);
  console.log("Loading:", loading);
  console.log("Error:", error);
  console.log("Assignment ID:", assignmentId);
  
  if (loading) return <div className="p-4">جاري التحميل...</div>;
  if (error) return <div className="p-4 text-red-600">حدث خطأ: {error.message || "Unknown error"}</div>;
  if (!currentAssignment) return <div className="p-4">لم يتم العثور على بيانات الاختبار.</div>;

  return (
    <div className="p-4 border rounded shadow-sm bg-white space-y-4">
  <h2 className="text-xl font-semibold">{currentAssignment.data.title}</h2>
  {currentAssignment.data.description && <p>{currentAssignment.data.description}</p>}
  <p><strong>Time Limit:</strong> {currentAssignment.data.timeLimit} minutes</p>
  <p><strong>Passing Score:</strong> {currentAssignment.data.passingScore}%</p>

  {currentAssignment.data.questions?.length > 0 ? (
    <>
      <h3 className="text-lg font-medium mt-4">Questions:</h3>
      <div className="space-y-3">
        {currentAssignment.data.questions.map((q, i) => (
          <div key={q._id || i} className="p-3 border rounded bg-gray-50">
            <p className="font-semibold">Q{i + 1}: {q.content}</p>
            {q.options?.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                {q.options.map((opt, j) => (
                  <li key={j}>{opt}</li>
                ))}
              </ul>
            )}
            {q.difficulty && (
              <p className="text-xs text-gray-500 mt-1">Difficulty: {q.difficulty}</p>
            )}
            {q.explanation && (
              <p className="text-xs text-blue-600 mt-1">Explanation: {q.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </>
  ) : (
    <p className="text-gray-500">No questions available</p>
  )}
</div>
  );
}

export default AssignmentDetails;