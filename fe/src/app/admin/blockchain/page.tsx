"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { GRADING_SSI_CONTRACT_ADDRESS, GRADING_SSI_ABI } from "@/config/contractConfig";
import { useAuth } from "@/hooks/useAuth";
import DynamicNavbar from "@/components/DynamicNavbar";
import MagicBento from "@/components/MagicBento";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  useAssignBlockchainRole,
  useAssignSubjectToTeacher,
  useRemoveSubjectFromTeacher,
  useRevokeBlockchainCredential,
  useGetBlockchainNetworkInfo,
  useTestIPFSConnection
} from "@/hooks/useBlockchain";
import {
  useCreateCredential,
  useUpdateCredentialWithComponent,
  useCreateSubject,
  useRegisterComponent
} from "@/hooks/useCredentialManagement";
import { useGetAllUsers } from "@/hooks/useGraphQL";
import { UserRole } from "@/gql/types";

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userAddress: string, role: string) => void;
  users: any[];
  loading: boolean;
}

function AssignRoleModal({ isOpen, onClose, onAssign, users, loading }: AssignRoleModalProps) {
  const [selectedUser, setSelectedUser] = useState("");
  // Role string constants (backend will convert to keccak256 hashes)
  const STUDENT_ROLE = "STUDENT_ROLE";
  const TEACHER_ROLE = "TEACHER_ROLE";
  const [selectedRole, setSelectedRole] = useState(STUDENT_ROLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      onAssign(selectedUser, selectedRole);
      setSelectedUser("");
      setSelectedRole(STUDENT_ROLE);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-6">Assign Blockchain Role</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.walletAddress} value={user.walletAddress}>
                  {user.name || user.email || 'Anonymous'} ({user.walletAddress.slice(0, 8)}...)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Blockchain Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value={STUDENT_ROLE}>Student Role</option>
              <option value={TEACHER_ROLE}>Teacher Role</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors text-white"
            >
              {loading ? 'Assigning...' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SubjectManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (teacherAddress: string, subject: string) => void;
  onRemove: (teacherAddress: string, subject: string) => void;
  teachers: any[];
  loading: boolean;
}

function SubjectManagementModal({ isOpen, onClose, onAssign, onRemove, teachers, loading }: SubjectManagementModalProps) {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [action, setAction] = useState<'assign' | 'remove'>('assign');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacher && subject) {
      if (action === 'assign') {
        onAssign(selectedTeacher, subject);
      } else {
        onRemove(selectedTeacher, subject);
      }
      setSelectedTeacher("");
      setSubject("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-6">Manage Teacher Subjects</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'assign' | 'remove')}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="assign">Assign Subject</option>
              <option value="remove">Remove Subject</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Choose a teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher.walletAddress} value={teacher.walletAddress}>
                  {teacher.name || teacher.email || 'Anonymous Teacher'} ({teacher.walletAddress.slice(0, 8)}...)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject name"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors text-white ${action === 'assign'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
            >
              {loading ? 'Processing...' : (action === 'assign' ? 'Assign' : 'Remove')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RevokeCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevoke: (studentAddress: string, subject: string) => void;
  students: any[];
  loading: boolean;
}

function RevokeCredentialModal({ isOpen, onClose, onRevoke, students, loading }: RevokeCredentialModalProps) {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent && subject) {
      onRevoke(selectedStudent, subject);
      setSelectedStudent("");
      setSubject("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-6">Revoke Student Credential</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.walletAddress} value={student.walletAddress}>
                  {student.name || student.email || 'Anonymous Student'} ({student.walletAddress.slice(0, 8)}...)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject name"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors text-white"
            >
              {loading ? 'Revoking...' : 'Revoke Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Credential Modal
interface CreateCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (studentAddress: string, subject: string, ipfsHash: string, validityPeriod: number) => void;
  students: any[];
  loading: boolean;
}

function CreateCredentialModal({ isOpen, onClose, onCreate, students, loading }: CreateCredentialModalProps) {
  const [studentAddress, setStudentAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [validityPeriod, setValidityPeriod] = useState('31536000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentAddress && subject && ipfsHash && validityPeriod) {
      onCreate(studentAddress, subject, ipfsHash, parseInt(validityPeriod));
      setStudentAddress(''); setSubject(''); setIpfsHash(''); setValidityPeriod('31536000');
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Create Credential</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Student Address *</label>
            <select value={studentAddress} onChange={e => setStudentAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none">
              <option value="">Select student</option>
              {students.map(s => (
                <option key={s.walletAddress} value={s.walletAddress}>
                  {s.name || s.studentId || s.walletAddress}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              placeholder="e.g., Mathematics" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">IPFS Hash *</label>
            <input type="text" value={ipfsHash} onChange={e => setIpfsHash(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              placeholder="QmXyZ..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Validity Period (seconds)</label>
            <input type="number" value={validityPeriod} onChange={e => setValidityPeriod(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              placeholder="31536000 (1 year)" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !studentAddress || !subject || !ipfsHash}
              className="flex-1 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Update Component Modal
interface UpdateComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (studentAddress: string, subject: string, component: string, ipfsHash: string) => void;
  students: any[];
  loading: boolean;
}

function UpdateComponentModal({ isOpen, onClose, onUpdate, students, loading }: UpdateComponentModalProps) {
  const [studentAddress, setStudentAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [component, setComponent] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentAddress && subject && component && ipfsHash) {
      onUpdate(studentAddress, subject, component, ipfsHash);
      setStudentAddress(''); setSubject(''); setComponent(''); setIpfsHash('');
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Update Credential Component</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Student Address *</label>
            <select value={studentAddress} onChange={e => setStudentAddress(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-400 focus:outline-none">
              <option value="">Select student</option>
              {students.map(s => (
                <option key={s.walletAddress} value={s.walletAddress}>
                  {s.name || s.studentId || s.walletAddress}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-400 focus:outline-none"
              placeholder="e.g., Mathematics" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Component *</label>
            <input type="text" value={component} onChange={e => setComponent(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-400 focus:outline-none"
              placeholder="e.g., Midterm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">IPFS Hash *</label>
            <input type="text" value={ipfsHash} onChange={e => setIpfsHash(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-400 focus:outline-none"
              placeholder="QmAbc..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !studentAddress || !subject || !component || !ipfsHash}
              className="flex-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Subject Modal
interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (subjectName: string, description: string, credits: string) => void;
  loading: boolean;
  blockchainStatus: string;
}

function CreateSubjectModal({ isOpen, onClose, onCreate, loading, blockchainStatus }: CreateSubjectModalProps) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject) {
      onCreate(subject, description, credits);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSubject(''); setDescription(''); setCredits('');
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Create Subject</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Subject Name *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-teal-400 focus:outline-none disabled:opacity-50"
              placeholder="e.g., Mathematics" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-teal-400 focus:outline-none disabled:opacity-50"
              placeholder="e.g., Advanced calculus and linear algebra" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Credits</label>
            <input type="number" value={credits} onChange={e => setCredits(e.target.value)}
              disabled={loading}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-teal-400 focus:outline-none disabled:opacity-50"
              placeholder="e.g., 4" min="1" />
          </div>

          {/* Blockchain status indicator */}
          {blockchainStatus && (
            <div className="flex items-center gap-2 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <svg className="w-4 h-4 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-sm text-teal-300">{blockchainStatus}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} disabled={loading}
              className="flex-1 px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
            <button type="submit" disabled={loading || !subject}
              className="flex-1 px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">
              {loading ? 'Processing...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Register Component Modal
interface RegisterComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (subject: string, component: string) => void;
  loading: boolean;
}

function RegisterComponentModal({ isOpen, onClose, onRegister, loading }: RegisterComponentModalProps) {
  const [subject, setSubject] = useState('');
  const [component, setComponent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && component) {
      onRegister(subject, component);
      setSubject(''); setComponent('');
      onClose();
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Register Component</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              placeholder="e.g., Mathematics" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Component Name *</label>
            <input type="text" value={component} onChange={e => setComponent(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
              placeholder="e.g., Midterm" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={loading || !subject || !component}
              className="flex-1 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBlockchainPage() {
  const { user } = useAuth();
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showSubjectCreateModal, setShowSubjectCreateModal] = useState(false);
  const [showRegisterComponentModal, setShowRegisterComponentModal] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState('');
  const [createSubjectProcessing, setCreateSubjectProcessing] = useState(false);

  // Hooks for blockchain operations
  const [assignRole, { loading: assignRoleLoading }] = useAssignBlockchainRole();
  const [assignSubject, { loading: assignSubjectLoading }] = useAssignSubjectToTeacher();
  const [removeSubject, { loading: removeSubjectLoading }] = useRemoveSubjectFromTeacher();
  const [revokeCredential, { loading: revokeCredentialLoading }] = useRevokeBlockchainCredential();

  // Hooks for credential management
  const [createCredential, { loading: createCredentialLoading }] = useCreateCredential();
  const [updateCredentialComponent, { loading: updateComponentLoading }] = useUpdateCredentialWithComponent();
  const [createSubject, { loading: createSubjectLoading }] = useCreateSubject();
  const [registerComponent, { loading: registerComponentLoading }] = useRegisterComponent();

  // Get network info and users
  const { data: networkData } = useGetBlockchainNetworkInfo();
  const { data: ipfsData } = useTestIPFSConnection();
  const { data: usersData, loading: usersLoading } = useGetAllUsers();

  const users = usersData?.getAllUsers || [];
  const teachers = users.filter(user => user.role === UserRole.TEACHER);
  const students = users.filter(user => user.role === UserRole.STUDENT);

  const handleAssignRole = async (userAddress: string, role: string) => {
    try {
      const result = await assignRole({
        variables: {
          input: {
            userWalletAddress: userAddress,
            role
          }
        }
      });

      if (result.data?.assignBlockchainRole.success) {
        alert(`Successfully assigned role to user`);
      } else {
        alert(`Failed to assign role: ${result.data?.assignBlockchainRole.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleAssignSubject = async (teacherAddress: string, subject: string) => {
    try {
      const result = await assignSubject({
        variables: {
          input: {
            teacherAddress,
            subject
          }
        }
      });

      if (result.data?.assignSubjectToTeacher.success) {
        alert(`Successfully assigned subject ${subject} to teacher`);
      } else {
        alert(`Failed to assign subject: ${result.data?.assignSubjectToTeacher.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRemoveSubject = async (teacherAddress: string, subject: string) => {
    try {
      const result = await removeSubject({
        variables: {
          input: {
            teacherAddress,
            subject
          }
        }
      });

      if (result.data?.removeSubjectFromTeacher.success) {
        alert(`Successfully removed subject ${subject} from teacher`);
      } else {
        alert(`Failed to remove subject: ${result.data?.removeSubjectFromTeacher.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleRevokeCredential = async (studentAddress: string, subject: string) => {
    try {
      const result = await revokeCredential({
        variables: {
          input: {
            studentAddress,
            subject
          }
        }
      });

      if (result.data?.revokeBlockchainCredential.success) {
        alert(`Successfully revoked credential for subject ${subject}`);
      } else {
        alert(`Failed to revoke credential: ${result.data?.revokeBlockchainCredential.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateCredential = async (studentAddress: string, subject: string, ipfsHash: string, validityPeriod: number) => {
    try {
      const result = await createCredential({
        variables: {
          input: {
            studentAddress,
            subject,
            ipfsHash,
            validityPeriod
          }
        }
      });

      if (result.data?.createCredential.success) {
        alert(`Successfully created credential for ${subject}`);
      } else {
        alert(`Failed to create credential: ${result.data?.createCredential.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateCredentialComponent = async (studentAddress: string, subject: string, component: string, ipfsHash: string) => {
    try {
      const result = await updateCredentialComponent({
        variables: {
          input: {
            studentAddress,
            subject,
            component,
            ipfsHash
          }
        }
      });

      if (result.data?.updateCredentialWithComponent.success) {
        alert(`Successfully updated credential component for ${subject}`);
      } else {
        alert(`Failed to update component: ${result.data?.updateCredentialWithComponent.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateSubject = async (subjectName: string, description: string, credits: string) => {
    setCreateSubjectProcessing(true);
    setBlockchainStatus('');

    try {
      // Step 1: Check MetaMask availability
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      // Step 2: Create ethers provider and signer from MetaMask
      setBlockchainStatus('Connecting to MetaMask...');
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Step 3: Create contract instance
      const contract = new Contract(
        GRADING_SSI_CONTRACT_ADDRESS,
        GRADING_SSI_ABI,
        signer
      );

      // Step 4: Call createSubject on the smart contract (prompts MetaMask)
      setBlockchainStatus('Waiting for MetaMask approval...');
      const tx = await contract.createSubject(subjectName);

      // Capture the hash immediately — ethers v6 proxy objects can lose reference
      const txHash = tx.hash;
      console.log('Transaction sent, hash:', txHash);

      if (!txHash) {
        throw new Error('Transaction was sent but no hash was returned. Please try again.');
      }

      // Step 5: Wait for the transaction to be mined
      setBlockchainStatus(`Transaction submitted (${txHash.slice(0, 10)}...). Waiting for confirmation...`);
      await tx.wait();

      // Step 6: Send the transaction hash to the backend via GraphQL
      setBlockchainStatus('Transaction confirmed! Saving to database...');
      const result = await createSubject({
        variables: {
          input: {
            subjectName,
            transactionHash: txHash,
            ...(description ? { description } : {}),
            ...(credits ? { credits: parseInt(credits) } : {}),
          }
        }
      });

      if (result.data?.createSubject.success) {
        alert(`Successfully created subject: ${subjectName}\nTx Hash: ${txHash}`);
        setShowSubjectCreateModal(false);
      } else {
        alert(`Blockchain transaction succeeded but backend failed to save subject: ${subjectName}`);
      }
    } catch (error: any) {
      console.error('CreateSubject error:', error);

      // Handle specific MetaMask/ethers errors
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        alert('Transaction was rejected in MetaMask.');
      } else if (error.code === 'CALL_EXCEPTION') {
        alert(`Smart contract error: ${error.reason || error.message}`);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setCreateSubjectProcessing(false);
      setBlockchainStatus('');
    }
  };

  const handleRegisterComponent = async (subjectName: string, componentName: string) => {
    try {
      const result = await registerComponent({
        variables: {
          input: {
            subjectName,
            componentName
          }
        }
      });

      if (result.data?.registerComponent.success) {
        alert(`Successfully registered component ${componentName} for ${subjectName}`);
      } else {
        alert(`Failed to register component: ${componentName}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };


  const networkInfo = networkData?.getBlockchainNetworkInfo;
  const ipfsConnected = ipfsData?.testIPFSConnection;

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#0b0b12' }}>
        <DynamicNavbar />

        <div className="p-6 pb-2">
          <h1 className="text-3xl font-bold text-white mb-2">
            Blockchain Administration
          </h1>
          <p className="text-gray-400">
            Manage blockchain roles, subjects, and credentials
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-4">
          {/* System Status */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl" style={{ backgroundColor: '#12121a' }}>
            <MagicBento
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={400}
              particleCount={10}
              glowColor="180, 180, 200"
              cards={[{
                color: "transparent",
                title: "System Status",
                description: "Blockchain network and IPFS connectivity",
                label: "Status",
                children: (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">Blockchain Network</span>
                      <span className={`flex items-center ${networkInfo?.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${networkInfo?.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        {networkInfo?.isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-gray-300">IPFS Connection</span>
                      <span className={`flex items-center ${ipfsConnected ? 'text-green-400' : 'text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${ipfsConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        {ipfsConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>

                    {networkInfo && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network:</span>
                          <span className="text-gray-300">{networkInfo.network}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Chain ID:</span>
                          <span className="text-gray-300">{networkInfo.chainId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contract:</span>
                          <span className="text-gray-300 font-mono text-xs">
                            {networkInfo.contractAddress.slice(0, 8)}...{networkInfo.contractAddress.slice(-6)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }]}
            />
          </div>

          {/* User Statistics */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-transparent before:rounded-2xl" style={{ backgroundColor: '#12121a' }}>
            <MagicBento
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={400}
              particleCount={10}
              glowColor="180, 180, 200"
              cards={[{
                color: "transparent",
                title: "User Statistics",
                description: "Platform user overview",
                label: "Users",
                children: (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{teachers.length}</div>
                        <div className="text-sm text-gray-400">Teachers</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{students.length}</div>
                        <div className="text-sm text-gray-400">Students</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{users.length}</div>
                      <div className="text-sm text-gray-400">Total Users</div>
                    </div>
                  </div>
                )
              }]}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-6">
          <button
            onClick={() => setShowAssignRoleModal(true)}
            className="p-6 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-blue-500/30 transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-blue-600/5 hover:from-blue-500/10 hover:to-blue-600/10 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/30 transition-colors">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Assign Blockchain Role</h3>
              <p className="text-sm text-gray-400">Grant teacher or student roles to users</p>
            </div>
          </button>

          <button
            onClick={() => setShowSubjectModal(true)}
            className="p-6 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-green-500/30 transition-all duration-300 bg-gradient-to-br from-green-500/5 to-green-600/5 hover:from-green-500/10 hover:to-green-600/10 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-500/30 transition-colors">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Manage Teacher Subjects</h3>
              <p className="text-sm text-gray-400">Assign or remove subjects from teachers</p>
            </div>
          </button>

          <button
            onClick={() => setShowRevokeModal(true)}
            className="p-6 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-red-500/30 transition-all duration-300 bg-gradient-to-br from-red-500/5 to-red-600/5 hover:from-red-500/10 hover:to-red-600/10 group"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-500/30 transition-colors">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Revoke Credentials</h3>
              <p className="text-sm text-gray-400">Remove blockchain credentials from students</p>
            </div>
          </button>
        </div>

        {/* Credential Management Actions */}
        <div className="px-6 pb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Credential Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowCredentialModal(true)}
              className="p-4 backdrop-blur-xl border border-white/10 rounded-xl hover:border-purple-500/30 transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-purple-600/5 hover:from-purple-500/10 hover:to-purple-600/10 group"
            >
              <div className="text-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Create Credential</h3>
                <p className="text-xs text-gray-400">Issue new credential</p>
              </div>
            </button>

            <button
              onClick={() => setShowComponentModal(true)}
              className="p-4 backdrop-blur-xl border border-white/10 rounded-xl hover:border-indigo-500/30 transition-all duration-300 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 hover:from-indigo-500/10 hover:to-indigo-600/10 group"
            >
              <div className="text-center">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-500/30 transition-colors">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Update Component</h3>
                <p className="text-xs text-gray-400">Update credential data</p>
              </div>
            </button>

            <button
              onClick={() => setShowSubjectCreateModal(true)}
              className="p-4 backdrop-blur-xl border border-white/10 rounded-xl hover:border-teal-500/30 transition-all duration-300 bg-gradient-to-br from-teal-500/5 to-teal-600/5 hover:from-teal-500/10 hover:to-teal-600/10 group"
            >
              <div className="text-center">
                <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-500/30 transition-colors">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Create Subject</h3>
                <p className="text-xs text-gray-400">Add new subject</p>
              </div>
            </button>

            <button
              onClick={() => setShowRegisterComponentModal(true)}
              className="p-4 backdrop-blur-xl border border-white/10 rounded-xl hover:border-cyan-500/30 transition-all duration-300 bg-gradient-to-br from-cyan-500/5 to-cyan-600/5 hover:from-cyan-500/10 hover:to-cyan-600/10 group"
            >
              <div className="text-center">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-cyan-500/30 transition-colors">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">Register Component</h3>
                <p className="text-xs text-gray-400">Add component type</p>
              </div>
            </button>
          </div>
        </div>

        {/* Modals */}
        <AssignRoleModal
          isOpen={showAssignRoleModal}
          onClose={() => setShowAssignRoleModal(false)}
          onAssign={handleAssignRole}
          users={users}
          loading={assignRoleLoading}
        />

        <SubjectManagementModal
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          onAssign={handleAssignSubject}
          onRemove={handleRemoveSubject}
          teachers={teachers}
          loading={assignSubjectLoading || removeSubjectLoading}
        />

        <RevokeCredentialModal
          isOpen={showRevokeModal}
          onClose={() => setShowRevokeModal(false)}
          onRevoke={handleRevokeCredential}
          students={students}
          loading={revokeCredentialLoading}
        />

        <CreateCredentialModal
          isOpen={showCredentialModal}
          onClose={() => setShowCredentialModal(false)}
          onCreate={handleCreateCredential}
          students={students}
          loading={createCredentialLoading}
        />

        <UpdateComponentModal
          isOpen={showComponentModal}
          onClose={() => setShowComponentModal(false)}
          onUpdate={handleUpdateCredentialComponent}
          students={students}
          loading={updateComponentLoading}
        />

        <CreateSubjectModal
          isOpen={showSubjectCreateModal}
          onClose={() => setShowSubjectCreateModal(false)}
          onCreate={handleCreateSubject}
          loading={createSubjectProcessing || createSubjectLoading}
          blockchainStatus={blockchainStatus}
        />

        <RegisterComponentModal
          isOpen={showRegisterComponentModal}
          onClose={() => setShowRegisterComponentModal(false)}
          onRegister={handleRegisterComponent}
          loading={registerComponentLoading}
        />
      </div>
    </ProtectedRoute>
  );
}