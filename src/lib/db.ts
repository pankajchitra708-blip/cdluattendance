export type Role = "teacher" | "student";

export interface User {
  id: string;
  role: Role;
  name: string;
  email?: string;
  password?: string; // Stored securely in real db
  phone?: string;
  username?: string;
  title?: string;
  // Student specific
  rollNumber?: string;
  className?: string; // 'class' is a reserved word
  section?: string;
}

export interface Course {
  id: string;
  teacherId: string;
  name: string;
  semester: string;
  year: string;
  section: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  roomNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  courseId: string; // Redundant but helpful for legacy/quick queries
  date: string; // Redundant but helpful for legacy/quick queries
  status: "P" | "A" | "L"; // Present, Absent, Leave
  createdAt?: string;
  updatedAt?: string;
}

type BrowserDbState = {
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  sessions: AttendanceSession[];
  attendance: AttendanceRecord[];
};

const browserDbKey = "cdlu_db_state";

const emptyBrowserDb = (): BrowserDbState => ({
  users: [],
  courses: [],
  enrollments: [],
  sessions: [],
  attendance: [],
});

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

const stamp = <T extends Record<string, unknown>>(item: T): T & { id: string; createdAt: string; updatedAt: string } => {
  const now = new Date().toISOString();
  return { ...item, id: createId(), createdAt: now, updatedAt: now };
};

class BrowserStorageDatabase {
  private read(): BrowserDbState {
    try {
      const raw = localStorage.getItem(browserDbKey);
      return raw ? { ...emptyBrowserDb(), ...JSON.parse(raw) } : emptyBrowserDb();
    } catch {
      return emptyBrowserDb();
    }
  }

  private write(state: BrowserDbState) {
    localStorage.setItem(browserDbKey, JSON.stringify(state));
  }

  async login(identifier: string, password: string, role: Role): Promise<User | null> {
    const state = this.read();
    const user = state.users.find(u => {
      if (u.role !== role) return false;
      if (role === "teacher") {
        return u.email === identifier || u.username === identifier || u.phone === identifier;
      }
      return u.rollNumber === identifier || u.email === identifier;
    });

    if (user && user.password === password) return user;
    return null;
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    const state = this.read();
    const duplicate = state.users.find(existing =>
      (user.email && existing.email === user.email) ||
      (user.username && existing.username === user.username) ||
      (user.rollNumber && existing.rollNumber === user.rollNumber)
    );

    if (duplicate) {
      throw new Error("A user with this email, username, or roll number already exists.");
    }

    const newUser = stamp(user);
    state.users.push(newUser);
    this.write(state);
    return newUser;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const state = this.read();
    const user = state.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");

    Object.assign(user, updates);
    this.write(state);
    return user;
  }

  async getUserByRollNumber(rollNumber: string): Promise<User | null> {
    const state = this.read();
    return state.users.find(user => user.role === "student" && user.rollNumber === rollNumber) || null;
  }

  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const state = this.read();
    return state.courses.filter(course => course.teacherId === teacherId);
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    const state = this.read();
    const courseIds = new Set(state.enrollments.filter(e => e.studentId === studentId).map(e => e.courseId));
    return state.courses.filter(course => courseIds.has(course.id));
  }

  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    const state = this.read();
    const newCourse = stamp(course);
    state.courses.push(newCourse);
    this.write(state);
    return newCourse;
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    const state = this.read();
    const course = state.courses.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");

    Object.assign(course, updates);
    this.write(state);
    return course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const state = this.read();
    state.courses = state.courses.filter(course => course.id !== courseId);
    state.enrollments = state.enrollments.filter(enrollment => enrollment.courseId !== courseId);
    state.sessions = state.sessions.filter(session => session.courseId !== courseId);
    state.attendance = state.attendance.filter(record => record.courseId !== courseId);
    this.write(state);
  }

  async getStudentsByCourse(courseId: string): Promise<User[]> {
    const state = this.read();
    const studentIds = new Set(state.enrollments.filter(e => e.courseId === courseId).map(e => e.studentId));
    return state.users.filter(user => user.role === "student" && studentIds.has(user.id));
  }

  async enrollStudent(courseId: string, studentId: string): Promise<void> {
    const state = this.read();
    const exists = state.enrollments.some(e => e.courseId === courseId && e.studentId === studentId);
    if (!exists) {
      state.enrollments.push(stamp({ courseId, studentId }));
      this.write(state);
    }
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    const state = this.read();
    state.enrollments = state.enrollments.filter(e => !(e.courseId === courseId && e.studentId === studentId));
    this.write(state);
  }

  async getAttendanceByCourseAndDate(courseId: string, date: string): Promise<AttendanceRecord[]> {
    const state = this.read();
    return state.attendance
      .filter(record => record.courseId === courseId && (!date || record.date === date))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    const state = this.read();
    return state.attendance.filter(record => record.studentId === studentId);
  }

  async markAttendance(
    courseId: string,
    teacherId: string,
    date: string,
    studentStatus: { studentId: string, status: "P" | "A" | "L" }[],
    metadata?: { startTime?: string, endTime?: string, roomNo?: string },
    allowUpdate = false
  ): Promise<void> {
    const state = this.read();
    const now = new Date().toISOString();
    let session = state.sessions.find(s => s.courseId === courseId && s.date === date);

    if (!session) {
      session = stamp({ courseId, teacherId, date, ...(metadata || {}) });
      state.sessions.push(session);
    } else if (!allowUpdate) {
      throw new Error("Attendance Already Exists, Update Record?");
    } else {
      Object.assign(session, metadata || {}, { updatedAt: now });
    }

    studentStatus.forEach(item => {
      const record = state.attendance.find(r => r.sessionId === session!.id && r.studentId === item.studentId);
      if (record) {
        Object.assign(record, { status: item.status, courseId, date, updatedAt: now });
      } else {
        state.attendance.push(stamp({
          sessionId: session!.id,
          studentId: item.studentId,
          courseId,
          date,
          status: item.status,
        }));
      }
    });

    this.write(state);
  }
}

