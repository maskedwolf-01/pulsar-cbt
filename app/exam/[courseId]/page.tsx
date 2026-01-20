"use client";
import { notFound } from "next/navigation";
import ExamEngine from "../../../components/ExamEngine";

// --- MASTER CONFIGURATION ---
const EXAM_CONFIG: Record<string, { title: string; time: number; color: 'purple' | 'blue' | 'green' | 'red' | 'orange' | 'cyan' | 'pink' | 'emerald' | 'indigo' }> = {
  // Your Real Courses
  "mth101": { title: "MTH 101: Elementary Mathematics I", time: 25, color: "blue" },
  "phy101": { title: "PHY 101: General Physics I", time: 25, color: "purple" },
  "chm101": { title: "CHM 101: General Chemistry I", time: 25, color: "red" },
  "bio101": { title: "BIO 101: Introductory Biology I", time: 25, color: "green" },
  "sta111": { title: "STA 111: Descriptive Statistics", time: 25, color: "cyan" },
  "gst101": { title: "GST 101: Use of English", time: 20, color: "pink" },
  "gst103": { title: "GST 103: Library & ICT", time: 20, color: "orange" },
  "ent101": { title: "ENT 101: Entrepreneurship", time: 20, color: "emerald" },
  "cos101": { title: "COS 101: Intro to Computing", time: 25, color: "indigo" },
  "gly101": { title: "GLY 101: Intro to Geology", time: 25, color: "orange" },

  // --- SAFETY TEST COURSE ---
  "test-demo": { title: "TEST MODE: Checking Themes", time: 10, color: "purple" }, 
};

export default function DynamicExamPage({ params }: { params: { courseId: string } }) {
  const courseCode = params.courseId.toLowerCase();
  const config = EXAM_CONFIG[courseCode];

  if (!config) return notFound();

  return (
    <ExamEngine 
      title={config.title} 
      courseCode={courseCode} // It will try to fetch questions for 'test-demo' from DB. 
      // If DB has no questions for 'test-demo', it will load empty (0 questions), which is fine for checking the UI.
      timeLimit={config.time} 
      themeColor={config.color} 
    />
  );
}
