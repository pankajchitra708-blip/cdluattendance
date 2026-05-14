import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../lib/auth";
import { db, Course, User, AttendanceRecord, AttendanceSession } from "../lib/db";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, BookOpen, CheckCircle, Plus, Calendar as CalendarIcon, 
  ChevronRight, Save, X, Search, FileText, Clock, BarChart as BarChartIcon,
  Settings, User as UserIcon, Copy, Check, LogOut, Eye, EyeOff, Lock, RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from "recharts";

const getAttendanceRecordTime = (record: AttendanceRecord) => {
  const rawTime = record.updatedAt || record.createdAt || "";
  const time = rawTime ? new Date(rawTime).getTime() : 0;
  return Number.isFinite(time) ? time : 0;
};

const isNewerAttendanceRecord = (candidate: AttendanceRecord, current?: AttendanceRecord) => {
  if (!current) return true;

  const candidateTime = getAttendanceRecordTime(candidate);
  const currentTime = getAttendanceRecordTime(current);
  if (candidateTime !== currentTime) return candidateTime > currentTime;

  return candidate.id.localeCompare(current.id) > 0;
};

type ReportSession = Pick<AttendanceSession, "id" | "date"> & Partial<AttendanceSession>;

export default function TeacherDashboard() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "courses" | "attendance" | "records" | "profile">("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attendanceEditTarget, setAttendanceEditTarget] = useState<{ courseId: string; date: string } | null>(null);

  if (!user || user.role !== "teacher") return null;

  return (
    <div className="flex flex-col md:flex-row gap-0 md:gap-6 min-h-screen bg-slate-50 dark:bg-[#0f172a] overflow-x-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <img src="https://i.ibb.co/PZjRr6jy/cdlu-logo.webp" alt="CDLU" className="w-5 h-5 object-contain brightness-0 invert" />
          </div>
          <span className="font-black text-slate-900 dark:text-white tracking-tight">Teacher Hub</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          <Users className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Drawer for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] w-72 bg-white dark:bg-[#0f172a] p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <img src="https://i.ibb.co/PZjRr6jy/cdlu-logo.webp" alt="CDLU" className="w-5 h-5 object-contain brightness-0 invert" />
                  </div>
                  <span className="font-black text-slate-900 dark:text-white tracking-tight">CDLU Hub</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-300 dark:bg-slate-800 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <SidebarBtn icon={<BarChartIcon />} label="Analytics" active={activeTab === "overview"} onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }} />
                <SidebarBtn icon={<BookOpen />} label="My Courses" active={activeTab === "courses"} onClick={() => { setActiveTab("courses"); setIsSidebarOpen(false); }} />
                <SidebarBtn icon={<CheckCircle />} label="Mark Attendance" active={activeTab === "attendance"} onClick={() => { setActiveTab("attendance"); setIsSidebarOpen(false); }} />
                <SidebarBtn icon={<FileText />} label="View Records" active={activeTab === "records"} onClick={() => { setActiveTab("records"); setIsSidebarOpen(false); }} />
                <SidebarBtn icon={<Settings />} label="My Profile" active={activeTab === "profile"} onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }} />
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">{user.name.charAt(0)}</div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Teacher Account</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:gap-2 md:w-64 lg:w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/10 p-6 h-screen sticky top-0 shadow-none">
        {/* ... */}
        {/* Brand Area */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <img src="https://i.ibb.co/PZjRr6jy/cdlu-logo.webp" alt="CDLU" className="w-7 h-7 object-contain brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">CDLU</h1>
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">Teacher Hub</p>
          </div>
        </div>

        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/5 px-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#1e293b] flex items-center justify-center text-xl font-black text-blue-600 border-2 border-white dark:border-slate-700 shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated as</p>
              <p className="text-sm font-black text-slate-900 dark:text-white truncate tracking-tight">{user.name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full">
          <SidebarBtn icon={<BarChartIcon />} label="Analytics" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
          <SidebarBtn icon={<BookOpen />} label="My Courses" active={activeTab === "courses"} onClick={() => setActiveTab("courses")} />
          <SidebarBtn icon={<CheckCircle />} label="Mark Attendance" active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} />
          <SidebarBtn icon={<FileText />} label="View Records" active={activeTab === "records"} onClick={() => setActiveTab("records")} />
          <SidebarBtn icon={<Settings />} label="My Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
          
          <button 
            onClick={() => { if(window.confirm("Logout?")) { useAuth().logout(); window.location.href = "/"; } }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold mt-4"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10">
              <LogOut className="w-4.5 h-4.5" />
            </div>
            <span>Logout Account</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-auto px-2">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">System Status</p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live & Syncing</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 p-2 rounded-2xl shadow-2xl flex justify-around items-center">
        <SidebarBtn icon={<BarChartIcon />} label="Analytics" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <SidebarBtn icon={<BookOpen />} label="Courses" active={activeTab === "courses"} onClick={() => setActiveTab("courses")} />
        <SidebarBtn icon={<CheckCircle />} label="Attend" active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} />
        <SidebarBtn icon={<FileText />} label="Records" active={activeTab === "records"} onClick={() => setActiveTab("records")} />
        <SidebarBtn icon={<Settings />} label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
      </nav>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 md:pb-8 flex flex-col max-w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "overview" && <OverviewTab key="overview" teacherId={user.id} />}
          {activeTab === "courses" && <CoursesTab key="courses" teacherId={user.id} />}
          {activeTab === "attendance" && <AttendanceTab key="attendance" teacherId={user.id} editTarget={attendanceEditTarget} onEditTargetConsumed={() => setAttendanceEditTarget(null)} />}
          {activeTab === "records" && <AttendanceRecordsTab key="records" teacherId={user.id} onEditSession={(courseId, date) => { setAttendanceEditTarget({ courseId, date }); setActiveTab("attendance"); }} />}
          {activeTab === "profile" && <ProfileTab key="profile" user={user} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// -- Components --

function SidebarBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full flex md:flex-row flex-col items-center justify-center md:justify-start gap-1 md:gap-3 p-1.5 md:px-4 md:py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${
        active 
          ? "bg-blue-600 text-slate-900 dark:text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] md:translate-x-1" 
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      <div className={`flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-xl transition-all duration-300 ${active ? "bg-white/20" : "bg-slate-100 dark:bg-[#1e293b] group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm"}`}>
        <span className={`[&>svg]:w-3.5 [&>svg]:h-3.5 md:[&>svg]:w-4.5 md:[&>svg]:h-4.5 ${active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600"}`}>{icon}</span>
      </div>
      <span className="text-[8px] md:text-sm font-black tracking-tight uppercase md:normal-case">{label}</span>
      {active && <motion.div layoutId="nav-active" className="hidden md:block absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full" />}
    </button>
  );
}

// ---------------- OVERVIEW TAB ----------------

