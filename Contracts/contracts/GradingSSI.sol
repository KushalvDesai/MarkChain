// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GradingSSI - SSI Credential Anchor for Component-Based Academic Records
/// @notice Stores hashes of subject-specific VCs on-chain with component updates
/// @dev Optimized for continuous credential updates as component grades are added

contract GradingSSI is AccessControl, Initializable, ReentrancyGuard {
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant BACKEND_ROLE = keccak256("BACKEND_ROLE");

    /// @dev Student DID => Subject => Credential (current version with component history)
    mapping(bytes32 => mapping(string => SubjectCredential))
        private subjectCredentials;

    /// @dev Address => DID hash
    mapping(address => bytes32) public didRegistry;

    /// @dev DID hash => Address (reverse lookup for collision detection)
    mapping(bytes32 => address) public didToAddress;

    /// @dev Teacher => Subject => bool (O(1) lookup)
    mapping(address => mapping(string => bool)) public teacherSubjects;

    /// @dev Teacher => Subject count
    mapping(address => uint256) public teacherSubjectCount;

    /// @dev Subject => Component => bool (track valid components per subject)
    mapping(string => mapping(string => bool)) public validComponents;

    /// @dev Subject => Component count
    mapping(string => uint256) public subjectComponentCount;

    /// @dev Track if subject exists
    mapping(string => bool) public subjectExists;

    struct SubjectCredential {
        string currentIPFSHash; // Latest version of the complete VC
        address lastUpdatedBy; // Last issuer who updated
        uint256 createdAt; // When credential was first created
        uint256 lastUpdatedAt; // Last update timestamp
        uint256 expiresAt; // Expiration (0 = no expiration)
        bool revoked; // Revocation status
        uint256 totalComponents; // Total components graded
        uint256 version; // Version number (increments on update)
        ComponentUpdate[] updateHistory; // History of all component updates
    }

    struct ComponentUpdate {
        string componentName; // e.g., "Midterm", "Project", "Quiz1"
        string ipfsHash; // IPFS hash after this component was added
        address updatedBy; // Who added this component
        uint256 timestamp; // When it was added
        uint256 credentialVersion; // Version of credential at this update
    }

    /// Events
    event DIDRegistered(address indexed user, bytes32 indexed did);
    event RoleAssigned(
        address indexed user,
        bytes32 indexed role,
        address indexed admin
    );
    event RoleRevoked(
        address indexed user,
        bytes32 indexed role,
        address indexed admin
    );

    event SubjectCreated(string subject, address indexed admin);
    event SubjectAssigned(
        address indexed teacher,
        string subject,
        address indexed admin
    );
    event SubjectRemoved(
        address indexed teacher,
        string subject,
        address indexed admin
    );

    event ComponentRegistered(
        string subject,
        string component,
        address indexed admin
    );
    event ComponentRemoved(
        string subject,
        string component,
        address indexed admin
    );

    event CredentialCreated(
        bytes32 indexed studentDID,
        address indexed student,
        string subject,
        string ipfsHash,
        address indexed issuer,
        uint256 expiresAt
    );

    event ComponentGraded(
        bytes32 indexed studentDID,
        address indexed student,
        string subject,
        string component,
        string ipfsHash,
        address indexed gradedBy,
        uint256 version
    );

    event CredentialRevoked(
        bytes32 indexed studentDID,
        string subject,
        address indexed revokedBy
    );

    event CredentialExpired(bytes32 indexed studentDID, string subject);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // --- Role Guards ---

    modifier onlyTeacher() {
        require(hasRole(TEACHER_ROLE, msg.sender), "Not a teacher");
        _;
    }

    modifier onlyStudent() {
        require(hasRole(STUDENT_ROLE, msg.sender), "Not a student");
        _;
    }

    modifier onlyBackend() {
        require(hasRole(BACKEND_ROLE, msg.sender), "Not authorized backend");
        _;
    }

    // --- DID Registration ---

    /// @notice Register a DID for the caller (called by backend after did:ethr creation)
    /// @param did The decentralized identifier string
    function registerDID(string calldata did) external {
        require(
            didRegistry[msg.sender] == bytes32(0),
            "DID already registered"
        );
        require(bytes(did).length > 0, "DID cannot be empty");

        bytes32 hashedDID = keccak256(abi.encodePacked(did));

        // Check for hash collision
        require(
            didToAddress[hashedDID] == address(0),
            "DID hash collision detected"
        );

        didRegistry[msg.sender] = hashedDID;
        didToAddress[hashedDID] = msg.sender;

        emit DIDRegistered(msg.sender, hashedDID);
    }

    /// @notice Backend can register DID on behalf of user
    /// @param user The user's address
    /// @param did The DID string
    function registerDIDForUser(
        address user,
        string calldata did
    ) external onlyBackend {
        require(didRegistry[user] == bytes32(0), "DID already registered");
        require(bytes(did).length > 0, "DID cannot be empty");
        require(user != address(0), "Invalid address");

        bytes32 hashedDID = keccak256(abi.encodePacked(did));
        require(
            didToAddress[hashedDID] == address(0),
            "DID hash collision detected"
        );

        didRegistry[user] = hashedDID;
        didToAddress[hashedDID] = user;

        emit DIDRegistered(user, hashedDID);
    }

    // --- Role Management ---

    /// @notice Assign a role to a user
    function assignRole(
        address user,
        bytes32 role
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(user != address(0), "Invalid address");
        _grantRole(role, user);
        emit RoleAssigned(user, role, msg.sender);
    }

    /// @notice Revoke a role from a user
    function revokeRole(
        bytes32 role,
        address user
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        super.revokeRole(role, user);
        emit RoleRevoked(user, role, msg.sender);
    }

    // --- Subject Management ---

    /// @notice Create a new subject
    /// @param subject The subject identifier
    function createSubject(
        string calldata subject
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(subject).length > 0, "Subject cannot be empty");
        require(!subjectExists[subject], "Subject already exists");

        subjectExists[subject] = true;
        emit SubjectCreated(subject, msg.sender);
    }

    /// @notice Register a component for a subject
    /// @param subject The subject identifier
    /// @param component The component name (e.g., "Midterm", "Project1")
    function registerComponent(
        string calldata subject,
        string calldata component
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(subjectExists[subject], "Subject does not exist");
        require(bytes(component).length > 0, "Component cannot be empty");
        require(
            !validComponents[subject][component],
            "Component already registered"
        );

        validComponents[subject][component] = true;
        subjectComponentCount[subject]++;

        emit ComponentRegistered(subject, component, msg.sender);
    }

    /// @notice Remove a component from a subject
    /// @param subject The subject identifier
    /// @param component The component name
    function removeComponent(
        string calldata subject,
        string calldata component
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            validComponents[subject][component],
            "Component not registered"
        );

        validComponents[subject][component] = false;
        subjectComponentCount[subject]--;

        emit ComponentRemoved(subject, component, msg.sender);
    }

    /// @notice Assign a subject to a teacher
    function assignSubjectToTeacher(
        address teacher,
        string calldata subject
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(TEACHER_ROLE, teacher), "Not a teacher");
        require(subjectExists[subject], "Subject does not exist");
        require(!teacherSubjects[teacher][subject], "Subject already assigned");

        teacherSubjects[teacher][subject] = true;
        teacherSubjectCount[teacher]++;

        emit SubjectAssigned(teacher, subject, msg.sender);
    }

    /// @notice Remove a subject from a teacher
    function removeSubjectFromTeacher(
        address teacher,
        string calldata subject
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(teacherSubjects[teacher][subject], "Subject not assigned");

        teacherSubjects[teacher][subject] = false;
        teacherSubjectCount[teacher]--;

        emit SubjectRemoved(teacher, subject, msg.sender);
    }

    // --- Credential Issuance (Initial Creation) ---

    /// @notice Create initial credential for a student in a subject
    /// @param student The student's address
    /// @param subject The subject identifier
    /// @param ipfsHash Initial IPFS hash (may be empty shell VC)
    /// @param validityPeriod Validity in seconds (0 = no expiration)
    function createCredential(
        address student,
        string calldata subject,
        string calldata ipfsHash,
        uint256 validityPeriod
    ) external onlyBackend nonReentrant {
        bytes32 studentDID = didRegistry[student];
        require(studentDID != bytes32(0), "Student DID not registered");
        require(subjectExists[subject], "Subject does not exist");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_isValidIPFSHash(ipfsHash), "Invalid IPFS hash format");

        SubjectCredential storage credential = subjectCredentials[studentDID][
            subject
        ];
        require(credential.createdAt == 0, "Credential already exists");

        uint256 expiresAt = validityPeriod > 0
            ? block.timestamp + validityPeriod
            : 0;

        credential.currentIPFSHash = ipfsHash;
        credential.lastUpdatedBy = msg.sender;
        credential.createdAt = block.timestamp;
        credential.lastUpdatedAt = block.timestamp;
        credential.expiresAt = expiresAt;
        credential.revoked = false;
        credential.totalComponents = 0;
        credential.version = 0;

        emit CredentialCreated(
            studentDID,
            student,
            subject,
            ipfsHash,
            msg.sender,
            expiresAt
        );
    }

    // --- Component Grading (Updates Existing Credential) ---

    /// @notice Update credential with a new component grade
    /// @param student The student's address
    /// @param subject The subject identifier
    /// @param component The component being graded
    /// @param newIPFSHash Updated IPFS hash with new component data
    function updateCredentialWithComponent(
        address student,
        string calldata subject,
        string calldata component,
        string calldata newIPFSHash
    ) external onlyBackend nonReentrant {
        bytes32 studentDID = didRegistry[student];
        require(studentDID != bytes32(0), "Student DID not registered");
        require(subjectExists[subject], "Subject does not exist");
        require(
            validComponents[subject][component],
            "Component not registered for subject"
        );
        require(bytes(newIPFSHash).length > 0, "IPFS hash cannot be empty");
        require(_isValidIPFSHash(newIPFSHash), "Invalid IPFS hash format");

        SubjectCredential storage credential = subjectCredentials[studentDID][
            subject
        ];
        require(credential.createdAt > 0, "Credential does not exist");
        require(!credential.revoked, "Credential is revoked");

        // Check expiration
        if (
            credential.expiresAt > 0 && block.timestamp > credential.expiresAt
        ) {
            revert("Credential has expired");
        }

        // Increment version
        credential.version++;

        // Update main credential
        credential.currentIPFSHash = newIPFSHash;
        credential.lastUpdatedBy = msg.sender;
        credential.lastUpdatedAt = block.timestamp;
        credential.totalComponents++;

        // Add to update history
        credential.updateHistory.push(
            ComponentUpdate({
                componentName: component,
                ipfsHash: newIPFSHash,
                updatedBy: msg.sender,
                timestamp: block.timestamp,
                credentialVersion: credential.version
            })
        );

        emit ComponentGraded(
            studentDID,
            student,
            subject,
            component,
            newIPFSHash,
            msg.sender,
            credential.version
        );
    }

    /// @notice Batch update credentials for multiple students with same component
    /// @param students Array of student addresses
    /// @param subject The subject identifier
    /// @param component The component being graded
    /// @param ipfsHashes Array of IPFS hashes (one per student)
    function batchUpdateComponent(
        address[] calldata students,
        string calldata subject,
        string calldata component,
        string[] calldata ipfsHashes
    ) external onlyBackend nonReentrant {
        require(students.length == ipfsHashes.length, "Array length mismatch");
        require(students.length > 0, "Empty arrays");
        require(subjectExists[subject], "Subject does not exist");
        require(
            validComponents[subject][component],
            "Component not registered"
        );

        for (uint256 i = 0; i < students.length; i++) {
            address student = students[i];
            string calldata ipfsHash = ipfsHashes[i];

            bytes32 studentDID = didRegistry[student];
            if (studentDID == bytes32(0)) continue; // Skip if no DID

            SubjectCredential storage credential = subjectCredentials[
                studentDID
            ][subject];
            if (credential.createdAt == 0 || credential.revoked) continue; // Skip if no credential or revoked
            if (
                credential.expiresAt > 0 &&
                block.timestamp > credential.expiresAt
            ) continue; // Skip if expired

            if (bytes(ipfsHash).length == 0 || !_isValidIPFSHash(ipfsHash))
                continue; // Skip invalid hash

            credential.version++;
            credential.currentIPFSHash = ipfsHash;
            credential.lastUpdatedBy = msg.sender;
            credential.lastUpdatedAt = block.timestamp;
            credential.totalComponents++;

            credential.updateHistory.push(
                ComponentUpdate({
                    componentName: component,
                    ipfsHash: ipfsHash,
                    updatedBy: msg.sender,
                    timestamp: block.timestamp,
                    credentialVersion: credential.version
                })
            );

            emit ComponentGraded(
                studentDID,
                student,
                subject,
                component,
                ipfsHash,
                msg.sender,
                credential.version
            );
        }
    }

    // --- Credential Revocation ---

    /// @notice Revoke a student's credential for a subject
    function revokeCredential(
        address student,
        string calldata subject
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 studentDID = didRegistry[student];
        require(studentDID != bytes32(0), "Student DID not registered");

        SubjectCredential storage credential = subjectCredentials[studentDID][
            subject
        ];
        require(credential.createdAt > 0, "Credential does not exist");
        require(!credential.revoked, "Credential already revoked");

        credential.revoked = true;

        emit CredentialRevoked(studentDID, subject, msg.sender);
    }

    // --- Credential Access ---

    /// @notice Get student's own credential for a subject
    function getMyCredential(
        string calldata subject
    )
        external
        view
        onlyStudent
        returns (
            string memory ipfsHash,
            uint256 version,
            uint256 totalComponents,
            uint256 createdAt,
            uint256 lastUpdatedAt,
            uint256 expiresAt,
            bool revoked,
            bool isExpired
        )
    {
        bytes32 studentDID = didRegistry[msg.sender];
        SubjectCredential storage cred = subjectCredentials[studentDID][
            subject
        ];

        bool expired = cred.expiresAt > 0 && block.timestamp > cred.expiresAt;

        return (
            cred.currentIPFSHash,
            cred.version,
            cred.totalComponents,
            cred.createdAt,
            cred.lastUpdatedAt,
            cred.expiresAt,
            cred.revoked,
            expired
        );
    }

    /// @notice Get student's component update history
    function getMyComponentHistory(
        string calldata subject
    ) external view onlyStudent returns (ComponentUpdate[] memory) {
        bytes32 studentDID = didRegistry[msg.sender];
        return subjectCredentials[studentDID][subject].updateHistory;
    }

    /// @notice Get student's credential (admin/backend only)
    function getStudentCredential(
        address student,
        string calldata subject
    )
        external
        view
        returns (
            string memory ipfsHash,
            uint256 version,
            uint256 totalComponents,
            uint256 createdAt,
            uint256 lastUpdatedAt,
            uint256 expiresAt,
            bool revoked,
            bool isExpired
        )
    {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(BACKEND_ROLE, msg.sender),
            "Not authorized"
        );

        bytes32 studentDID = didRegistry[student];
        SubjectCredential storage cred = subjectCredentials[studentDID][
            subject
        ];

        bool expired = cred.expiresAt > 0 && block.timestamp > cred.expiresAt;

        return (
            cred.currentIPFSHash,
            cred.version,
            cred.totalComponents,
            cred.createdAt,
            cred.lastUpdatedAt,
            cred.expiresAt,
            cred.revoked,
            expired
        );
    }

    /// @notice Get student's component history (admin/backend only)
    function getStudentComponentHistory(
        address student,
        string calldata subject
    ) external view returns (ComponentUpdate[] memory) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                hasRole(BACKEND_ROLE, msg.sender),
            "Not authorized"
        );

        bytes32 studentDID = didRegistry[student];
        return subjectCredentials[studentDID][subject].updateHistory;
    }

    /// @notice Check if a credential is valid
    function isCredentialValid(
        address student,
        string calldata subject
    ) external view returns (bool) {
        bytes32 studentDID = didRegistry[student];
        if (studentDID == bytes32(0)) return false;

        SubjectCredential storage cred = subjectCredentials[studentDID][
            subject
        ];
        if (cred.createdAt == 0) return false;
        if (cred.revoked) return false;
        if (cred.expiresAt > 0 && block.timestamp > cred.expiresAt)
            return false;

        return true;
    }

    /// @notice Get credential statistics
    function getCredentialStats(
        address student,
        string calldata subject
    )
        external
        view
        returns (
            bool exists,
            bool isValid,
            uint256 componentsGraded,
            uint256 totalComponentsInSubject,
            uint256 completionPercentage
        )
    {
        bytes32 studentDID = didRegistry[student];
        SubjectCredential storage cred = subjectCredentials[studentDID][
            subject
        ];

        exists = cred.createdAt > 0;
        isValid =
            exists &&
            !cred.revoked &&
            (cred.expiresAt == 0 || block.timestamp <= cred.expiresAt);
        componentsGraded = cred.totalComponents;
        totalComponentsInSubject = subjectComponentCount[subject];

        if (totalComponentsInSubject > 0) {
            completionPercentage =
                (componentsGraded * 100) /
                totalComponentsInSubject;
        } else {
            completionPercentage = 0;
        }

        return (
            exists,
            isValid,
            componentsGraded,
            totalComponentsInSubject,
            completionPercentage
        );
    }

    // --- Utility Functions ---

    /// @notice Validate IPFS hash format
    function _isValidIPFSHash(
        string calldata ipfsHash
    ) internal pure returns (bool) {
        bytes memory hashBytes = bytes(ipfsHash);

        // IPFS CIDv0: "Qm..." (46 chars)
        if (
            hashBytes.length == 46 && hashBytes[0] == "Q" && hashBytes[1] == "m"
        ) {
            return true;
        }

        // IPFS CIDv1: "b..." (59+ chars)
        if (hashBytes.length >= 59 && hashBytes[0] == "b") {
            return true;
        }

        return false;
    }

    /// @notice Check if teacher has subject
    function hasSubject(
        address teacher,
        string calldata subject
    ) external view returns (bool) {
        return teacherSubjects[teacher][subject];
    }

    /// @notice Check if component is valid for subject
    function isValidComponent(
        string calldata subject,
        string calldata component
    ) external view returns (bool) {
        return validComponents[subject][component];
    }

    /// @notice Get total subjects assigned to teacher
    function getTeacherSubjectCount(
        address teacher
    ) external view returns (uint256) {
        return teacherSubjectCount[teacher];
    }

    /// @notice Get total components in a subject
    function getSubjectComponentCount(
        string calldata subject
    ) external view returns (uint256) {
        return subjectComponentCount[subject];
    }
}
