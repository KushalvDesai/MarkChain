
"use client";

import { gql, useQuery } from "@apollo/client";
import { GetStudentMarksResponse } from "@/types/graphql";

const GET_MARKS = gql`
  query GetStudentMarks {
    getStudentMarks {
      subject
      marks
    }
  }
`;

export default function StudentMarks() {
  const { loading, error, data } = useQuery<GetStudentMarksResponse>(GET_MARKS);

  if (loading) return <p className="text-white p-4">Loading marks...</p>;
  if (error) return <p className="text-red-500 p-4">Error fetching marks.</p>;

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-2">Your Marks</h2>
      <ul className="list-disc list-inside space-y-1">
        {data?.getStudentMarks.map((entry, idx) => (
          <li key={idx}>
            {entry.subject}: {entry.marks}
          </li>
        ))}
      </ul>
    </div>
  );
}
