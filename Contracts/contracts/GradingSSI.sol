// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title GradingSSI - A Minimal SSI Credential Anchor for Academic Records
/// @notice Stores hashes of subject-specific VCs on-chain; full credential lives off-chain

contract GradingSSI is AccessControl {
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    /// @dev Student DID => Subject => Credential
    mapping(bytes32 => mapping(string => Credential)) private subjectCredentials;

    /// @dev Address => DID hash
    mapping(address => bytes32) public didRegistry;

    /// @dev Teacher => List of assigned subjects
    mapping(address => string[]) public teacherSubjects;

    struct Credential {
        string ipfsHash;
        address issuer;
        uint256 updatedAt;
    }

    /// Events
    event DIDRegistered(address indexed user, bytes32 did);
    event CredentialIssued(bytes32 indexed studentDID, address indexed issuer, string subject, string ipfsHash);
    event CredentialRevoked(bytes32 indexed studentDID, string subject);

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

    // --- DID Registration ---

    function registerDID(string calldata did) external {
        require(didRegistry[msg.sender] == bytes32(0), "DID already registered");
        bytes32 hashedDID = keccak256(abi.encodePacked(did));
        didRegistry[msg.sender] = hashedDID;
        emit DIDRegistered(msg.sender, hashedDID);
    }

    // --- Role Management ---

    function assignRole(address user, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, user);
    }

    // --- Subject Assignment ---

    function assignSubjectToTeacher(address teacher, string calldata subject) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(TEACHER_ROLE, teacher), "Not a teacher");
        teacherSubjects[teacher].push(subject);
    }

    function removeSubjectFromTeacher(address teacher, string calldata subject) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(TEACHER_ROLE, teacher), "Not a teacher");
        string[] storage subjects = teacherSubjects[teacher];
        for (uint i = 0; i < subjects.length; i++) {
            if (keccak256(bytes(subjects[i])) == keccak256(bytes(subject))) {
                subjects[i] = subjects[subjects.length - 1];
                subjects.pop();
                break;
            }
        }
    }

    // --- Credential Issuance / Update ---

    function issueOrUpdateCredential(
        address student,
        string calldata subject,
        string calldata ipfsHash
    ) external onlyTeacher {
        require(didRegistry[student] != bytes32(0), "Student DID not registered");
        require(_teacherHasSubject(msg.sender, subject), "Unauthorized subject");

        bytes32 studentDID = didRegistry[student];

        subjectCredentials[studentDID][subject] = Credential({
            ipfsHash: ipfsHash,
            issuer: msg.sender,
            updatedAt: block.timestamp
        });

        emit CredentialIssued(studentDID, msg.sender, subject, ipfsHash);
    }

    // --- Credential Revocation (Event Only) ---

    function revokeCredential(address student, string calldata subject) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bytes32 studentDID = didRegistry[student];
        emit CredentialRevoked(studentDID, subject);
    }

    // --- Credential Access ---

    function getMySubjectCredential(string calldata subject) external view onlyStudent returns (Credential memory) {
        return subjectCredentials[didRegistry[msg.sender]][subject];
    }

    function getStudentSubjectCredential(address student, string calldata subject)
        external
        view
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (Credential memory)
    {
        return subjectCredentials[didRegistry[student]][subject];
    }

    // --- Internal Helpers ---

    function _teacherHasSubject(address teacher, string calldata subject) internal view returns (bool) {
        string[] memory subjects = teacherSubjects[teacher];
        for (uint i = 0; i < subjects.length; i++) {
            if (keccak256(bytes(subjects[i])) == keccak256(bytes(subject))) {
                return true;
            }
        }
        return false;
    }
}
