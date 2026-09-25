import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
  CURRENT_STUDENT_ID,
} from "@/lib/mock-data";
import type { Course, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** เซ็ตรายชื่อนักศึกษาทั้งหมดใหม่ */
  setStudents: (students: Student[]) => void;
  /** เซ็ตรายวิชาทั้งหมดใหม่ */
  setCourses: (courses: Course[]) => void;
  /** ลบนักศึกษา */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบออกจาก enrolledCourses ของนักศึกษาทุกคนที่ลงวิชานั้น */
  removeCourse: (courseCode: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      setStudents: (students) => set({ students }),
      setCourses: (courses) => set({ courses }),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter((c) => c !== courseCode),
          })),
        })),
    }),
    {
      name: `lab16-2569-${CURRENT_STUDENT_ID}`, // key รูปแบบ lab16-2569-รหัสนศ.
      storage: createJSONStorage(() => localStorage),
      // เก็บเฉพาะ students กับ courses ลง Local Storage (ไม่เก็บ action functions)
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);