// GraphQL query types for student dashboard

export interface StudentMark {
  subject: string;
  marks: number;
}

export interface LatestCredential {
  subject: string;
  ipfsHash: string;
  issuer: string;
  updatedAt: string;
  subjectHash: string;
}

export interface GetStudentMarksResponse {
  getStudentMarks: StudentMark[];
}

export interface GetLatestCredentialResponse {
  getLatestCredential: LatestCredential;
}
