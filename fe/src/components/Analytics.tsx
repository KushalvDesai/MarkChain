"use client";

import { gql, useQuery } from "@apollo/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GetStudentMarksResponse } from "@/types/graphql";

const GET_MARKS = gql`
  query GetStudentMarks {
    getStudentMarks {
      subject
      marks
    }
  }
`;

export default function Analytics() {
  const { loading, error, data } = useQuery<GetStudentMarksResponse>(GET_MARKS);

  if (loading) return <p className="text-white p-4">Loading analytics...</p>;
  if (error) return <p className="text-red-500 p-4">Error loading analytics.</p>;

  return (
    <div className="p-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data?.getStudentMarks}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Bar dataKey="marks" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
