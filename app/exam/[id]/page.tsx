"use client";
import { useParams } from 'next/navigation';
import ExamEngine from "../../../components/ExamEngine"; // Adjust path if needed

export default function ExamPage() {
  const params = useParams();
  const id = params.id as string;

  // This simple page just hands the ID to the Engine.
  // The Engine handles the Timer, Calculator, Supabase, etc.
  return (
    <ExamEngine 
      examId={id} 
    />
  );
}
