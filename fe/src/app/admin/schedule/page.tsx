"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import DynamicNavbar from "@/components/DynamicNavbar";
import MagicBento from "@/components/MagicBento";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useGetUsersByRole } from "@/hooks/useGraphQL";
import { useExamScheduleManagement } from "@/hooks/useExamSchedule";
import { useGetStudentsByBatch } from "@/hooks/useStudents";
import { UserRole, ExamSchedule } from "@/gql/types";

// ───────────────────────────────────────────────────────────────
// Edit Exam Modal
// ───────────────────────────────────────────────────────────────
function EditExamModal({
  exam,
  isOpen,
  onClose,
  onSave,
  loading,
}: {
  exam: ExamSchedule;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { examId: string; venue?: string; examDate?: string; status?: string }) => void;
  loading: boolean;
}) {
  const [venue, setVenue] = useState(exam.venue);
  const [examDate, setExamDate] = useState(exam.examDate?.split("T")[0] || "");
  const [status, setStatus] = useState(exam.status);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-6">Edit Exam Schedule</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Exam Date</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
            >
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSave({
                  examId: exam._id,
                  venue,
                  examDate: examDate || undefined,
                  status,
                })
              }
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Status badge helper
// ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    IN_PROGRESS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
    CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  const style = styles[status] || styles.SCHEDULED;
  const label = status.replace("_", " ");

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}