function OverviewTab({ teacherId }: { teacherId: string; key?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [allStudents, setAllStudents] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const teacherCourses = await db.getCoursesByTeacher(teacherId);
        setCourses(teacherCourses);
        
        // This is a bit inefficient but matches current logic
        const studentIds = new Set<string>();
        for (const c of teacherCourses) {
          const students = await db.getStudentsByCourse(c.id);
          students.forEach(s => studentIds.add(s.id));
        }
        setAllStudents(studentIds.size);

        // Fetching attendance records for all teacher's courses
        // A better API endpoint would be helpful, but using existing ones:
        // Actually, we'll need a way to get attendance for all courses at once.
        // For now, let's keep it simple or implement a new API.
        // Browser storage keeps attendance indexed by student and course.
        const allRecords: AttendanceRecord[] = [];
        for (const c of teacherCourses) {
          const records = await db.getAttendanceByCourseAndDate(c.id, ""); // "" as date to get all for course
          allRecords.push(...records);
        }
        setAttendanceRecords(allRecords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [teacherId]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">Loading Overview...</div>;

  // Data for Charts
  const totalPresent = attendanceRecords.filter(a => a.status === 'P').length;
  const totalAbsent = attendanceRecords.filter(a => a.status === 'A').length;
  const totalLeave = attendanceRecords.filter(a => a.status === 'L').length;
  const pieData = [
    { name: 'Present', value: totalPresent, color: '#10b981' },
    { name: 'Absent', value: totalAbsent, color: '#f43f5e' },
    { name: 'Leave', value: totalLeave, color: '#f59e0b' },
  ];

  const courseStats = courses.map(course => {
    const records = attendanceRecords.filter(a => a.courseId === course.id);
    const present = records.filter(a => a.status === 'P').length;
    return {
      name: course.name, // Use full name for chart but truncate in display if needed
      Present: present,
      Total: records.length,
      id: course.id // Unique ID for recharts
    };
  });

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 overflow-y-auto pr-2 pb-10">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Main <span className="text-blue-600">Overview</span></h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-lg shadow-blue-500/20">
          <BookOpen className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-black">{courses.length}</p>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Courses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
           <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Attendance Mix</h3>
           <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------- COURSES TAB ----------------
function CoursesTab({ teacherId }: { teacherId: string; key?: string }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", semester: "", year: new Date().getFullYear().toString(), section: "" });
  const [managingCourseId, setManagingCourseId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [enrolledStudents, setEnrolledStudents] = useState<User[]>([]);
  const [newStudent, setNewStudent] = useState({ rollNumber: "", name: "" });
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    setLoading(true);
    const teacherCourses = await db.getCoursesByTeacher(teacherId);
    setCourses(teacherCourses);
    setLoading(false);
  };

  const loadEnrolledStudents = async (courseId: string) => {
    setLoading(true);
    const students = await db.getStudentsByCourse(courseId);
    setEnrolledStudents(students);
    setLoading(false);
  };

  useEffect(() => {
    loadCourses();
  }, [teacherId]);

  useEffect(() => {
    if (managingCourseId) {
      loadEnrolledStudents(managingCourseId);
    }
  }, [managingCourseId]);

  const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourseId) {
      await db.updateCourse(editingCourseId, newCourse);
    } else {
      const created = await db.createCourse({ ...newCourse, teacherId });
      setManagingCourseId(created.id);
    }
    await loadCourses();
    setIsCreating(false);
    setEditingCourseId(null);
    setNewCourse({ name: "", semester: "", year: new Date().getFullYear().toString(), section: "" });
  };

  const handleEditCourseClick = (course: Course) => {
    setEditingCourseId(course.id);
    setIsCreating(true);
    setNewCourse({ name: course.name, semester: course.semester, year: course.year, section: course.section });
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course? All associated data will be removed.")) {
      await db.deleteCourse(courseId);
      await loadCourses();
    }
  };

  const handleCancelCourseForm = () => {
    setIsCreating(false);
    setEditingCourseId(null);
    setNewCourse({ name: "", semester: "", year: new Date().getFullYear().toString(), section: "" });
  };

  const handleAddOrUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingCourseId) return;

    try {
      if (editingStudentId) {
        await db.updateUser(editingStudentId, { name: newStudent.name, rollNumber: newStudent.rollNumber });
        setEditingStudentId(null);
      } else {
        // Check if student already exists by roll number
        let s = await db.getUserByRollNumber(newStudent.rollNumber);
        
        if (!s) {
          // Create new student if not exists
          s = await db.createUser({
            role: "student",
            name: newStudent.name,
            rollNumber: newStudent.rollNumber,
            password: "password123"
          });
        }
        
        // Enroll student in course
        await db.enrollStudent(managingCourseId, s.id);
      }
      setNewStudent({ rollNumber: "", name: "" }); // reset
      await loadEnrolledStudents(managingCourseId);
    } catch (err: any) {
      alert(err.message || "Failed to add student. They might already be enrolled.");
    }
  };

  const handleEditClick = (student: User) => {
    setEditingStudentId(student.id);
    setNewStudent({ rollNumber: student.rollNumber || "", name: student.name });
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setNewStudent({ rollNumber: "", name: "" });
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (managingCourseId) {
      if(window.confirm("Are you sure you want to remove this student from the course?")) {
        await db.unenrollStudent(managingCourseId, studentId);
        await loadEnrolledStudents(managingCourseId);
      }
    }
  };

  if (managingCourseId) {
    const course = courses.find(c => c.id === managingCourseId);
    if (!course) return null;

    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setManagingCourseId(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white flex items-center gap-1 mb-2 text-sm font-medium transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to Courses
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage "{course.name}"</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add or edit students using their Roll Number.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <form onSubmit={handleAddOrUpdateStudent} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 relative">
              {editingStudentId && (
                <button type="button" onClick={handleCancelEdit} className="absolute right-4 top-4 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:text-white dark:hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{editingStudentId ? "Update Student" : "Add Student"}</h3>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Roll Number</label>
                <input 
                  required 
                  type="text" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newStudent.rollNumber} 
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setNewStudent({...newStudent, rollNumber: val});
                  }} 
                  className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                  placeholder="e.g. 1001" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Full Name</label>
                <input 
                  required 
                  type="text" 
                  maxLength={50}
                  value={newStudent.name} 
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})} 
                  className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" 
                  placeholder="Student Name" 
                />
              </div>
              <button type="submit" className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${editingStudentId ? 'bg-amber-600 text-slate-900 dark:text-white shadow-lg shadow-amber-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}>
                {editingStudentId ? "Update Details" : "Enrol Student"}
              </button>
            </form>
          </div>
          
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
               <div className="p-4 border-b border-black/5 dark:border-white/10">
                 <h3 className="font-semibold text-slate-900 dark:text-white">Enrolled Students ({enrolledStudents.length})</h3>
               </div>
               <div className="max-h-[300px] overflow-y-auto">
                 {enrolledStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">No students added yet.</div>
                 ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs">
                          <th className="px-4 py-3 font-bold uppercase tracking-wider">Roll No</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider">Name</th>
                          <th className="px-4 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrolledStudents.map(student => (
                          <tr key={student.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 dark:bg-white/5 transition-colors">
                            <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{student.rollNumber}</td>
                            <td className="px-4 py-3 text-slate-900 dark:text-white">{student.name}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => handleEditClick(student)} className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors mr-2">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteStudent(student.id)} className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 )}
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Courses</h2>
        <button onClick={() => { setIsCreating(!isCreating); if(editingCourseId) handleCancelCourseForm(); }} className="flex items-center gap-2 bg-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors">
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isCreating ? "Cancel" : "New Course"}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateOrUpdateCourse} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 relative shadow-sm">
          <h3 className="sm:col-span-2 font-bold text-slate-900 dark:text-white text-lg">{editingCourseId ? "Update Course" : "Create New Course"}</h3>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Course Name</label>
            <input required type="text" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="e.g. MCA, B.Tech" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Semester</label>
            <input required type="text" value={newCourse.semester} onChange={e => setNewCourse({...newCourse, semester: e.target.value})} className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="e.g. 3rd" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Year</label>
            <input required type="text" value={newCourse.year} onChange={e => setNewCourse({...newCourse, year: e.target.value})} className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder={new Date().getFullYear().toString()} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">Subject / Section</label>
            <input required type="text" value={newCourse.section} onChange={e => setNewCourse({...newCourse, section: e.target.value})} className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-lg p-2.5 text-slate-900 dark:text-white outline-none focus:border-blue-500" placeholder="e.g. Data Structures" />
          </div>
          <div className="sm:col-span-2 mt-4 flex gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 py-3 px-8 rounded-xl text-sm text-white font-bold transition-all shadow-lg shadow-blue-500/25">
              {editingCourseId ? "Update Course" : "Save Course"}
            </button>
            <button type="button" onClick={handleCancelCourseForm} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 py-3 px-8 rounded-xl text-sm text-slate-700 dark:text-slate-200 font-bold transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-5 rounded-xl hover:shadow-md transition-all group cursor-default relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => handleEditCourseClick(course)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                Edit
              </button>
              <button onClick={() => handleDeleteCourse(course.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                Delete
              </button>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 pr-16">{course.name}</h3>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>Semester: <span className="text-slate-900 dark:text-slate-200 font-medium">{course.semester}</span></p>
              <p>Year: <span className="text-slate-900 dark:text-slate-200 font-medium">{course.year}</span></p>
              <p>Subject: <span className="text-slate-900 dark:text-slate-200 font-medium">{course.section}</span></p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Synced Records</span>
              <button onClick={() => setManagingCourseId(course.id)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1 hover:underline cursor-pointer">Manage <ChevronRight className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
        {courses.length === 0 && !isCreating && <p className="text-slate-500 mt-4">No courses created yet.</p>}
      </div>
    </motion.div>
  );
}

// ---------------- ATTENDANCE TAB ----------------
function AttendanceTab({ teacherId, editTarget, onEditTargetConsumed }: { teacherId: string; key?: string; editTarget?: { courseId: string; date: string } | null; onEditTargetConsumed?: () => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "P" | "A" | "L" | null>>({});
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showPreview) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showPreview]);

  useEffect(() => {
    async function loadInitialData() {
      const teacherCourses = await db.getCoursesByTeacher(teacherId);
      setCourses(teacherCourses);
      setLoading(false);
    }
    loadInitialData();
  }, [teacherId]);

  useEffect(() => {
    if (editTarget) {
      setSelectedCourseId(editTarget.courseId);
      setDate(editTarget.date);
      onEditTargetConsumed?.();
    }
  }, [editTarget, onEditTargetConsumed]);

  useEffect(() => {
    async function loadAttendance() {
      if (selectedCourseId) {
        setLoading(true);
        // Load current student list
        const courseStudents = await db.getStudentsByCourse(selectedCourseId);
        setStudents(courseStudents);
        
        // Load existing records for this specific date
        // Note: The API for getAttendanceByCourseAndDate also needs to be async.
        const existing = await db.getAttendanceByCourseAndDate(selectedCourseId, date);
        const attMap: Record<string, "P" | "A" | "L" | null> = {};
        
        courseStudents.forEach(s => {
          const record = existing.find(r => r.studentId === s.id);
          attMap[s.id] = record ? record.status : null; 
        });

        // Load session metadata if exists - we'll just check if attendance exists for now
        // A dedicated sessions API would be better, but we'll stick to the current logic.
        // For simplicity, session data logic is omitted or needs dedicated fetching if we want exact parity.
        
        setAttendance(attMap);
        setIsSaved(false);
        setLoading(false);
      } else {
        setStudents([]);
        setAttendance({});
      }
    }
    loadAttendance();
  }, [selectedCourseId, date]);

  const mark = (studentId: string, status: "P" | "A" | "L") => {
    setAttendance(prev => ({ 
      ...prev, 
      [studentId]: prev[studentId] === status ? null : status 
    }));
    setIsSaved(false);
  };

  const markFilteredStudents = (status: "P" | "A" | "L") => {
    const newAtt = { ...attendance };
    filteredStudents.forEach(s => { newAtt[s.id] = status; });
    setAttendance(newAtt);
    setIsSaved(false);
  };

  const resetFilteredStudents = () => {
    const newAtt = { ...attendance };
    filteredStudents.forEach(s => { newAtt[s.id] = null; });
    setAttendance(newAtt);
    setIsSaved(false);
  };

  const handleSave = async () => {
    if (!selectedCourseId) return;

    // Check if any student is still unmarked
    const unmarkedCount = students.filter(s => !attendance[s.id]).length;
    if (unmarkedCount > 0) {
      if (!window.confirm(`${unmarkedCount} students are not marked. Do you want to continue? Unmarked students will not be recorded.`)) {
        return;
      }
    }

    const studentStatus = students
      .filter(s => attendance[s.id]) // Only save those who have a status
      .map(s => ({
        studentId: s.id,
        status: attendance[s.id] as "P" | "A" | "L"
      }));

    if (studentStatus.length === 0) {
      alert("Please mark at least one student.");
      return;
    }

    const existingForDate = await db.getAttendanceByCourseAndDate(selectedCourseId, date);
    const allowUpdate = existingForDate.length > 0;
    if (allowUpdate && !window.confirm("Attendance Already Exists, Update Record?")) {
      return;
    }

    try {
      await db.markAttendance(
        selectedCourseId, 
        teacherId, 
        date, 
        studentStatus, 
        { startTime, endTime, roomNo },
        allowUpdate
      );
    } catch (err: any) {
      if (err.message?.includes("Attendance Already Exists")) {
        alert("Attendance Already Exists, Update Record?");
        return;
      }
      throw err;
    }
    setIsSaved(true);
    window.dispatchEvent(new CustomEvent("attendance-updated", { detail: { courseId: selectedCourseId } }));
    // Keep modal open for a moment to show success, then close
    setTimeout(() => {
      setShowPreview(false);
      setIsSaved(false);
    }, 1500);
  };

  const calculateStats = () => {
    const presentList = students.filter(s => attendance[s.id] === 'P').map(s => s.rollNumber).filter(Boolean);
    const absentList = students.filter(s => attendance[s.id] === 'A').map(s => s.rollNumber).filter(Boolean);
    const leaveList = students.filter(s => attendance[s.id] === 'L').map(s => s.rollNumber).filter(Boolean);
    
    return { 
      present: presentList.length, 
      absent: absentList.length, 
      leave: leaveList.length, 
      total: students.length,
      presentRolls: presentList.join(", "),
      absentRolls: absentList.join(", "),
      leaveRolls: leaveList.join(", ")
    };
  };

  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(':');
      if (!hours || !minutes) return timeStr;
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const handleCopySummary = () => {
    const stats = calculateStats();
    const formattedStart = formatTime12h(startTime);
    const formattedEnd = formatTime12h(endTime);
    const timeDisplay = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : (formattedStart || formattedEnd || "");
    const summaryText = `Date: ${format(new Date(date), "dd MMM yyyy, eeee")}\n${timeDisplay ? `Time: ${timeDisplay}\n` : ""}${roomNo ? `Room: ${roomNo}\n` : ""}\nPresent (${stats.present}): ${stats.presentRolls || "None"}\nAbsent (${stats.absent}): ${stats.absentRolls || "None"}\n${stats.leave > 0 ? `Leave (${stats.leave}): ${stats.leaveRolls}` : ""}\n\nGenerated via CDLU Hub`;

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // Fallback for older browsers or restricted environments
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          document.body.removeChild(textArea);
          return true;
        } catch (copyErr) {
          document.body.removeChild(textArea);
          return false;
        }
      }
    };

    copyToClipboard(summaryText).then((success) => {
      if (success) {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
      }
    });
  };

  const openAttendanceSummary = () => {
    if (students.length === 0) {
      alert("No students available for attendance summary.");
      return;
    }
    setShowPreview(true);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.rollNumber && s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!selectedCourseId) {
    return (
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select Subject for Attendance</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <button 
              key={`attendance-course-${course.id}`} 
              onClick={() => setSelectedCourseId(course.id)} 
              className="text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-5 rounded-2xl hover:shadow-lg transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.name}</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p>Semester: <span className="text-slate-900 dark:text-slate-200 font-medium">{course.semester}</span></p>
                <p>Subject: <span className="text-slate-900 dark:text-slate-200 font-medium">{course.section}</span></p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Active Subject</span>
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">Mark <ChevronRight className="w-3 h-3" /></span>
              </div>
            </button>
          ))}
          {courses.length === 0 && <p className="text-slate-500 mt-4 sm:col-span-2">No courses available. Create one to mark attendance.</p>}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 w-full h-full flex flex-col -m-4 sm:-m-6 relative">
      {/* Top Header Section */}
      <div className="bg-slate-50 dark:bg-[#1e293b]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 p-4 sm:p-6 sticky top-0 z-20">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setSelectedCourseId(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-full hover:bg-black/5 dark:bg-white/10 dark:hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">{selectedCourse?.name}</h2>
        </div>
        
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 sm:gap-4 text-sm mb-4">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-white/5">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Semester</p>
            <p className="text-slate-900 dark:text-white font-bold">{selectedCourse?.semester}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 border border-emerald-100 dark:border-emerald-500/20">
            <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Marked</p>
            <p className="text-emerald-700 dark:text-emerald-300 font-bold tabular-nums">
              {students.filter(s => attendance[s.id]).length} / {students.length}
            </p>
          </div>
          <div className="col-span-1 md:col-auto bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-white/5">
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Date</p>
              <div className="relative">
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white font-bold outline-none cursor-pointer w-full text-sm sm:text-base"
                />
              </div>
          </div>
          <div className="col-span-1 md:col-auto bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-white/5 flex flex-col justify-center">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 leading-none">Start Time</p>
              <input 
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-bold outline-none w-full text-sm sm:text-base cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
          </div>
          <div className="col-span-1 md:col-auto bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-white/5 flex flex-col justify-center">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 leading-none">End Time</p>
              <input 
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-bold outline-none w-full text-sm sm:text-base cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
              />
          </div>
          <div className="col-span-1 md:col-auto bg-slate-100 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-white/5 flex flex-col justify-center">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1 leading-none">Room No</p>
              <input 
                type="text"
                placeholder="Room / Lab"
                value={roomNo}
                onChange={e => setRoomNo(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-bold outline-none w-full text-sm sm:text-base"
              />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search student..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              type="button"
              onClick={resetFilteredStudents}
              className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 bg-slate-200 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 transition-all active:scale-95 shadow-lg shadow-slate-500/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button 
              onClick={() => markFilteredStudents("P")}
              className="px-4 sm:px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-500 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Mark All Present
            </button>
            <button 
              onClick={() => markFilteredStudents("A")}
              className="px-4 sm:px-5 py-2 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-500 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-28 sm:p-6 sm:pb-6">
        {students.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            No students enrolled. Go to "Courses" to manage enrollments.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-8 text-center text-slate-500">No students found matching your search.</div>
        ) : (
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3 sm:px-4 rounded-xl shadow-sm hover:bg-slate-50 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center font-bold text-blue-600 border border-slate-200 dark:from-blue-500/20 dark:to-purple-500/20 dark:text-blue-300 dark:border-white/5 shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <h4 className="text-slate-950 dark:text-white font-bold text-sm sm:text-base leading-tight">{student.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] sm:text-xs">{student.rollNumber || "No Roll"}</p>
                      {!attendance[student.id] && (
                        <span className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-white/5 animate-pulse">Unmarked</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-1.5 justify-between sm:justify-end w-full sm:w-auto">
                  <button 
                    onClick={() => mark(student.id, "P")} 
                    className={`flex-1 sm:flex-none h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${
                      attendance[student.id] === 'P' 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-500/50' 
                      : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >P</button>
                  <button 
                    onClick={() => mark(student.id, "A")} 
                    className={`flex-1 sm:flex-none h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${
                      attendance[student.id] === 'A' 
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/40 ring-2 ring-rose-500/50' 
                      : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >A</button>
                  <button 
                    onClick={() => mark(student.id, "L")} 
                    className={`flex-1 sm:flex-none h-9 sm:h-10 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 active:scale-95 ${
                      attendance[student.id] === 'L' 
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40 ring-2 ring-amber-500/50' 
                      : 'bg-slate-100 text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:bg-slate-800/50 dark:text-slate-400'
                    }`}
                  >L</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action / Save Button */}
      {students.length > 0 && (
        <div className="sticky bottom-0 z-30 mt-auto shrink-0 border-t border-slate-200 bg-slate-50/95 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]/95">
          <button 
            type="button"
            onClick={openAttendanceSummary} 
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl sm:rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            Review & Submit Attendance
          </button>
        </div>
      )}

      {/* Summary Preview Overlay */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreview(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mt-3 flex h-[calc(100dvh-4rem)] w-full max-w-lg flex-col overflow-hidden rounded-[36px] border border-black/10 bg-[#fdfaf1] shadow-2xl sm:mt-4 sm:h-[min(720px,calc(100dvh-5rem))] sm:rounded-[40px] dark:border-white/20 dark:bg-[#0f172a]"
            >
              {/* Sticky Header inside Modal */}
              <div className="flex shrink-0 items-center justify-between gap-4 bg-blue-600 p-5 sm:p-8">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/20 shadow-inner">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-black leading-none tracking-tight text-white">Attendance Summary</h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-blue-100 opacity-90">Verify & Finalize Record</p>
                  </div>
                </div>
                <button onClick={() => setShowPreview(false)} className="shrink-0 rounded-full bg-white/15 p-2.5 text-white transition-all hover:bg-white/25 active:scale-95">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-10 sm:p-8 sm:pb-12">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Present Count</p>
                      <p className="text-3xl font-black tabular-nums text-emerald-600">{calculateStats().present}</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Absent Count</p>
                      <p className="text-3xl font-black tabular-nums text-rose-600">{calculateStats().absent}</p>
                    </div>
                  </div>

                  {/* Present List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-5 w-1.5 rounded-full bg-emerald-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Roll No: Present</h4>
                    </div>
                    <div className="max-h-28 overflow-y-auto rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-5 font-mono text-xs leading-relaxed text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400">
                      {calculateStats().presentRolls || "None"}
                    </div>
                  </div>

                  {/* Absent List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-5 w-1.5 rounded-full bg-rose-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Roll No: Absent</h4>
                    </div>
                    <div className="max-h-28 overflow-y-auto rounded-[24px] border border-rose-100 bg-rose-50/50 p-5 font-mono text-xs leading-relaxed text-rose-700 dark:border-rose-500/20 dark:bg-rose-950/20 dark:text-rose-400">
                      {calculateStats().absentRolls || "None"}
                    </div>
                  </div>

                  {/* Ready Message Preview */}
                  <div className="space-y-2.5">
                    <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                       <Copy className="w-3.5 h-3.5" /> Ready To Copy Message
                    </h4>
                    <div className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-[24px] border border-slate-200 bg-slate-100/50 p-5 font-mono text-[11px] leading-relaxed text-slate-600 select-all sm:max-h-44 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                      Date: {format(new Date(date), "dd MMM yyyy, eeee")}
                      {(() => {
                        const s = formatTime12h(startTime);
                        const e = formatTime12h(endTime);
                        if (s && e) return `\nTime: ${s} - ${e}`;
                        if (s || e) return `\nTime: ${s || e}`;
                        return "";
                      })()}
                      {roomNo && `\nRoom: ${roomNo}`}
                      {"\n\n"}
                      Present ({calculateStats().present}): {calculateStats().presentRolls || "None"}
                      {"\n"}
                      Absent ({calculateStats().absent}): {calculateStats().absentRolls || "None"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer for Buttons */}
              <div className="relative z-10 shrink-0 border-t border-slate-200 bg-slate-50 p-5 shadow-[0_-18px_32px_-28px_rgba(15,23,42,0.65)] sm:p-6 dark:border-white/10 dark:bg-[#0f172a]">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button 
                  onClick={handleCopySummary}
                  className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[24px] bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-xl transition-all hover:bg-blue-500 active:scale-95"
                >
                  {copyStatus ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                  {copyStatus ? "Copied Successfully!" : "Copy Report Message"}
                </button>
                
                <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[24px] px-4 py-3 text-sm font-black shadow-xl transition-all ${
                    isSaved 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-500 active:scale-95'
                  }`}
                >
                  {isSaved ? <CheckCircle className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                  {isSaved ? "Saved Successfully!" : "Confirm & Sync Record"}
                </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------- ATTENDANCE RECORDS TAB ----------------
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

function AttendanceRecordsTab({ teacherId, onEditSession }: { teacherId: string; key?: string; onEditSession?: (courseId: string, date: string) => void }) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [drillDownCourseId, setDrillDownCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // States for course data
  const [students, setStudents] = useState<User[]>([]);
  const [sessions, setSessions] = useState<ReportSession[]>([]); 
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [courseStatsMap, setCourseStatsMap] = useState<Record<string, { students: number, sessions: number, avg: number }>>({});

  useEffect(() => {
    async function loadStats() {
      if (courses.length > 0 && !drillDownCourseId) {
        const stats: Record<string, { students: number, sessions: number, avg: number }> = {};
        for (const course of courses) {
          try {
            const [courseStudents, courseRecords] = await Promise.all([
              db.getStudentsByCourse(course.id),
              db.getAttendanceByCourseAndDate(course.id, "")
            ]);
            
            const uniqueSessions = new Set(courseRecords.map(r => r.sessionId)).size;
            const presentCount = courseRecords.filter(r => r.status === 'P').length;
            const totalPossible = courseStudents.length * uniqueSessions;
            const avg = totalPossible > 0 ? Math.round((presentCount / totalPossible) * 100) : 0;
            
            stats[course.id] = {
              students: courseStudents.length,
              sessions: uniqueSessions,
              avg
            };
          } catch (e) {
            console.error(e);
          }
        }
        setCourseStatsMap(stats);
      }
    }
    loadStats();
  }, [courses, drillDownCourseId]);

  useEffect(() => {
    async function loadCourses() {
      const teacherCourses = await db.getCoursesByTeacher(teacherId);
      setCourses(teacherCourses);
      setLoading(false);
    }
    loadCourses();
  }, [teacherId]);

  const loadCourseData = useCallback(async () => {
    if (drillDownCourseId) {
      setLoading(true);
      const [courseStudents, courseRecords] = await Promise.all([
        db.getStudentsByCourse(drillDownCourseId),
        db.getAttendanceByCourseAndDate(drillDownCourseId, "")
      ]);
      const sortedRecords = [...courseRecords].sort((a, b) => a.date.localeCompare(b.date));
      setStudents(courseStudents);
      setAttendanceRecords(sortedRecords);
      const uniqueSessionsMap = new Map();
      sortedRecords.forEach(r => {
        if (!uniqueSessionsMap.has(r.sessionId)) {
          uniqueSessionsMap.set(r.sessionId, { id: r.sessionId, date: r.date });
        }
      });
      const orderedSessions = Array.from(uniqueSessionsMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));
      setSessions(orderedSessions);
      setLoading(false);
    }
  }, [drillDownCourseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  useEffect(() => {
    const refresh = (event: Event) => {
      const updatedCourseId = (event as CustomEvent<{ courseId?: string }>).detail?.courseId;
      if (!updatedCourseId || updatedCourseId === drillDownCourseId) {
        loadCourseData();
      }
    };
    window.addEventListener("attendance-updated", refresh);
    return () => window.removeEventListener("attendance-updated", refresh);
  }, [drillDownCourseId, loadCourseData]);

  const handleDownloadPDF = (course: Course, monthData?: { month: string, sessions: ReportSession[] }) => {
    // sessions and students are now in state
    const sessionsForReport = [...(monthData ? monthData.sessions : sessions)]
      .sort((a, b) => a.date.localeCompare(b.date));
    const reportSessionIds = new Set(sessionsForReport.map(s => s.id));
    const reportRecords = attendanceRecords.filter(r => reportSessionIds.has(r.sessionId));
    const recordsByStudentAndDate = new Map<string, AttendanceRecord>();

    reportRecords.forEach(record => {
      const key = `${record.studentId}|${record.date}`;
      const current = recordsByStudentAndDate.get(key);
      if (isNewerAttendanceRecord(record, current)) {
        recordsByStudentAndDate.set(key, record);
      }
    });

    const allSessionsInSet: ReportSession[] = Array.from(
      sessionsForReport.reduce((uniqueByDate, session) => {
        if (!uniqueByDate.has(session.date)) {
          uniqueByDate.set(session.date, session);
        }
        return uniqueByDate;
      }, new Map<string, ReportSession>()).values()
    );
    
    if (allSessionsInSet.length === 0) {
      alert("No attendance records found for this period.");
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4');
    const maxDatesPerPage = 15;
    // We'll assume the currently logged in user is the teacher or fetch if needed
    // For now, let's use the current user's name
    const teacherDisplayName = user?.name || "";

    // Helper to draw common header on every page
    const drawHeader = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text("Chaudhary Devi Lal University, Sirsa", 14, 15);
      
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("Department of Computer Science and Technology", 14, 21);
      
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.line(14, 25, pageWidth - 14, 25);
      
      // Course Details Grid
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      
      const leftCol = 14;
      const midCol = 150;
      
      doc.setFont("helvetica", "bold");
      doc.text(`Course / Semester:`, leftCol, 32);
      doc.setFont("helvetica", "normal");
      doc.text(`${course.name} (Semester ${course.semester})`, leftCol + 35, 32);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Subject / Section:`, leftCol, 37);
      doc.setFont("helvetica", "normal");
      doc.text(`${course.section}`, leftCol + 35, 37);
      
      doc.setFont("helvetica", "bold");
      doc.text(`Teacher Name:`, leftCol, 42);
      doc.setFont("helvetica", "normal");
      doc.text(teacherDisplayName, leftCol + 35, 42);

      doc.setFont("helvetica", "bold");
      doc.text(`Report Period:`, midCol, 32);
      doc.setFont("helvetica", "normal");
      doc.text(monthData ? `Month: ${monthData.month}` : `Session ${course.year} (Full)`, midCol + 30, 32);

      doc.setFont("helvetica", "bold");
      doc.text(`Total Lectures:`, midCol, 37);
      doc.setFont("helvetica", "normal");
      doc.text(`${allSessionsInSet.length}`, midCol + 30, 37);

      doc.setFont("helvetica", "bold");
      doc.text(`Generated On:`, midCol, 42);
      doc.setFont("helvetica", "normal");
      doc.text(`${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, midCol + 30, 42);

      // Add Time and Room if it's a single session or all sessions have it (optional display)
      if (allSessionsInSet.length === 1) {
        const s = allSessionsInSet[0];
        const formatTime = (t: string) => {
          if (!t) return "N/A";
          try {
            const [hours, minutes] = t.split(':');
            if (!hours || !minutes) return t;
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
          } catch { return t; }
        };

        doc.setFont("helvetica", "bold");
        doc.text(`Time:`, leftCol, 47);
        doc.setFont("helvetica", "normal");
        const sTime = formatTime(s.startTime || "");
        const eTime = formatTime(s.endTime || "");
        const tDisp = (sTime !== "N/A" && eTime !== "N/A") ? `${sTime} - ${eTime}` : (sTime !== "N/A" ? sTime : eTime);
        doc.text(tDisp, leftCol + 35, 47);

        doc.setFont("helvetica", "bold");
        doc.text(`Room No:`, midCol, 47);
        doc.setFont("helvetica", "normal");
        doc.text(s.roomNo || "N/A", midCol + 30, 47);
      }
    };

    // Helper to draw common footer
    const drawFooter = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
        doc.text(`System generated report - CDLU Attendance Hub`, 14, pageHeight - 7);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 38, pageHeight - 7);
      }
    };

    // Calculate chunks of sessions for pagination
    const sessionChunks: ReportSession[][] = [];
    for (let i = 0; i < allSessionsInSet.length; i += maxDatesPerPage) {
      sessionChunks.push(allSessionsInSet.slice(i, i + maxDatesPerPage));
    }

    sessionChunks.forEach((chunk, pageIdx) => {
      if (pageIdx > 0) doc.addPage();

      const isLastPage = pageIdx === sessionChunks.length - 1;
      const dateHeaders = chunk.map(s => format(new Date(s.date), "dd/MM"));
      const tableHeader = isLastPage
        ? ["Roll No", "Student Name", ...dateHeaders, "P", "A", "%"]
        : ["Roll No", "Student Name", ...dateHeaders];

      // Table Data
      const tableRows = students.map(student => {
        // Overall stats (always calculated for total sessions in current report period)
        let totalP = 0;
        let totalA = 0;
        allSessionsInSet.forEach(s => {
          const r = recordsByStudentAndDate.get(`${student.id}|${s.date}`);
          if (r?.status === 'P') totalP++;
          if (r?.status === 'A') totalA++;
        });

        // Row values for current page's dates
        const sessionStatus = chunk.map(s => {
          const r = recordsByStudentAndDate.get(`${student.id}|${s.date}`);
          return r ? r.status : "-";
        });

        const baseRow = [
          student.rollNumber || "-",
          student.name,
          ...sessionStatus
        ];

        if (!isLastPage) return baseRow;

        return [
          ...baseRow,
          totalP.toString(),
          totalA.toString(),
          allSessionsInSet.length > 0 ? `${Math.round((totalP / allSessionsInSet.length) * 100)}%` : "0%"
        ];
      });

      // Adaptive Font Size
      let fontSize = 8;
      if (chunk.length > 12) fontSize = 7;

      const dateColumnStyles = chunk.reduce((styles, _session, index) => {
        styles[index + 2] = { cellWidth: isLastPage ? 11 : 12, halign: 'center' };
        return styles;
      }, {} as Record<number, any>);

      const summaryColumnStyles = isLastPage ? {
        [tableHeader.length - 3]: { cellWidth: 10, fontStyle: 'bold', fillColor: [240, 253, 244], textColor: [21, 128, 61] },
        [tableHeader.length - 2]: { cellWidth: 10, fontStyle: 'bold', fillColor: [255, 241, 242], textColor: [190, 18, 60] },
        [tableHeader.length - 1]: { cellWidth: 12, fontStyle: 'bold', fillColor: [239, 246, 255], textColor: [29, 78, 216] }
      } : {};

      autoTable(doc, {
        head: [tableHeader],
        body: tableRows,
        startY: 52,
        theme: 'grid',
        styles: { 
          fontSize: fontSize,
          cellPadding: 1.6,
          valign: 'middle',
          halign: 'center',
          font: 'helvetica',
          lineWidth: 0.1,
          lineColor: [200, 200, 200]
        },
        headStyles: { 
          fillColor: [30, 41, 59], 
          textColor: 255, 
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', cellWidth: 22 },
          1: { halign: 'left', fontStyle: 'bold', cellWidth: 48 },
          ...dateColumnStyles,
          ...summaryColumnStyles
        },
        alternateRowStyles: { fillColor: [252, 252, 252] },
        margin: { top: 52, left: 14, right: 14, bottom: 18 },
        pageBreak: 'auto',
        rowPageBreak: 'avoid',
        didDrawPage: () => {
          drawHeader();
        }
      });
    });

    drawFooter();
    const fileName = monthData 
      ? `${course.name}_${monthData.month.replace(" ", "_")}_Report.pdf`
      : `${course.name}_Full_Report.pdf`;
    doc.save(fileName);
  };

  const handleDownloadCSV = (course: Course) => {
    if (sessions.length === 0) {
      alert("No attendance records found for this period.");
      return;
    }

    // Creating CSV content
    // Header: Roll No, Name, Date1, Date2, ..., Present, Absent, %
    const dateHeaders = sessions.map(s => s.date);
    const header = ["Roll No", "Name", ...dateHeaders, "Total Present", "Total Absent", "Percentage"];
    
    const rows = students.map(student => {
      const studentRecs = attendanceRecords.filter(r => r.studentId === student.id);
      let pCount = 0;
      let aCount = 0;
      
      const sessionStatus = sessions.map(s => {
        const r = studentRecs.find(rec => rec.sessionId === s.id);
        if (r?.status === 'P') pCount++;
        if (r?.status === 'A') aCount++;
        return r ? r.status : "-";
      });

      const percentage = sessions.length > 0 ? `${Math.round((pCount / sessions.length) * 100)}%` : "0%";
      return [student.rollNumber || "-", student.name, ...sessionStatus, pCount, aCount, percentage];
    });

    const csvContent = [
      header.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${course.name}_Attendance_Report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (drillDownCourseId) {
    const course = courses.find(c => c.id === drillDownCourseId)!;
    const filteredSessions = sessions.filter(s => {
      const isAfterStart = !dateFilter.start || s.date >= dateFilter.start;
      const isBeforeEnd = !dateFilter.end || s.date <= dateFilter.end;
      return isAfterStart && isBeforeEnd;
    });

    const monthsWithData = Array.from(new Set(sessions.map(s => format(new Date(s.date), "MMMM yyyy"))));
    const monthlyAnalytics = monthsWithData.map(month => {
      const monthSessions = sessions.filter(s => format(new Date(s.date), "MMMM yyyy") === month);
      const monthRecords = attendanceRecords.filter(r => monthSessions.some(s => s.id === r.sessionId));
      const present = monthRecords.filter(r => r.status === "P").length;
      const totalPossible = students.length * monthSessions.length;
      return {
        month,
        lectures: monthSessions.length,
        percentage: totalPossible > 0 ? Math.round((present / totalPossible) * 100) : 0
      };
    });
    const lowAttendanceStudents = students.map(student => {
      const studentRecs = attendanceRecords.filter(r => r.studentId === student.id);
      const present = sessions.filter(s => studentRecs.some(r => r.sessionId === s.id && r.status === "P")).length;
      const percentage = sessions.length > 0 ? Math.round((present / sessions.length) * 100) : 0;
      return { student, percentage };
    }).filter(item => item.percentage < 75);

    return (
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 flex flex-col h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button onClick={() => { setDrillDownCourseId(null); setSearchQuery(""); }} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:text-white dark:hover:text-white flex items-center gap-1 mb-2 text-sm font-bold transition-colors">
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to List
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{course.name} <span className="text-blue-600 dark:text-blue-400">Records</span></h2>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => handleDownloadCSV(course)}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm"
            >
              <Download className="w-4 h-4" /> Save CSV
            </button>
            <button 
              onClick={() => handleDownloadPDF(course)}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm"
            >
              <FileText className="w-4 h-4" /> Full PDF
            </button>
          </div>
        </div>

        {/* Quick Month Reports Bar */}
        {monthsWithData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-white/10 overflow-x-auto scrollbar-none flex gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 self-center mr-2 shrink-0">Monthly Reports:</span>
            {monthsWithData.map((m: any) => (
              <button 
                key={m}
                onClick={() => {
                   const sessionsInMonth = sessions.filter(s => format(new Date(s.date), "MMMM yyyy") === m);
                   handleDownloadPDF(course, { month: m as string, sessions: sessionsInMonth });
                }}
                className="whitespace-nowrap px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                {m}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Monthly Analytics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {monthlyAnalytics.map(item => (
                <div key={item.month} className="rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{item.month}</span>
                    <span className={`text-sm font-black ${item.percentage >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{item.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full rounded-full ${item.percentage >= 75 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.lectures} lectures</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 mb-3">Low Attendance Warning</h3>
            {lowAttendanceStudents.length === 0 ? (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                All students are at or above 75%.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto space-y-2">
                {lowAttendanceStudents.map(({ student, percentage }) => (
                  <div key={student.id} className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900 dark:text-white">{student.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{student.rollNumber || "No Roll"}</p>
                    </div>
                    <span className="shrink-0 text-sm font-black text-rose-600 dark:text-rose-400">{percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
          <div className="flex-1 min-w-[200px] relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by name or roll..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-black/10 dark:border-white/20 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
             />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <input type="date" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-xl p-2.5 text-sm outline-none" />
            </div>
            <span className="text-slate-500 dark:text-slate-400">to</span>
            <div>
              <input type="date" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/20 rounded-xl p-2.5 text-sm outline-none" />
            </div>
          </div>
        </div>

        {/* Main Content Areas */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6">
          {/* Day-wise Session List (Mobile Friendly Timeline) */}
          <div className="w-full lg:w-1/3 flex flex-col h-[400px] lg:h-auto pb-4">
            <div className="p-4 bg-blue-600 rounded-t-3xl text-white flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase tracking-widest text-[10px] opacity-80 mb-1">Session History</h3>
                <p className="text-xs font-bold">Lecture-wise breakdown</p>
              </div>
              {selectedSessionId && (
                <button 
                  onClick={() => setSelectedSessionId(null)}
                  className="bg-white/20 hover:bg-white/30 text-slate-900 dark:text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest transition-all"
                >
                  View All
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-[#0f172a] border-x border-b border-slate-200 dark:border-white/10 rounded-b-3xl space-y-3">
              {sessions.slice().reverse().map((session, idx) => {
                const sessionDate = new Date(session.date);
                const att = attendanceRecords.filter(a => a.sessionId === session.id);
                const present = att.filter(a => a.status === 'P').length;
                const total = students.length;
                const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
                const isSelected = selectedSessionId === session.id;

                return (
                  <div 
                    key={session.id} 
                    onClick={() => setSelectedSessionId(isSelected ? null : session.id)}
                    className={`group relative flex items-center p-4 rounded-2xl shadow-sm border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                      ${isSelected 
                        ? 'bg-blue-600 border-blue-600 text-slate-900 dark:text-white shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-900 dark:text-white'
                      }`}
                  >
                    <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${isSelected ? 'bg-white' : (percentage >= 75 ? 'bg-emerald-500' : 'bg-blue-500')}`} />
                    <div className={`flex flex-col items-center justify-center min-w-[50px] border-r pr-4 mr-4 ${isSelected ? 'border-black/10 dark:border-white/20' : 'border-slate-100 dark:border-white/5'}`}>
                      <span className={`text-lg font-black leading-none ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>{format(sessionDate, "dd")}</span>
                      <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{format(sessionDate, "MMM")}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-black mb-1 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>{format(sessionDate, "eeee")}</h4>
                        <div className="flex gap-2 items-center">
                          {(session.startTime || session.endTime) && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                              {(() => {
                                const fmt = (t: string) => {
                                  if (!t) return "";
                                  try {
                                    const [h, m] = t.split(':');
                                    if (!h || !m) return t;
                                    const hour = parseInt(h);
                                    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
                                  } catch { return t; }
                                };
                                const s = fmt(session.startTime || "");
                                const e = fmt(session.endTime || "");
                                if (s && e) return `${s} - ${e}`;
                                return s || e;
                              })()}
                            </span>
                          )}
                          {session.roomNo && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-slate-900 dark:text-white' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'}`}>
                              {session.roomNo}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className={`w-3 h-3 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`} />
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-50/80' : 'text-slate-500'}`}>{present}/{total} Present</span>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black ${isSelected ? 'bg-white/20 text-slate-900 dark:text-white' : (percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600')}`}>
                        {percentage}%
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSession?.(course.id, session.date);
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                          isSelected
                            ? "bg-white text-blue-600 hover:bg-blue-50"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
                        }`}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
              {sessions.length === 0 && <div className="text-center py-10 text-slate-500 font-bold italic text-sm">No lectures held yet.</div>}
            </div>
          </div>

          {/* Table Wrapper */}
          <div className="flex-1 overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-xl flex flex-col relative">
            <div className="p-4 bg-blue-600 text-white rounded-t-3xl flex justify-between items-center whitespace-nowrap">
               <h3 className="font-black uppercase tracking-widest text-[10px]">
                 {selectedSessionId ? `Record for ${sessions.find(s => s.id === selectedSessionId)?.date}` : "Student wise Record"}
               </h3>
               <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500 rounded-full">
                 {selectedSessionId ? "Day Focus" : `Lectures: ${sessions.length}`}
               </span>
            </div>
          <div className="overflow-auto max-h-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <table className="w-full text-left border-separate border-spacing-0 text-xs sm:text-sm">
              <thead className="sticky top-0 z-30">
                <tr className="bg-slate-50 dark:bg-slate-900/95 backdrop-blur-sm">
                  <th className="p-4 sm:p-5 font-black uppercase tracking-widest whitespace-nowrap sticky left-0 z-40 bg-slate-50 dark:bg-slate-900 border-r border-b border-slate-200 dark:border-white/10 shadow-[2px_0_8px_rgba(0,0,0,0.03)] min-w-[140px] sm:min-w-[180px]">
                    Student Details
                  </th>
                  {sessions.filter(s => !selectedSessionId || s.id === selectedSessionId).map(s => (
                    <th key={s.id} className="p-3 sm:p-4 font-black uppercase tracking-widest whitespace-nowrap text-center border-r border-b border-slate-200 dark:border-white/5 min-w-[60px] sm:min-w-[75px]">
                      <span className="block text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter mb-0.5 leading-none">{s.date.split("-")[0]}</span>
                      <span className="text-blue-600 dark:text-blue-400">{s.date.substring(5)}</span>
                    </th>
                  ))}
                  <th className={`${selectedSessionId ? 'hidden' : 'hidden xl:table-cell'} p-4 sm:p-5 font-black uppercase tracking-widest whitespace-nowrap text-center bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 sticky right-[120px] sm:right-[150px] z-20 border-l border-b border-slate-200 dark:border-white/10 min-w-[60px] sm:min-w-[75px]`}>P</th>
                  <th className={`${selectedSessionId ? 'hidden' : 'hidden xl:table-cell'} p-4 sm:p-5 font-black uppercase tracking-widest whitespace-nowrap text-center bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 sticky right-12 sm:right-16 z-20 border-l border-b border-slate-200 dark:border-white/10 min-w-[60px] sm:min-w-[75px]`}>A</th>
                  <th className={`p-4 sm:p-5 font-black uppercase tracking-widest whitespace-nowrap text-center bg-blue-600 text-white sticky right-0 z-20 border-b border-blue-700 min-w-[60px] sm:min-w-[85px] shadow-[-2px_0_8px_rgba(37,99,235,0.2)] font-black ${selectedSessionId ? 'hidden' : ''}`}>%</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#0f172a]">
                {students.map(student => {
                  const studentRecs = attendanceRecords.filter(r => r.studentId === student.id);
                  let pCount = 0;
                  let aCount = 0;
                  
                  // Only count records for the sessions currently being displayed (avoids discrepancy when filtered)
                  sessions.forEach(s => {
                    const r = studentRecs.find(rec => rec.sessionId === s.id);
                    if (r?.status === 'P') pCount++;
                    if (r?.status === 'A') aCount++;
                  });
                  
                  return (
                    <tr key={student.id} className="group hover:bg-slate-50 dark:bg-white/5 dark:hover:bg-white/10 transition-all duration-150">
                      <td className="p-4 sm:p-5 sticky left-0 z-20 bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-900 border-r border-b border-slate-200 dark:border-white/10 shadow-[2px_0_8px_rgba(0,0,0,0.02)] transition-colors">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 dark:text-white whitespace-nowrap tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{student.name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{student.rollNumber}</span>
                        </div>
                      </td>
                      {sessions.filter(s => !selectedSessionId || s.id === selectedSessionId).map(s => {
                        const r = studentRecs.find(rec => rec.sessionId === s.id);
                        return (
                          <td key={s.id} className="p-3 sm:p-4 text-center border-r border-b border-slate-100 dark:border-white/5 group-hover:bg-black/[0.01] dark:group-hover:bg-white/[0.01]">
                            {r?.status === 'P' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px]">P</span>
                            ) : r?.status === 'A' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[10px]">A</span>
                            ) : (
                              <span className="text-slate-700 dark:text-slate-300">-</span>
                            )}
                          </td>
                        )
                      })}
                      {!selectedSessionId && (
                        <>
                          <td className="hidden xl:table-cell p-4 sm:p-5 text-center font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-900 sticky right-[120px] sm:right-[150px] z-10 border-l border-b border-slate-200 dark:border-white/10 shadow-[-2px_0_5px_rgba(0,0,0,0.01)] transition-colors">{pCount}</td>
                          <td className="hidden xl:table-cell p-4 sm:p-5 text-center font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-950 group-hover:bg-slate-50 dark:group-hover:bg-slate-900 sticky right-12 sm:right-16 z-10 border-l border-b border-slate-200 dark:border-white/10 shadow-[-2px_0_5px_rgba(0,0,0,0.01)] transition-colors">{aCount}</td>
                          <td className="p-4 sm:p-5 text-center bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 sticky right-0 z-10 border-l border-b border-slate-200 dark:border-white/10 font-black shadow-[-2px_0_8px_rgba(0,0,0,0.05)] transition-colors">
                            {sessions.length > 0 ? (
                              <div className="flex flex-col items-center">
                                <span className={`text-sm sm:text-base ${Math.round((pCount / sessions.length) * 100) < 75 ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                                  {Math.round((pCount / sessions.length) * 100)}<span className="text-[10px] ml-0.5">%</span>
                                </span>
                              </div>
                            ) : "0%"}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 flex flex-col flex-1 h-full overflow-y-auto pr-2">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance <span className="text-blue-600 dark:text-blue-400">Records</span></h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter courses..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 py-2 pl-10 pr-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const stats = courseStatsMap[course.id] || { students: 0, sessions: 0, avg: 0 };

            return (
              <motion.div 
                whileHover={{ y: -5 }}
                key={course.id} 
                className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 p-6 rounded-3xl group shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:bg-blue-500/10 transition-colors" />
                
                <div>
                   <h3 className="font-black text-xl text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{course.name}</h3>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">{course.section} • Sem {course.semester}</p>
                   
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-bold">Total Students</span>
                         <span className="text-slate-900 dark:text-white font-black">{stats.students}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="text-slate-500 font-bold">Lectures Held</span>
                         <span className="text-slate-900 dark:text-white font-black">{stats.sessions}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Avg Attendance</span>
                      <span className={`text-2xl font-black ${stats.avg >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{stats.avg}%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                      <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${stats.avg}%` }}
                         className={`h-full rounded-full ${stats.avg >= 75 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}
                      />
                   </div>
                   <button 
                     onClick={() => setDrillDownCourseId(course.id)}
                     className="w-full mt-6 bg-blue-600 text-white py-3 rounded-2xl text-sm font-black hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                   >
                     View Records
                   </button>
                </div>
              </motion.div>
            )
          })}
          {filteredCourses.length === 0 && <div className="col-span-full py-20 text-center text-slate-500 font-bold italic">No records found matching your filter.</div>}
       </div>
    </motion.div>
  );
}

// ---------------- PROFILE TAB ----------------
function ProfileTab({ user }: { user: User; key?: string }) {
  const { updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    title: user.title || "",
    phone: user.phone || "",
    password: user.password || ""
  });

  // Sync formData if user prop changes (e.g. from refresh or context update)
  useEffect(() => {
    setFormData({
      name: user.name || "",
      username: user.username || "",
      title: user.title || "",
      phone: user.phone || "",
      password: user.password || ""
    });
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      await updateProfile(formData);
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const exportAllData = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cdlu_db_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cdlu_attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("This will overwrite your current local data. Are you sure you want to continue?")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith('cdlu_db_') && typeof value === 'string') {
            localStorage.setItem(key, value);
          }
        });
        alert("Data imported successfully! The page will now reload.");
        window.location.reload();
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto w-full space-y-6">
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-500/20 mb-4 border-4 border-white dark:border-slate-800">
          {formData.name.charAt(0)}
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account <span className="text-blue-600">Settings</span></h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold">Manage your profile and public information</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
        {status && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600'}`}
          >
            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
            {status.msg}
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Designation / Title</label>
            <select 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="Dr. ">Dr.</option>
              <option value="Prof. ">Prof.</option>
              <option value="Mr. ">Mr.</option>
              <option value="Ms. ">Ms.</option>
              <option value="Mrs. ">Mrs.</option>
              <option value="">None</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold">@</span>
              <input 
                type="text" 
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 pl-10 pr-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 px-4 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="+91 ..."
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Email (Official ID)</label>
            <input 
              disabled
              type="email" 
              value={user.email}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 px-4 text-slate-500 dark:text-slate-500 font-bold cursor-not-allowed"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Account Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                placeholder="Password"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98] mt-4"
        >
          {isSaving ? "Syncing..." : "Update Profile"}
        </button>

        <div className="pt-6 border-t border-slate-100 dark:border-white/5">
          <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-4 tracking-widest">Advanced Options</p>
          
          <button 
            type="button"
            onClick={() => { if(window.confirm("Are you sure you want to logout?")) { logout(); window.location.href = "/"; } }}
            className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all group mt-3 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-lg text-rose-600">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-rose-600">Logout Account</p>
                <p className="text-[10px] text-rose-500 font-medium">Securely end your session</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-600 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>

      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-6 rounded-[28px] flex gap-4">
        <Clock className="w-6 h-6 text-amber-600 shrink-0" />
        <div>
           <p className="text-sm font-black text-amber-900 dark:text-amber-400 uppercase tracking-tight">Security Note</p>
           <p className="text-xs font-bold text-amber-700 dark:text-amber-500/80 mt-1 leading-relaxed">You can now view and update your password directly from this profile page. Ensure you use a strong password for better security.</p>
        </div>
      </div>
    </motion.div>
  );
}
