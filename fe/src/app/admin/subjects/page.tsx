"use client";

import { useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { GRADING_SSI_CONTRACT_ADDRESS, GRADING_SSI_ABI } from "@/config/contractConfig";
import { useAuth } from "@/hooks/useAuth";
import DynamicNavbar from "@/components/DynamicNavbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
    useGetAllSubjects,
    useGetSubjectComponents,
    useCreateSubject,
    useRegisterComponent,
    useCreateCredential,
    useUpdateCredentialWithComponent,
    useCreateNewCredential,
} from "@/hooks/useCredentialManagement";
import {
    useTeacherSubjects,
    useGetTeacherSubjectsByTeacher,
} from "@/hooks/useTeacherSubjects";
import { useGetAllUsers } from "@/hooks/useGraphQL";
import { UserRole, Subject, Component, TeacherSubject } from "@/gql/types";

// ─── Tab type ───
type TabKey = "subjects" | "teacher-subjects" | "credentials";

export default function AdminSubjectsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>("subjects");

    // ── Shared state ──
    const [successMsg, setSuccessMsg] = useState("");
    const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 4000); };

    // ── Subject state ──
    const [showCreateSubjectModal, setShowCreateSubjectModal] = useState(false);
    const [showRegisterComponentModal, setShowRegisterComponentModal] = useState(false);
    const [viewComponentsSubject, setViewComponentsSubject] = useState("");
    const [blockchainStatus, setBlockchainStatus] = useState("");
    const [createSubjectProcessing, setCreateSubjectProcessing] = useState(false);
    const [subjectForm, setSubjectForm] = useState({ name: "", description: "", credits: "" });
    const [componentForm, setComponentForm] = useState({ subject: "", component: "", weightage: "", maxMarks: "" });

    // ── Teacher Subject state ──
    const [showCreateTSModal, setShowCreateTSModal] = useState(false);
    const [showEditTSModal, setShowEditTSModal] = useState(false);
    const [deletingTSId, setDeletingTSId] = useState<string | null>(null);
    const [editingTS, setEditingTS] = useState<TeacherSubject | null>(null);
    const [tsForm, setTsForm] = useState({ teacherWalletAddress: "", subjectCode: "", subjectName: "", academicYear: "", semester: "", batches: "", department: "" });
    const [tsEditForm, setTsEditForm] = useState({ subjectName: "", batches: "", semester: "", isActive: true });

    // ── Credential state ──
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [showUpdateComponentModal, setShowUpdateComponentModal] = useState(false);
    const [showNewCredentialModal, setShowNewCredentialModal] = useState(false);
    const [credForm, setCredForm] = useState({ studentAddress: "", subject: "", ipfsHash: "", validityPeriod: "31536000" });
    const [updateCompForm, setUpdateCompForm] = useState({ studentAddress: "", subject: "", component: "", ipfsHash: "" });
    const [newCredForm, setNewCredForm] = useState({ studentAddress: "", subjectName: "", studentName: "", grade: "", marks: "" });

    // ── Data hooks ──
    const { data: subjectsData, loading: subjectsLoading, refetch: refetchSubjects } = useGetAllSubjects();
    const allSubjects: Subject[] = subjectsData?.getAllSubjects || [];

    const { data: componentsData, loading: componentsLoading } = useGetSubjectComponents(viewComponentsSubject, { skip: !viewComponentsSubject });
    const subjectComponents: Component[] = componentsData?.getSubjectComponents || [];

    const [createSubjectMut, { loading: csLoading }] = useCreateSubject();
    const [registerComponentMut, { loading: rcLoading }] = useRegisterComponent();
    const [createCredentialMut, { loading: ccLoading }] = useCreateCredential();
    const [updateCredCompMut, { loading: ucLoading }] = useUpdateCredentialWithComponent();
    const [createNewCredMut, { loading: ncLoading }] = useCreateNewCredential();

    const { allSubjects: allTeacherSubjects, loading: tsLoading, refetchAll: refetchTS, createSubject: createTSMut, updateSubject: updateTSMut, deleteSubject: deleteTSMut } = useTeacherSubjects();
    const { data: usersData } = useGetAllUsers();
    const users = usersData?.getAllUsers || [];
    const teachers = users.filter(u => u.role === UserRole.TEACHER);
    const students = users.filter(u => u.role === UserRole.STUDENT);

    // ═══════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════

    // ── Create Subject (blockchain + backend) ──
    const handleCreateSubject = async () => {
        if (!subjectForm.name) { alert("Subject name is required"); return; }
        setCreateSubjectProcessing(true); setBlockchainStatus("");
        try {
            if (!window.ethereum) throw new Error("MetaMask not found");
            setBlockchainStatus("Connecting to MetaMask...");
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new Contract(GRADING_SSI_CONTRACT_ADDRESS, GRADING_SSI_ABI, signer);
            setBlockchainStatus("Waiting for MetaMask approval...");
            const tx = await contract.createSubject(subjectForm.name);
            const txHash = tx.hash;
            if (!txHash) throw new Error("No transaction hash returned");
            setBlockchainStatus(`Tx submitted (${txHash.slice(0, 10)}...). Confirming...`);
            await tx.wait();
            setBlockchainStatus("Confirmed! Saving to database...");
            const result = await createSubjectMut({
                variables: { input: { subjectName: subjectForm.name, transactionHash: txHash, ...(subjectForm.description ? { description: subjectForm.description } : {}), ...(subjectForm.credits ? { credits: parseInt(subjectForm.credits) } : {}) } },
            });
            if (result.data?.createSubject.success) {
                showSuccess(`Subject "${subjectForm.name}" created! Tx: ${txHash.slice(0, 10)}...`);
                setShowCreateSubjectModal(false);
                setSubjectForm({ name: "", description: "", credits: "" });
                refetchSubjects();
            }
        } catch (error: any) {
            if (error.code === "ACTION_REJECTED" || error.code === 4001) alert("Transaction rejected in MetaMask.");
            else alert(`Error: ${error.message}`);
        } finally { setCreateSubjectProcessing(false); setBlockchainStatus(""); }
    };

    // ── Register Component ──
    const handleRegisterComponent = async () => {
        if (!componentForm.subject || !componentForm.component) { alert("Subject and component name required"); return; }
        try {
            const result = await registerComponentMut({ variables: { input: { subjectName: componentForm.subject, componentName: componentForm.component, ...(componentForm.weightage ? { weightage: parseInt(componentForm.weightage) } : {}), ...(componentForm.maxMarks ? { maxMarks: parseInt(componentForm.maxMarks) } : {}) } } });
            if (result.data?.registerComponent.success) {
                showSuccess(`Component "${componentForm.component}" registered for ${componentForm.subject}`);
                setShowRegisterComponentModal(false);
                setComponentForm({ subject: "", component: "", weightage: "", maxMarks: "" });
                if (viewComponentsSubject === componentForm.subject) refetchSubjects();
            }
        } catch (error: any) { alert(`Error: ${error.message}`); }
    };

    // ── Create Teacher Subject ──
    const handleCreateTS = async () => {
        if (!tsForm.teacherWalletAddress || !tsForm.subjectCode || !tsForm.subjectName || !tsForm.academicYear || !tsForm.semester || !tsForm.batches) { alert("Fill all required fields"); return; }
        try {
            const result = await createTSMut({ variables: { input: { teacherWalletAddress: tsForm.teacherWalletAddress, subjectCode: tsForm.subjectCode, subjectName: tsForm.subjectName, academicYear: tsForm.academicYear, semester: tsForm.semester, batches: tsForm.batches.split(",").map(b => b.trim()), department: tsForm.department || undefined } } });
            if (result.data?.createTeacherSubject) {
                showSuccess("Teacher-subject assignment created!");
                setShowCreateTSModal(false);
                setTsForm({ teacherWalletAddress: "", subjectCode: "", subjectName: "", academicYear: "", semester: "", batches: "", department: "" });
                refetchTS();
            }
        } catch (error: any) { alert(`Error: ${error.message}`); }
    };

    // ── Update Teacher Subject ──
    const handleUpdateTS = async () => {
        if (!editingTS) return;
        try {
            const result = await updateTSMut({ variables: { input: { subjectId: editingTS._id, subjectName: tsEditForm.subjectName || undefined, batches: tsEditForm.batches ? tsEditForm.batches.split(",").map(b => b.trim()) : undefined, semester: tsEditForm.semester || undefined, isActive: tsEditForm.isActive } } });
            if (result.data?.updateTeacherSubject) { showSuccess("Updated!"); setShowEditTSModal(false); setEditingTS(null); refetchTS(); }
        } catch (error: any) { alert(`Error: ${error.message}`); }
    };

    // ── Delete Teacher Subject ──
    const handleDeleteTS = async (id: string) => {
        try {
            const result = await deleteTSMut({ variables: { subjectId: id } });
            if (result.data?.deleteTeacherSubject?.success) { showSuccess("Deleted!"); setDeletingTSId(null); refetchTS(); }
            else alert(result.data?.deleteTeacherSubject?.message || "Failed");
        } catch (error: any) { alert(`Error: ${error.message}`); }
    };

    const openEditTS = (ts: TeacherSubject) => {
        setEditingTS(ts);
        setTsEditForm({ subjectName: ts.subjectName, batches: ts.batches?.join(", ") || "", semester: ts.semester || "", isActive: ts.isActive !== false });
        setShowEditTSModal(true);
    };

    // ── Create Credential ──
    const handleCreateCredential = async () => {
        if (!credForm.studentAddress || !credForm.subject || !credForm.ipfsHash) { alert("Fill required fields"); return; }
        try {
            const result = await createCredentialMut({ variables: { input: { studentAddress: credForm.studentAddress, subject: credForm.subject, ipfsHash: credForm.ipfsHash, validityPeriod: parseInt(credForm.validityPeriod) } } });
            if (result.data?.createCredential.success) { showSuccess("Credential created!"); setShowCredentialModal(false); setCredForm({ studentAddress: "", subject: "", ipfsHash: "", validityPeriod: "31536000" }); }
        } catch (error: any) { alert(`Error: ${error.message}`); }
    };

    // ── Update Credential Component ──
    const handleUpdateCredComp = async () => {
        if (!updateCompForm.studentAddress || !updateCompForm.subject || !updateCompForm.component || !updateCompForm.ipfsHash) { alert("Fill required fields"); return; }
        try {
            const result = await updateCredCompMut({ variables: { input: updateCompForm } });
            if (result.data?.updateCredentialWithComponent.success) { showSuccess("Component updated!"); setShowUpdateComponentModal(false); setUpdateCompForm({ studentAddress: "", subject: "", component: "", ipfsHash: "" }); }
        } catch (error: any) { alert(`Error: ${error.message}`); }
    };

    // ── Create New Credential (blockchain + IPFS) ──
    const handleCreateNewCred = async () => {
        if (!newCredForm.studentAddress || !newCredForm.subjectName || !newCredForm.studentName || !newCredForm.grade) { alert("Fill required fields"); return; }
        try {
            const credentialData = JSON.stringify({ studentName: newCredForm.studentName, grade: newCredForm.grade, marks: newCredForm.marks ? parseInt(newCredForm.marks) : undefined });
            const result = await createNewCredMut({ variables: { input: { studentAddress: newCredForm.studentAddress, subjectName: newCredForm.subjectName, credentialData } } });
            if (result.data?.createNewCredential?.success) { showSuccess(`Credential created! Tx: ${result.data.createNewCredential.txHash?.slice(0, 10)}...`); setShowNewCredentialModal(false); setNewCredForm({ studentAddress: "", subjectName: "", studentName: "", grade: "", marks: "" }); }
            else alert(result.data?.createNewCredential?.message || "Failed");
        } catch (error: any) { alert(`Error: ${error.message}`); }
    };

    // ═══════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════
    const tabs: { key: TabKey; label: string; color: string }[] = [
        { key: "subjects", label: "Subjects & Components", color: "teal" },
        { key: "teacher-subjects", label: "Teacher Assignments", color: "green" },
        { key: "credentials", label: "Credential Management", color: "purple" },
    ];

    const inputCls = "w-full px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none";

    return (
        <ProtectedRoute>
            <div className="min-h-screen" style={{ backgroundColor: "#0b0b12" }}>
                <DynamicNavbar />

                {/* Header */}
                <div className="p-6 pb-2">
                    <h1 className="text-3xl font-bold text-white mb-1">Subject Management</h1>
                    <p className="text-gray-400">Manage subjects, components, teacher assignments, and credentials</p>
                </div>

                {/* Success Toast */}
                {successMsg && (
                    <div className="fixed top-6 right-6 z-50 px-6 py-3 bg-green-600/90 backdrop-blur rounded-xl text-white shadow-2xl animate-pulse">
                        {successMsg}
                    </div>
                )}

                {/* Tabs */}
                <div className="px-6 pt-4 flex gap-2">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? `bg-${t.color}-600 text-white shadow-lg` : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ════════════════ TAB: Subjects & Components ════════════════ */}
                {activeTab === "subjects" && (
                    <div className="p-6 space-y-6">
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => setShowCreateSubjectModal(true)} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Create Subject
                            </button>
                            <button onClick={() => setShowRegisterComponentModal(true)} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                                Register Component
                            </button>
                        </div>

                        {/* Subjects List */}
                        <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: "#12121a" }}>
                            <div className="p-5 border-b border-white/10">
                                <h2 className="text-xl font-bold text-white">All Subjects</h2>
                            </div>
                            {subjectsLoading ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400" /></div>
                            ) : allSubjects.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">No subjects found. Create one to get started.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Subject</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Credits</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Description</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                                        </tr></thead>
                                        <tbody>
                                            {allSubjects.map(s => (
                                                <tr key={s._id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setViewComponentsSubject(s.subjectName)}>
                                                    <td className="py-3 px-4 text-white font-medium">{s.subjectName}</td>
                                                    <td className="py-3 px-4 text-gray-300">{s.credits ?? "—"}</td>
                                                    <td className="py-3 px-4 text-gray-300 text-sm max-w-xs truncate">{s.description || "—"}</td>
                                                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{s.isActive ? "Active" : "Inactive"}</span></td>
                                                    <td className="py-3 px-4 text-gray-400 text-sm">{s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Components Viewer */}
                        <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6" style={{ backgroundColor: "#12121a" }}>
                            <h2 className="text-xl font-bold text-white mb-2">Subject Components</h2>
                            <p className="text-gray-400 text-sm mb-4">Select a subject to view its components, or click a row above</p>
                            <select value={viewComponentsSubject} onChange={e => setViewComponentsSubject(e.target.value)} className={`${inputCls} max-w-xs mb-4 focus:border-teal-400`}>
                                <option value="">Select subject...</option>
                                {allSubjects.filter(s => s.isActive).map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                            </select>
                            {viewComponentsSubject && (
                                componentsLoading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400" /></div>
                                    : subjectComponents.length === 0 ? <p className="text-gray-400 py-4">No components for {viewComponentsSubject}</p>
                                        : <table className="w-full"><thead><tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Component</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Weightage</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Max Marks</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                        </tr></thead><tbody>
                                                {subjectComponents.map(c => (
                                                    <tr key={c._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4 text-white font-medium">{c.componentName}</td>
                                                        <td className="py-3 px-4 text-gray-300">{c.weightage != null ? `${c.weightage}%` : "—"}</td>
                                                        <td className="py-3 px-4 text-gray-300">{c.maxMarks ?? "—"}</td>
                                                        <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{c.isActive ? "Active" : "Inactive"}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody></table>
                            )}
                        </div>
                    </div>
                )}

                {/* ════════════════ TAB: Teacher Assignments ════════════════ */}
                {activeTab === "teacher-subjects" && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Teacher Subject Assignments</h2>
                            <button onClick={() => setShowCreateTSModal(true)} className="px-5 py-2.5 bg-green-600 hover:bg-green-700 rounded-xl text-white text-sm font-medium transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Create Assignment
                            </button>
                        </div>
                        <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: "#12121a" }}>
                            {tsLoading ? (
                                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400" /></div>
                            ) : allTeacherSubjects.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">No assignments yet</div>
                            ) : (
                                <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Teacher</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Subject</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Code</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Year</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Sem</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Batches</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                                </tr></thead><tbody>
                                        {allTeacherSubjects.map((ts: TeacherSubject) => (
                                            <tr key={ts._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-3 px-4"><div className="text-white text-sm font-medium">{ts.teacherName || "Unknown"}</div><div className="text-gray-500 text-xs font-mono">{ts.teacherWalletAddress?.slice(0, 8)}...</div></td>
                                                <td className="py-3 px-4 text-white text-sm">{ts.subjectName}</td>
                                                <td className="py-3 px-4 text-gray-300 text-sm">{ts.subjectCode}</td>
                                                <td className="py-3 px-4 text-gray-300 text-sm">{ts.academicYear || "—"}</td>
                                                <td className="py-3 px-4 text-gray-300 text-sm">{ts.semester || "—"}</td>
                                                <td className="py-3 px-4 text-gray-300 text-sm">{ts.batches?.join(", ") || "—"}</td>
                                                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ts.isActive !== false ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{ts.isActive !== false ? "Active" : "Inactive"}</span></td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEditTS(ts)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => setDeletingTSId(ts._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody></table></div>
                            )}
                        </div>
                    </div>
                )}

                {/* ════════════════ TAB: Credential Management ════════════════ */}
                {activeTab === "credentials" && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => setShowCredentialModal(true)} className="p-6 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-500/30 transition-all bg-gradient-to-br from-purple-500/5 to-purple-600/5 hover:from-purple-500/10 hover:to-purple-600/10 group">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/30 transition-colors">
                                        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Create Credential</h3>
                                    <p className="text-sm text-gray-400">Issue with IPFS hash</p>
                                </div>
                            </button>
                            <button onClick={() => setShowUpdateComponentModal(true)} className="p-6 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-indigo-500/30 transition-all bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 hover:from-indigo-500/10 hover:to-indigo-600/10 group">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/30 transition-colors">
                                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Update Component</h3>
                                    <p className="text-sm text-gray-400">Update credential component</p>
                                </div>
                            </button>
                            <button onClick={() => setShowNewCredentialModal(true)} className="p-6 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-emerald-500/30 transition-all bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 hover:from-emerald-500/10 hover:to-emerald-600/10 group">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500/30 transition-colors">
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">New Credential</h3>
                                    <p className="text-sm text-gray-400">Blockchain + IPFS credential</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════ */}
                {/* MODALS                                      */}
                {/* ═══════════════════════════════════════════ */}

                {/* ── Create Subject Modal ── */}
                {showCreateSubjectModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Create Subject</h3>
                            <div className="space-y-3">
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject Name *</label>
                                    <input type="text" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} disabled={createSubjectProcessing} className={`${inputCls} focus:border-teal-400 disabled:opacity-50`} placeholder="e.g., Mathematics" /></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                                    <input type="text" value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} disabled={createSubjectProcessing} className={`${inputCls} focus:border-teal-400 disabled:opacity-50`} placeholder="e.g., Advanced calculus" /></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Credits</label>
                                    <input type="number" value={subjectForm.credits} onChange={e => setSubjectForm({ ...subjectForm, credits: e.target.value })} disabled={createSubjectProcessing} className={`${inputCls} focus:border-teal-400 disabled:opacity-50`} placeholder="e.g., 4" min="1" /></div>
                                {blockchainStatus && <div className="flex items-center gap-2 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg"><svg className="w-4 h-4 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span className="text-sm text-teal-300">{blockchainStatus}</span></div>}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => { if (!createSubjectProcessing) { setShowCreateSubjectModal(false); setSubjectForm({ name: "", description: "", credits: "" }); } }} disabled={createSubjectProcessing} className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-white transition-colors">Cancel</button>
                                    <button onClick={handleCreateSubject} disabled={createSubjectProcessing || !subjectForm.name} className="flex-1 px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">{createSubjectProcessing ? "Processing..." : "Create Subject"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Register Component Modal ── */}
                {showRegisterComponentModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Register Component</h3>
                            <div className="space-y-3">
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
                                    <select value={componentForm.subject} onChange={e => setComponentForm({ ...componentForm, subject: e.target.value })} className={`${inputCls} focus:border-cyan-400`}>
                                        <option value="">Select subject</option>
                                        {allSubjects.filter(s => s.isActive).map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                                    </select></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Component Name *</label>
                                    <input type="text" value={componentForm.component} onChange={e => setComponentForm({ ...componentForm, component: e.target.value })} className={`${inputCls} focus:border-cyan-400`} placeholder="e.g., Midterm" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Weightage (%)</label>
                                        <input type="number" value={componentForm.weightage} onChange={e => setComponentForm({ ...componentForm, weightage: e.target.value })} className={`${inputCls} focus:border-cyan-400`} placeholder="e.g., 30" min="0" max="100" /></div>
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Max Marks</label>
                                        <input type="number" value={componentForm.maxMarks} onChange={e => setComponentForm({ ...componentForm, maxMarks: e.target.value })} className={`${inputCls} focus:border-cyan-400`} placeholder="e.g., 100" min="0" /></div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowRegisterComponentModal(false)} className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Cancel</button>
                                    <button onClick={handleRegisterComponent} disabled={rcLoading || !componentForm.subject || !componentForm.component} className="flex-1 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">{rcLoading ? "Registering..." : "Register"}</button>
                                </div>                </div>
                        </div>
                    </div>
                )}

                {/* ── Create Teacher Subject Modal ── */}
                {showCreateTSModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-lg shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Create Teacher-Subject Assignment</h3>
                            <div className="space-y-3">
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Teacher *</label>
                                    <select value={tsForm.teacherWalletAddress} onChange={e => setTsForm({ ...tsForm, teacherWalletAddress: e.target.value })} className={`${inputCls} focus:border-green-400`}>
                                        <option value="">Select teacher...</option>
                                        {teachers.map(t => <option key={t.walletAddress} value={t.walletAddress}>{t.name || "Anonymous"} ({t.walletAddress.slice(0, 8)}...)</option>)}
                                    </select></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject Code *</label>
                                        <input type="text" value={tsForm.subjectCode} onChange={e => setTsForm({ ...tsForm, subjectCode: e.target.value })} className={`${inputCls} focus:border-green-400`} placeholder="MATH101" /></div>
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject Name *</label>
                                        <select value={tsForm.subjectName} onChange={e => setTsForm({ ...tsForm, subjectName: e.target.value })} className={`${inputCls} focus:border-green-400`}>
                                            <option value="">Select</option>
                                            {allSubjects.filter(s => s.isActive).map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                                        </select></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Academic Year *</label>
                                        <input type="text" value={tsForm.academicYear} onChange={e => setTsForm({ ...tsForm, academicYear: e.target.value })} className={`${inputCls} focus:border-green-400`} placeholder="2025-26" /></div>
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Semester *</label>
                                        <select value={tsForm.semester} onChange={e => setTsForm({ ...tsForm, semester: e.target.value })} className={`${inputCls} focus:border-green-400`}>
                                            <option value="">Select</option>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()}>Sem {s}</option>)}
                                        </select></div>
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Dept</label>
                                        <input type="text" value={tsForm.department} onChange={e => setTsForm({ ...tsForm, department: e.target.value })} className={`${inputCls} focus:border-green-400`} placeholder="CS" /></div>
                                </div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Batches * (comma-sep)</label>
                                    <input type="text" value={tsForm.batches} onChange={e => setTsForm({ ...tsForm, batches: e.target.value })} className={`${inputCls} focus:border-green-400`} placeholder="A, B, C" /></div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowCreateTSModal(false)} className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Cancel</button>
                                    <button onClick={handleCreateTS} className="flex-1 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors">Create</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Edit Teacher Subject Modal ── */}
                {showEditTSModal && editingTS && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2">Edit Teacher-Subject</h3>
                            <p className="text-gray-400 text-sm mb-4">Editing: <span className="text-white">{editingTS.subjectCode}</span></p>
                            <div className="space-y-3">
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject Name</label>
                                    <input type="text" value={tsEditForm.subjectName} onChange={e => setTsEditForm({ ...tsEditForm, subjectName: e.target.value })} className={`${inputCls} focus:border-blue-400`} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Batches</label>
                                        <input type="text" value={tsEditForm.batches} onChange={e => setTsEditForm({ ...tsEditForm, batches: e.target.value })} className={`${inputCls} focus:border-blue-400`} placeholder="A, B" /></div>
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Semester</label>
                                        <select value={tsEditForm.semester} onChange={e => setTsEditForm({ ...tsEditForm, semester: e.target.value })} className={`${inputCls} focus:border-blue-400`}>
                                            <option value="">Select</option>{[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()}>Sem {s}</option>)}
                                        </select></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-medium text-gray-300">Active</label>
                                    <button onClick={() => setTsEditForm({ ...tsEditForm, isActive: !tsEditForm.isActive })} className={`relative w-12 h-6 rounded-full transition-colors ${tsEditForm.isActive ? "bg-green-600" : "bg-gray-600"}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${tsEditForm.isActive ? "translate-x-6" : "translate-x-0"}`} />
                                    </button>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => { setShowEditTSModal(false); setEditingTS(null); }} className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Cancel</button>
                                    <button onClick={handleUpdateTS} className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Delete Teacher Subject Confirmation ── */}
                {deletingTSId && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-sm shadow-2xl text-center">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Delete Assignment</h3>
                            <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeletingTSId(null)} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Cancel</button>
                                <button onClick={() => handleDeleteTS(deletingTSId)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors">Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Create Credential Modal ── */}
                {showCredentialModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Create Credential</h3>
                            <div className="space-y-3">
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Student *</label>
                                    <select value={credForm.studentAddress} onChange={e => setCredForm({ ...credForm, studentAddress: e.target.value })} className={`${inputCls} focus:border-purple-400`}>
                                        <option value="">Select student</option>
                                        {students.map(s => <option key={s.walletAddress} value={s.walletAddress}>{s.name || s.studentId || s.walletAddress}</option>)}
                                    </select></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
                                    <select value={credForm.subject} onChange={e => setCredForm({ ...credForm, subject: e.target.value })} className={`${inputCls} focus:border-purple-400`}>
                                        <option value="">Select subject</option>
                                        {allSubjects.filter(s => s.isActive).map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                                    </select></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">IPFS Hash *</label>
                                    <input type="text" value={credForm.ipfsHash} onChange={e => setCredForm({ ...credForm, ipfsHash: e.target.value })} className={`${inputCls} focus:border-purple-400`} placeholder="QmXyZ..." /></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Validity Period (sec)</label>
                                    <input type="number" value={credForm.validityPeriod} onChange={e => setCredForm({ ...credForm, validityPeriod: e.target.value })} className={`${inputCls} focus:border-purple-400`} placeholder="31536000" /></div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowCredentialModal(false)} className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Cancel</button>
                                    <button onClick={handleCreateCredential} disabled={ccLoading || !credForm.studentAddress || !credForm.subject || !credForm.ipfsHash} className="flex-1 px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">{ccLoading ? "Creating..." : "Create"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Update Credential Component Modal ── */}
                {showUpdateComponentModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">Update Credential Component</h3>
                            <div className="space-y-3">
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Student *</label>
                                    <select value={updateCompForm.studentAddress} onChange={e => setUpdateCompForm({ ...updateCompForm, studentAddress: e.target.value })} className={`${inputCls} focus:border-indigo-400`}>
                                        <option value="">Select student</option>
                                        {students.map(s => <option key={s.walletAddress} value={s.walletAddress}>{s.name || s.studentId || s.walletAddress}</option>)}
                                    </select></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
                                    <select value={updateCompForm.subject} onChange={e => setUpdateCompForm({ ...updateCompForm, subject: e.target.value })} className={`${inputCls} focus:border-indigo-400`}>
                                        <option value="">Select subject</option>
                                        {allSubjects.filter(s => s.isActive).map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                                    </select></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Component *</label>
                                    <input type="text" value={updateCompForm.component} onChange={e => setUpdateCompForm({ ...updateCompForm, component: e.target.value })} className={`${inputCls} focus:border-indigo-400`} placeholder="e.g., Midterm" /></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">IPFS Hash *</label>
                                    <input type="text" value={updateCompForm.ipfsHash} onChange={e => setUpdateCompForm({ ...updateCompForm, ipfsHash: e.target.value })} className={`${inputCls} focus:border-indigo-400`} placeholder="QmAbc..." /></div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowUpdateComponentModal(false)} className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Cancel</button>
                                    <button onClick={handleUpdateCredComp} disabled={ucLoading || !updateCompForm.studentAddress || !updateCompForm.subject || !updateCompForm.component || !updateCompForm.ipfsHash} className="flex-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">{ucLoading ? "Updating..." : "Update"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Create New Credential (Blockchain + IPFS) Modal ── */}
                {showNewCredentialModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-900 rounded-2xl border border-white/10 p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-2">Create New Credential</h3>
                            <p className="text-gray-400 text-sm mb-4">Upload to IPFS and anchor on-chain</p>
                            <div className="space-y-3">
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Student *</label>
                                    <select value={newCredForm.studentAddress} onChange={e => setNewCredForm({ ...newCredForm, studentAddress: e.target.value })} className={`${inputCls} focus:border-emerald-400`}>
                                        <option value="">Select student</option>
                                        {students.map(s => <option key={s.walletAddress} value={s.walletAddress}>{s.name || s.studentId || s.walletAddress}</option>)}
                                    </select></div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Subject *</label>
                                    <select value={newCredForm.subjectName} onChange={e => setNewCredForm({ ...newCredForm, subjectName: e.target.value })} className={`${inputCls} focus:border-emerald-400`}>
                                        <option value="">Select subject</option>
                                        {allSubjects.filter(s => s.isActive).map(s => <option key={s._id} value={s.subjectName}>{s.subjectName}</option>)}
                                    </select></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Student Name *</label>
                                        <input type="text" value={newCredForm.studentName} onChange={e => setNewCredForm({ ...newCredForm, studentName: e.target.value })} className={`${inputCls} focus:border-emerald-400`} placeholder="John Doe" /></div>
                                    <div><label className="block text-xs font-medium text-gray-300 mb-1">Grade *</label>
                                        <select value={newCredForm.grade} onChange={e => setNewCredForm({ ...newCredForm, grade: e.target.value })} className={`${inputCls} focus:border-emerald-400`}>
                                            <option value="">Select</option>
                                            {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select></div>
                                </div>
                                <div><label className="block text-xs font-medium text-gray-300 mb-1">Marks (optional)</label>
                                    <input type="number" value={newCredForm.marks} onChange={e => setNewCredForm({ ...newCredForm, marks: e.target.value })} className={`${inputCls} focus:border-emerald-400`} placeholder="92" /></div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowNewCredentialModal(false)} className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">Cancel</button>
                                    <button onClick={handleCreateNewCred} disabled={ncLoading} className="flex-1 px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors">{ncLoading ? "Creating..." : "Issue Credential"}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </ProtectedRoute>
    );
}