// ───────────────────────────────────────────────────────────────
// Batch Students list
// ───────────────────────────────────────────────────────────────
function BatchStudents({ students, batchLabel }: { students: any[]; batchLabel: string }) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Students Found</h3>
        <p className="text-gray-400">No students found for batch {batchLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {students.map((student: any, index: number) => (
        <div
          key={student.walletAddress || index}
          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {student.name
                  ? student.name.charAt(0).toUpperCase()
                  : student.walletAddress?.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">
                {student.name || "Anonymous Student"}
              </p>
              <p className="text-gray-400 text-xs">
                {student.studentId ? `ID: ${student.studentId}` : "No Student ID"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${student.isActive ? "bg-green-400" : "bg-red-400"}`}></div>
            <span className="text-xs text-gray-400">
              {student.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Main Page
// ───────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const { user } = useAuth();

  // ── Batch state ──
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  // ── Form state ──
  const [examDetails, setExamDetails] = useState({
    examName: "",
    subject: "",
    examType: "MIDTERM",
    date: "",
    time: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    venue: "",
    academicYear: "",
    semester: "",
    description: "",
  });

  // ── Modal state ──
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // ── Data hooks ──
  // 1. Get all students to derive batch list
  const { data: studentsData, loading: studentsLoading, error: studentsError, refetch: refetchStudents } =
    useGetUsersByRole(UserRole.STUDENT);
  const allStudents = studentsData?.getUsersByRole || [];

  // 2. Get students by batch (proper API)
  const {
    data: batchStudentsData,
    loading: batchStudentsLoading,
  } = useGetStudentsByBatch(selectedBatch, { skip: !selectedBatch });

  // 3. Exam schedules CRUD
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useExamScheduleManagement();

  // ── Derive unique batches from studentId (first 4 chars, e.g. "23CS") ──
  const { batches, studentsByBatch } = useMemo(() => {
    const batchMap = new Map<string, any[]>();
    const batchSet = new Set<string>();

    allStudents.forEach((student) => {
      if (student.studentId && student.studentId.length >= 4) {
        const batch = student.studentId.slice(0, 4);
        batchSet.add(batch);

        if (!batchMap.has(batch)) {
          batchMap.set(batch, []);
        }
        batchMap.get(batch)?.push(student);
      }
    });

    const sortedBatches = Array.from(batchSet).sort((a, b) => b.localeCompare(a));
    return { batches: sortedBatches, studentsByBatch: batchMap };
  }, [allStudents]);

  // Use the backend batch students if available, otherwise fall back to client-side grouping
  const selectedStudents = selectedBatch
    ? batchStudentsData?.getStudentsByBatch || studentsByBatch.get(selectedBatch) || []
    : [];

  // ── Handlers ──
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleScheduleExam = async () => {
    if (
      !selectedBatch ||
      !examDetails.examName ||
      !examDetails.subject ||
      !examDetails.date ||
      !examDetails.venue ||
      !examDetails.totalMarks ||
      !examDetails.passingMarks
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const result = await createSchedule({
        variables: {
          input: {
            examName: examDetails.examName,
            subject: examDetails.subject,
            examType: examDetails.examType,
            examDate: examDetails.date,
            duration: parseInt(examDetails.duration) || 60,
            totalMarks: parseInt(examDetails.totalMarks),
            passingMarks: parseInt(examDetails.passingMarks),
            venue: examDetails.venue,
            teacherWalletAddress: user?.walletAddress || "",
            academicYear: examDetails.academicYear || new Date().getFullYear().toString(),
            semester: examDetails.semester || "1",
            batch: selectedBatch,
            description: examDetails.description || undefined,
          },
        },
      });

      if (result.data?.createExamSchedule) {
        showSuccess(`Exam "${examDetails.examName}" scheduled successfully!`);
        setExamDetails({
          examName: "",
          subject: "",
          examType: "MIDTERM",
          date: "",
          time: "",
          duration: "",
          totalMarks: "",
          passingMarks: "",
          venue: "",
          academicYear: "",
          semester: "",
          description: "",
        });
        refetchSchedules();
      }
    } catch (error: any) {
      alert(`Error scheduling exam: ${error.message}`);
    }
  };

  const handleUpdateExam = async (data: {
    examId: string;
    venue?: string;
    examDate?: string;
    status?: string;
  }) => {
    try {
      const result = await updateSchedule({
        variables: { input: data },
      });
      if (result.data?.updateExamSchedule) {
        showSuccess("Exam schedule updated successfully!");
        setEditingExam(null);
        refetchSchedules();
      }
    } catch (error: any) {
      alert(`Error updating exam: ${error.message}`);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      const result = await deleteSchedule({
        variables: { examId },
      });
      if (result.data?.deleteExamSchedule?.success) {
        showSuccess("Exam schedule deleted successfully!");
        setDeletingExamId(null);
        refetchSchedules();
      } else {
        alert(result.data?.deleteExamSchedule?.message || "Failed to delete");
      }
    } catch (error: any) {
      alert(`Error deleting exam: ${error.message}`);
    }
  };

  // ── Loading / Error states ──
  if (studentsLoading && schedulesLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: "#0b0b12" }}>
          <DynamicNavbar />
          <div className="p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-300">Loading data...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (studentsError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: "#0b0b12" }}>
          <DynamicNavbar />
          <div className="p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Error Loading Data</h3>
              <p className="text-gray-300 mb-4">{studentsError.message}</p>
              <button
                onClick={() => refetchStudents()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: "#0b0b12" }}>
        <DynamicNavbar />

        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Page Header */}
        <div className="p-6 pb-2">
          <h1 className="text-3xl font-bold text-white mb-2">Schedule Examination</h1>
          <p className="text-gray-400">
            Schedule exams for specific batches and manage exam schedules
          </p>
        </div>

        {/* ── Top 3-Column Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pt-4">
          {/* ─── Column 1: Batch Selection ─── */}
          <div
            className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl"
            style={{ backgroundColor: "#12121a" }}
          >
            <MagicBento
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={8}
              glowColor="180, 180, 200"
              cards={[
                {
                  color: "transparent",
                  title: "Select Batch",
                  description: "Choose student batch for exam",
                  label: "Batch",
                  children: (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Available Batches</h3>
                      <div className="space-y-3">
                        {batches.length === 0 ? (
                          <p className="text-gray-400 text-center py-4">No batches found</p>
                        ) : (
                          batches.map((batch) => (
                            <button
                              key={batch}
                              onClick={() => setSelectedBatch(batch)}
                              className={`w-full p-3 rounded-lg text-left transition-colors ${selectedBatch === batch
                                ? "bg-blue-600 text-white"
                                : "bg-white/5 hover:bg-white/10 text-gray-300"
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Batch {batch}</span>
                                <span className="text-sm opacity-75">
                                  {studentsByBatch.get(batch)?.length || 0} students
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* ─── Column 2: Exam Details Form ─── */}
          <div
            className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl"
            style={{ backgroundColor: "#12121a" }}
          >
            <MagicBento
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={8}
              glowColor="180, 180, 200"
              cards={[
                {
                  color: "transparent",
                  title: "Exam Details",
                  description: "Configure exam settings",
                  label: "Details",
                  children: (
                    <div className="p-6 space-y-3">
                      {/* Exam Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Exam Name *</label>
                        <input
                          type="text"
                          value={examDetails.examName}
                          onChange={(e) => setExamDetails({ ...examDetails, examName: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                          placeholder="e.g., Mid-term Examination"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
                        <input
                          type="text"
                          value={examDetails.subject}
                          onChange={(e) => setExamDetails({ ...examDetails, subject: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                          placeholder="e.g., Blockchain Technology"
                        />
                      </div>

                      {/* Exam Type + Venue */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Exam Type *</label>
                          <select
                            value={examDetails.examType}
                            onChange={(e) => setExamDetails({ ...examDetails, examType: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                          >
                            <option value="MIDTERM">Mid-term</option>
                            <option value="ENDTERM">End-term</option>
                            <option value="QUIZ">Quiz</option>
                            <option value="ASSIGNMENT">Assignment</option>
                            <option value="PRACTICAL">Practical</option>
                            <option value="VIVA">Viva</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Venue *</label>
                          <input
                            type="text"
                            value={examDetails.venue}
                            onChange={(e) => setExamDetails({ ...examDetails, venue: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                            placeholder="e.g., Hall-A"
                          />
                        </div>
                      </div>

                      {/* Date + Duration */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Date *</label>
                          <input
                            type="date"
                            value={examDetails.date}
                            onChange={(e) => setExamDetails({ ...examDetails, date: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Duration (min)</label>
                          <input
                            type="number"
                            value={examDetails.duration}
                            onChange={(e) => setExamDetails({ ...examDetails, duration: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                            placeholder="120"
                          />
                        </div>
                      </div>

                      {/* Total Marks + Passing Marks */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Total Marks *</label>
                          <input
                            type="number"
                            value={examDetails.totalMarks}
                            onChange={(e) => setExamDetails({ ...examDetails, totalMarks: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Passing Marks *</label>
                          <input
                            type="number"
                            value={examDetails.passingMarks}
                            onChange={(e) => setExamDetails({ ...examDetails, passingMarks: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                            placeholder="40"
                          />
                        </div>
                      </div>

                      {/* Academic Year + Semester */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Academic Year</label>
                          <input
                            type="text"
                            value={examDetails.academicYear}
                            onChange={(e) => setExamDetails({ ...examDetails, academicYear: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                            placeholder="2025-26"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">Semester</label>
                          <select
                            value={examDetails.semester}
                            onChange={(e) => setExamDetails({ ...examDetails, semester: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                          >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <option key={s} value={s.toString()}>
                                Semester {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                          value={examDetails.description}
                          onChange={(e) => setExamDetails({ ...examDetails, description: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-400 focus:outline-none"
                          rows={2}
                          placeholder="Special instructions..."
                        />
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleScheduleExam}
                        disabled={
                          !selectedBatch ||
                          !examDetails.examName ||
                          !examDetails.subject ||
                          !examDetails.date ||
                          !examDetails.venue ||
                          !examDetails.totalMarks ||
                          !examDetails.passingMarks
                        }
                        className="w-full px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-white font-medium"
                      >
                        Schedule Exam
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* ─── Column 3: Selected Students ─── */}
          <div
            className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl"
            style={{ backgroundColor: "#12121a" }}
          >
            <MagicBento
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={8}
              glowColor="180, 180, 200"
              cards={[
                {
                  color: "transparent",
                  title: selectedBatch ? `Batch ${selectedBatch} Students` : "Select Batch",
                  description: selectedBatch
                    ? `${selectedStudents.length} students`
                    : "Choose a batch to view students",
                  label: "Students",
                  children: (
                    <div className="p-6">
                      {selectedBatch ? (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">
                              Students in Batch {selectedBatch}
                            </h3>
                            <span className="text-blue-400 font-medium">
                              {batchStudentsLoading ? (
                                <span className="animate-pulse">Loading...</span>
                              ) : (
                                `${selectedStudents.length} students`
                              )}
                            </span>
                          </div>
                          {batchStudentsLoading ? (
                            <div className="flex justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                            </div>
                          ) : (
                            <BatchStudents students={selectedStudents} batchLabel={selectedBatch} />
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-4">
                            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-gray-400">Select a batch to view students</p>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>

        {/* ── Scheduled Exams Section ── */}
        <div className="px-6 pb-8">
          <div
            className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6"
            style={{ backgroundColor: "#12121a" }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Scheduled Exams</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {schedules.length} exam{schedules.length !== 1 ? "s" : ""} scheduled
                </p>
              </div>
              <button
                onClick={() => refetchSchedules()}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-gray-300 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {schedulesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
              </div>
            ) : schedulesError ? (
              <div className="text-center py-12 text-red-400">
                Error loading schedules: {schedulesError.message}
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-lg">No exams scheduled yet</p>
                <p className="text-gray-500 text-sm mt-1">Use the form above to create your first exam schedule</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Exam Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Subject</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Venue</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Batch</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Marks</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((exam) => (
                      <tr
                        key={exam._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">{exam.examName}</td>
                        <td className="py-3 px-4 text-gray-300">{exam.subject}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{exam.examType || "—"}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {exam.examDate
                            ? new Date(exam.examDate).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                            : "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{exam.venue || "—"}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">{exam.batch || "—"}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {exam.totalMarks ? `${exam.passingMarks}/${exam.totalMarks}` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={exam.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingExam(exam)}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeletingExamId(exam._id)}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Edit Modal ── */}
        {editingExam && (
          <EditExamModal
            exam={editingExam}
            isOpen={true}
            onClose={() => setEditingExam(null)}
            onSave={handleUpdateExam}
            loading={false}
          />
        )}

        {/* ── Delete Confirmation Modal ── */}
        {deletingExamId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-sm shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">Delete Exam Schedule</h3>
                <p className="text-gray-400 text-sm mt-2">
                  Are you sure? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingExamId(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteExam(deletingExamId)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