// API-based Database client with browser-local fallback for static hosting.
class Database {
  private browserDb = new BrowserStorageDatabase();

  private get apiBaseUrl() {
    return import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
  }

  private get useBrowserStorage() {
    return !this.apiBaseUrl;
  }

  private async fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const requestUrl = this.apiBaseUrl && path.startsWith("/api")
      ? `${this.apiBaseUrl}${path}`
      : path;

    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "API error" }));
      throw new Error(error.message || error.error || "Something went wrong");
    }
    return response.json();
  }

  // --- Users ---
  async login(identifier: string, password: string, role: Role): Promise<User | null> {
    if (this.useBrowserStorage) return this.browserDb.login(identifier, password, role);
    return await this.fetchApi<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password, role }),
    });
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    if (this.useBrowserStorage) return this.browserDb.createUser(user);
    return this.fetchApi<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (this.useBrowserStorage) return this.browserDb.updateUser(userId, updates);
    return this.fetchApi<User>(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async getUserByRollNumber(rollNumber: string): Promise<User | null> {
    if (this.useBrowserStorage) return this.browserDb.getUserByRollNumber(rollNumber);
    try {
      return await this.fetchApi<User>(`/api/users/roll/${rollNumber}`);
    } catch {
      return null;
    }
  }

  // --- Courses ---
  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    if (this.useBrowserStorage) return this.browserDb.getCoursesByTeacher(teacherId);
    return this.fetchApi<Course[]>(`/api/courses?teacherId=${teacherId}`);
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    if (this.useBrowserStorage) return this.browserDb.getCoursesByStudent(studentId);
    return this.fetchApi<Course[]>(`/api/courses?studentId=${studentId}`);
  }

  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    if (this.useBrowserStorage) return this.browserDb.createCourse(course);
    return this.fetchApi<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(course),
    });
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    if (this.useBrowserStorage) return this.browserDb.updateCourse(courseId, updates);
    return this.fetchApi<Course>(`/api/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteCourse(courseId: string): Promise<void> {
    if (this.useBrowserStorage) return this.browserDb.deleteCourse(courseId);
    await this.fetchApi(`/api/courses/${courseId}`, {
      method: "DELETE",
    });
  }

  // --- Enrollments ---
  async getStudentsByCourse(courseId: string): Promise<User[]> {
    if (this.useBrowserStorage) return this.browserDb.getStudentsByCourse(courseId);
    return this.fetchApi<User[]>(`/api/courses/${courseId}/students`);
  }

  async enrollStudent(courseId: string, studentId: string): Promise<void> {
    if (this.useBrowserStorage) return this.browserDb.enrollStudent(courseId, studentId);
    await this.fetchApi("/api/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId, studentId }),
    });
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    if (this.useBrowserStorage) return this.browserDb.unenrollStudent(courseId, studentId);
    await this.fetchApi(`/api/enrollments?courseId=${courseId}&studentId=${studentId}`, {
      method: "DELETE",
    });
  }

  // --- Attendance ---
  async getAttendanceByCourseAndDate(courseId: string, date: string): Promise<AttendanceRecord[]> {
    if (this.useBrowserStorage) return this.browserDb.getAttendanceByCourseAndDate(courseId, date);
    return this.fetchApi<AttendanceRecord[]>(`/api/attendance?courseId=${courseId}&date=${date}`);
  }

  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    if (this.useBrowserStorage) return this.browserDb.getAttendanceByStudent(studentId);
    return this.fetchApi<AttendanceRecord[]>(`/api/attendance?studentId=${studentId}`);
  }

  async markAttendance(
    courseId: string, 
    teacherId: string, 
    date: string, 
    studentStatus: { studentId: string, status: "P" | "A" | "L" }[],
    metadata?: { startTime?: string, endTime?: string, roomNo?: string },
    allowUpdate = false
  ): Promise<void> {
    if (this.useBrowserStorage) {
      return this.browserDb.markAttendance(courseId, teacherId, date, studentStatus, metadata, allowUpdate);
    }

    await this.fetchApi("/api/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ courseId, teacherId, date, studentStatus, metadata, allowUpdate }),
    });
  }
}

export const db = new Database();
