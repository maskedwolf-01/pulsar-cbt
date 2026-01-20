"use client";
import { useParams } from 'next/navigation';
import ExamEngine from "../../../components/ExamEngine";

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
