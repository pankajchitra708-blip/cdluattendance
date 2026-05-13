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

// API-based Database client
class Database {
  private async fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
    const requestUrl = apiBaseUrl && path.startsWith("/api")
      ? `${apiBaseUrl}${path}`
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
    return await this.fetchApi<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password, role }),
    });
  }

  async createUser(user: Omit<User, "id">): Promise<User> {
    return this.fetchApi<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    return this.fetchApi<User>(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async getUserByRollNumber(rollNumber: string): Promise<User | null> {
    try {
      return await this.fetchApi<User>(`/api/users/roll/${rollNumber}`);
    } catch {
      return null;
    }
  }

  // --- Courses ---
  async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    return this.fetchApi<Course[]>(`/api/courses?teacherId=${teacherId}`);
  }

  async getCoursesByStudent(studentId: string): Promise<Course[]> {
    return this.fetchApi<Course[]>(`/api/courses?studentId=${studentId}`);
  }

  async createCourse(course: Omit<Course, "id">): Promise<Course> {
    return this.fetchApi<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(course),
    });
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    return this.fetchApi<Course>(`/api/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.fetchApi(`/api/courses/${courseId}`, {
      method: "DELETE",
    });
  }

  // --- Enrollments ---
  async getStudentsByCourse(courseId: string): Promise<User[]> {
    return this.fetchApi<User[]>(`/api/courses/${courseId}/students`);
  }

  async enrollStudent(courseId: string, studentId: string): Promise<void> {
    await this.fetchApi("/api/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId, studentId }),
    });
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    await this.fetchApi(`/api/enrollments?courseId=${courseId}&studentId=${studentId}`, {
      method: "DELETE",
    });
  }

  // --- Attendance ---
  async getAttendanceByCourseAndDate(courseId: string, date: string): Promise<AttendanceRecord[]> {
    return this.fetchApi<AttendanceRecord[]>(`/api/attendance?courseId=${courseId}&date=${date}`);
  }

  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
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
    await this.fetchApi("/api/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ courseId, teacherId, date, studentStatus, metadata, allowUpdate }),
    });
  }
}

export const db = new Database();
