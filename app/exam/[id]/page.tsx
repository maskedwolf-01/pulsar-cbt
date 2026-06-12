"use client";
import { useParams } from 'next/navigation';

// FIXED: Went up exactly 2 levels to the 'app' folder, then down into 'components'
import ExamEngine from "../../components/ExamEngine";

export default function ExamPage() {
  const params = useParams();
  
  // We handle both array and string cases for the ID just to be safe
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <ExamEngine 
      examId={id} 
    />
  );
}
