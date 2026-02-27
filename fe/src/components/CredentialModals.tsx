import { useState } from 'react';

// Credential Management Modal Components

interface CreateCredentialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (studentAddress: string, subject: string, ipfsHash: string, validityPeriod: number) => void;
    students: any[];
    loading: boolean;
}

function CreateCredentialModal({ isOpen, onClose, onCreate, students, loading }: CreateCredentialModalProps) {
    const [selectedStudent, setSelectedStudent] = useState("");
    const [subject, setSubject] = useState("");
    const [ipfsHash, setIpfsHash] = useState("");
    const [validityPeriod, setValidityPeriod] = useState("31536000"); // 1 year in seconds

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudent && subject && ipfsHash) {
            onCreate(selectedStudent, subject, ipfsHash, parseInt(validityPeriod));
            setSelectedStudent("");
            setSubject("");
            setIpfsHash("");
            setValidityPeriod("31536000");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6">Create Credential</h3>
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
                                    {student.name || 'Anonymous'} ({student.walletAddress.slice(0, 8)}...)
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
                            placeholder="e.g., Mathematics"
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            IPFS Hash
                        </label>
                        <input
                            type="text"
                            value={ipfsHash}
                            onChange={(e) => setIpfsHash(e.target.value)}
                            placeholder="QmXyZ..."
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Validity Period (seconds)
                        </label>
                        <input
                            type="number"
                            value={validityPeriod}
                            onChange={(e) => setValidityPeriod(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">Default: 31536000 (1 year)</p>
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
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors text-white"
                        >
                            {loading ? 'Creating...' : 'Create Credential'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface UpdateComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (studentAddress: string, subject: string, component: string, ipfsHash: string) => void;
    students: any[];
    loading: boolean;
}

function UpdateComponentModal({ isOpen, onClose, onUpdate, students, loading }: UpdateComponentModalProps) {
    const [selectedStudent, setSelectedStudent] = useState("");
    const [subject, setSubject] = useState("");
    const [component, setComponent] = useState("");
    const [ipfsHash, setIpfsHash] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStudent && subject && component && ipfsHash) {
            onUpdate(selectedStudent, subject, component, ipfsHash);
            setSelectedStudent("");
            setSubject("");
            setComponent("");
            setIpfsHash("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6">Update Credential Component</h3>
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
                                    {student.name || 'Anonymous'} ({student.walletAddress.slice(0, 8)}...)
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
                            placeholder="e.g., Mathematics"
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Component
                        </label>
                        <input
                            type="text"
                            value={component}
                            onChange={(e) => setComponent(e.target.value)}
                            placeholder="e.g., Midterm, Final"
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            IPFS Hash
                        </label>
                        <input
                            type="text"
                            value={ipfsHash}
                            onChange={(e) => setIpfsHash(e.target.value)}
                            placeholder="QmAbc..."
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm"
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
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors text-white"
                        >
                            {loading ? 'Updating...' : 'Update Component'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface SubjectCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (subject: string) => void;
    loading: boolean;
}

function SubjectCreateModal({ isOpen, onClose, onCreate, loading }: SubjectCreateModalProps) {
    const [subject, setSubject] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject) {
            onCreate(subject);
            setSubject("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-6">Create Subject</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Subject Name
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Mathematics"
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
                            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors text-white"
                        >
                            {loading ? 'Creating...' : 'Create Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface ComponentRegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (subject: string, component: string) => void;
    loading: boolean;
}

function ComponentRegisterModal({ isOpen, onClose, onRegister, loading }: ComponentRegisterModalProps) {
    const [subject, setSubject] = useState("");
    const [component, setComponent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject && component) {
            onRegister(subject, component);
            setSubject("");
            setComponent("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl border border-white/10 p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-6">Register Component</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Mathematics"
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Component Name
                        </label>
                        <input
                            type="text"
                            value={component}
                            onChange={(e) => setComponent(e.target.value)}
                            placeholder="e.g., Midterm, Final, Quiz"
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
                            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg transition-colors text-white"
                        >
                            {loading ? 'Registering...' : 'Register Component'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
