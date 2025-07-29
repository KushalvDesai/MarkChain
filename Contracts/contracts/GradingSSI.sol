// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title SSI-Based Academic Grading System
/// @notice Stores credential metadata on-chain while grades remain off-chain

contract GradingSSI is AccessControl {
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    struct Credential {
        string subject;
        string ipfsHash; // Off-chain encrypted or public IPFS hash
        address issuer;  // Teacher's address
        uint256 issuedAt;
    }

    /// @dev DID => list of credentials
    mapping(bytes32 => Credential[]) private credentialsByDID;

    /// @dev wallet => DID (hashed as bytes32)
    mapping(address => bytes32) public didRegistry;

    /// @dev (issuer => subject[]) to track allowed subjects
    mapping(address => string[]) public teacherSubjects;

    /// Events
    event DIDRegistered(address indexed user, bytes32 did);
    event CredentialIssued(bytes32 indexed studentDID, address indexed issuer, string subject, string ipfsHash);

    modifier onlyTeacher() {
        require(hasRole(TEACHER_ROLE, msg.sender), "Not a teacher");
        _;
    }

    modifier onlyStudent() {
        require(hasRole(STUDENT_ROLE, msg.sender), "Not a student");
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// Register user DID (can be called once per user)
    function registerDID(string calldata did) external {
        require(didRegistry[msg.sender] == bytes32(0), "DID already registered");
        bytes32 hashedDID = keccak256(abi.encodePacked(did));
        didRegistry[msg.sender] = hashedDID;
        emit DIDRegistered(msg.sender, hashedDID);
    }

    /// Admin assigns roles
    function assignRole(address user, bytes32 role) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, user);
    }

    /// Admin assigns subject(s) to a teacher
    function assignSubjectToTeacher(address teacher, string calldata subject) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(hasRole(TEACHER_ROLE, teacher), "Not a teacher");
        teacherSubjects[teacher].push(subject);
    }

    /// Teacher issues credential to a student DID
    function issueCredential(address student, string calldata subject, string calldata ipfsHash) external onlyTeacher {
        require(didRegistry[student] != bytes32(0), "Student DID not registered");
        bytes32 studentDID = didRegistry[student];
        require(_teacherHasSubject(msg.sender, subject), "Not authorized to issue for this subject");

        Credential memory cred = Credential({
            subject: subject,
            ipfsHash: ipfsHash,
            issuer: msg.sender,
            issuedAt: block.timestamp
        });

        credentialsByDID[studentDID].push(cred);
        emit CredentialIssued(studentDID, msg.sender, subject, ipfsHash);
    }

    /// Student can fetch their credentials
    function getMyCredentials() external view onlyStudent returns (Credential[] memory) {
        return credentialsByDID[didRegistry[msg.sender]];
    }

    /// Teacher can fetch credentials they issued to a specific student
    function getIssuedCredentials(address student) external view onlyTeacher returns (Credential[] memory) {
        bytes32 studentDID = didRegistry[student];
        Credential[] memory creds = credentialsByDID[studentDID];

        // Optional: Add filtering logic here by issuer/subject
        return creds;
    }

    /// Admin can fetch credentials for any student
    function getCredentialsForStudent(address student) external view onlyRole(DEFAULT_ADMIN_ROLE) returns (Credential[] memory) {
        return credentialsByDID[didRegistry[student]];
    }

    /// Internal helper to check subject ownership
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
