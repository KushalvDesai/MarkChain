// Input Types
export interface VerifySignatureInput {
  walletAddress: string;
  signature: string;
  nonce: string;
}

export interface SendOTPInput {
  studentId: string;
}

export interface VerifyOTPInput {
  otp: string;
  name: string;
  studentId: string;
}

// User Types
export interface User {
  _id?: string;
  walletAddress: string;
  did?: string;
  role: UserRole;
  name?: string;
  email?: string;
  studentId?: string;
  subjects?: string[];
  isActive?: boolean;
  lastLogin?: string;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

// Response Types
export interface GenerateNonceResponse {
  generateNonce: {
    nonce: string;
    message: string;
  };
}

export interface VerifySignatureResponse {
  verifySignature: {
    accessToken: string;
    user: {
      walletAddress: string;
      did: string;
      role: UserRole;
      name?: string;
      email?: string;
    };
  };
}

export interface GetAllUsersResponse {
  getAllUsers: User[];
}

export interface GetUserProfileResponse {
  getUserProfile: User;
}

export interface GetUsersByRoleResponse {
  getUsersByRole: User[];
}

export interface SendOTPResponse {
  sendOTPForVerification: {
    success: boolean;
    message: string;
    email: string;
  };
}

export interface VerifyOTPResponse {
  verifyOTPAndUpdateProfile: {
    success: boolean;
    message: string;
    user: {
      id: string;
      name: string;
      studentId: string;
      isVerified: boolean;
      walletAddress: string;
      role: UserRole;
    };
  };
}

// Blockchain Input Types (matching backend schema)
export interface AssignRoleInput {
  userWalletAddress: string;
  role: string;
}

export interface SubjectAssignmentInput {
  teacherAddress: string;
  subject: string;
}

export interface RevokeCredentialInput {
  studentAddress: string;
  subject: string;
}

export interface LinkWalletInput {
  walletAddress: string;
}

export interface RegisterDIDInput {
  did: string;
}

export interface IssueBlockchainCredentialInput {
  studentAddress: string;
  subject: string;
  credentialData: string;
}

export interface VerifyCredentialInput {
  studentAddress: string;
  subject: string;
}

// Blockchain Response Types
export interface BlockchainOperationResponse {
  success: boolean;
  transactionHash?: string;
  message?: string;
  error?: string;
}

export interface BlockchainStatus {
  walletAddress?: string;
  didHash?: string;
  blockchainRole?: string;
  didRegistered: boolean;
  hasBlockchainRole: boolean;
  assignedSubjects: string[];
}

export interface BlockchainCredential {
  ipfsHash: string;
  issuer: string;
  updatedAt: string;
  subject: string;
  studentName: string;
  grade: string;
  blockchainTxHash: string;
}

export interface BlockchainNetworkInfo {
  contractAddress: string;
  walletAddress: string;
  network: string;
  chainId: number;
  isConnected: boolean;
}

// Blockchain Query Response Types
export interface GetMyBlockchainStatusResponse {
  getMyBlockchainStatus: BlockchainStatus;
}

export interface GetMyAssignedSubjectsResponse {
  getMyAssignedSubjects: string[];
}

export interface GetMySubjectCredentialResponse {
  getMySubjectCredential: BlockchainCredential;
}

export interface GetMyBlockchainCredentialsResponse {
  getMyBlockchainCredentials: BlockchainCredential[];
}

export interface VerifyBlockchainCredentialResponse {
  verifyBlockchainCredential: BlockchainCredential;
}

export interface GetBlockchainNetworkInfoResponse {
  getBlockchainNetworkInfo: BlockchainNetworkInfo;
}

export interface TestIPFSConnectionResponse {
  testIPFSConnection: boolean;
}

// Blockchain Mutation Response Types
export interface AssignBlockchainRoleResponse {
  assignBlockchainRole: {
    success: boolean;
    message: string;
    txHash?: string;
  };
}

export interface AssignSubjectToTeacherResponse {
  assignSubjectToTeacher: BlockchainOperationResponse;
}

export interface RemoveSubjectFromTeacherResponse {
  removeSubjectFromTeacher: BlockchainOperationResponse;
}

export interface RevokeBlockchainCredentialResponse {
  revokeBlockchainCredential: BlockchainOperationResponse;
}

export interface LinkWalletAddressResponse {
  linkWalletAddress: BlockchainOperationResponse;
}

export interface RegisterUserDIDResponse {
  registerUserDID: BlockchainOperationResponse;
}

export interface IssueBlockchainCredentialResponse {
  issueBlockchainCredential: BlockchainOperationResponse;
}

// Teacher Subject Types
export interface TeacherSubject {
  _id: string;
  teacherDID?: string;
  teacherName?: string;
  teacherWalletAddress: string;
  subjectCode: string;
  subjectName: string;
  academicYear: string;
  semester: string;
  batches: string[];
  department?: string;
  isActive?: boolean;
}

export interface UpdateTeacherSubjectInput {
  subjectId: string;
  subjectName?: string;
  batches?: string[];
  semester?: string;
}

export interface DeleteTeacherSubjectResponse {
  success: boolean;
  message: string;
}

export interface GetAllTeacherSubjectsResponse {
  getAllTeacherSubjects: TeacherSubject[];
}

export interface GetTeacherSubjectsByTeacherResponse {
  getTeacherSubjectsByTeacher: TeacherSubject[];
}

export interface UpdateTeacherSubjectResponse {
  updateTeacherSubject: TeacherSubject;
}

export interface DeleteTeacherSubjectMutationResponse {
  deleteTeacherSubject: DeleteTeacherSubjectResponse;
}

// Exam Schedule Types
export interface ExamSchedule {
  _id: string;
  subject: string;
  examName: string;
  examType?: string;
  examDate: string;
  duration?: number;
  totalMarks?: number;
  passingMarks?: number;
  venue: string;
  teacherWalletAddress?: string;
  teacherDID?: string;
  academicYear?: string;
  semester?: string;
  batch?: string;
  description?: string;
  status: string;
}

export interface CreateExamScheduleInput {
  subject: string;
  examName: string;
  examType: string;
  examDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  venue: string;
  teacherWalletAddress: string;
  academicYear: string;
  semester: string;
  batch: string;
  description?: string;
}

export interface UpdateExamScheduleInput {
  examId: string;
  venue?: string;
  examDate?: string;
  status?: string;
}

export interface GetAllExamSchedulesResponse {
  getAllExamSchedules: ExamSchedule[];
}

export interface GetExamScheduleByIdResponse {
  getExamScheduleById: ExamSchedule;
}

export interface CreateExamScheduleResponse {
  createExamSchedule: ExamSchedule;
}

export interface UpdateExamScheduleResponse {
  updateExamSchedule: ExamSchedule;
}

export interface DeleteExamScheduleResponse {
  success: boolean;
  message: string;
}

export interface DeleteExamScheduleMutationResponse {
  deleteExamSchedule: DeleteExamScheduleResponse;
}

// Credential Database Types (different from blockchain)
export interface RevokeCredentialDatabaseInput {
  credentialId: string;
  reason: string;
}

export interface RevokeCredentialDatabaseResult {
  success: boolean;
  message: string;
  credentialId: string;
}

export interface RevokeCredentialDatabaseResponse {
  revokeCredential: RevokeCredentialDatabaseResult;
}

// Student Query Types
export interface GetStudentsByBatchResponse {
  getStudentsByBatch: User[];
}

// Update User Profile Input (if not already defined)
export interface UpdateUserProfileDto {
  name?: string;
  studentId?: string;
  email?: string;
}

export interface UpdateUserProfileResponse {
  updateUserProfile: User;
}

// Teacher-Specific Types
export interface TeacherSubjectDetail {
  subjectCode: string;
  subjectName: string;
  academicYear: string;
  semester: string;
  batches: string[];
}

export interface TeacherCourseSetup {
  teacherDID: string;
  teacherName: string;
  assignedSubjects: TeacherSubjectDetail[];
  totalStudents: number;
  totalCredentials: number;
}

export interface TeacherStudent {
  studentDID: string;
  studentWalletAddress: string;
  studentName: string;
  studentId: string;
  batch: string;
  hasCredentials: boolean;
  subjects: string[];
}

export interface TeacherCredential {
  credentialId: string;
  studentDID: string;
  studentName: string;
  subject: string;
  grade: string;
  marks: number;
  issuedAt: string;
  ipfsHash: string;
  transactionHash: string;
}

export interface GetTeacherCourseSetupResponse {
  getTeacherCourseSetup: TeacherCourseSetup;
}

export interface GetTeacherStudentsResponse {
  getTeacherStudents: TeacherStudent[];
}

export interface GetTeacherCredentialsResponse {
  getTeacherCredentials: TeacherCredential[];
}


// Credential Management Types
export interface CreateCredentialInput {
  studentAddress: string;
  subject: string;
  ipfsHash: string;
  validityPeriod: number;
}

export interface UpdateCredentialWithComponentInput {
  studentAddress: string;
  subject: string;
  component: string;
  ipfsHash: string;
}

export interface CreateSubjectInput {
  subjectName: string;
  transactionHash: string;
  credits?: number;
  description?: string;
}

export interface RegisterComponentInput {
  subjectName: string;
  componentName: string;
  weightage?: number;
  maxMarks?: number;
}

// Subject & Component types (returned by mutations)
export interface Subject {
  _id: string;
  subjectName: string;
  blockchainHash?: string;
  credits?: number;
  description?: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Component {
  _id: string;
  componentName: string;
  subjectName: string;
  blockchainHash?: string;
  isActive: boolean;
  createdBy: string;
  weightage?: number;
  maxMarks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetStudentCredentialInput {
  studentAddress: string;
  subject: string;
}

export interface IsCredentialValidInput {
  studentAddress: string;
  subject: string;
}

export interface CredentialInfo {
  ipfsHash: string;
  version: number;
  totalComponents: number;
  createdAt: number;
  lastUpdatedAt: number;
  expiresAt: number;
  revoked: boolean;
  isExpired: boolean;
}

export interface CredentialMutationResponse {
  transactionHash: string;
  success: boolean;
  message: string;
}

export interface CreateCredentialResponse {
  createCredential: CredentialMutationResponse;
}

export interface UpdateCredentialWithComponentResponse {
  updateCredentialWithComponent: CredentialMutationResponse;
}

export interface CreateSubjectResponse {
  createSubject: {
    success: boolean;
    txHash: string;
    subject: Subject;
  };
}

export interface RegisterComponentResponse {
  registerComponent: {
    txHash: string;
    success: boolean;
    component: Component;
  };
}

export interface GetMyCredentialResponse {
  getMyCredential: CredentialInfo;
}

export interface GetStudentCredentialResponse {
  getStudentCredential: CredentialInfo;
}

export interface IsCredentialValidResponse {
  isCredentialValid: boolean;
}



