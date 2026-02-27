# Changelog - MarkChain Backend

All notable changes to the MarkChain Backend project are documented in this file.

## [1.1.0] - 2026-01-04

### Added

#### Schemas
- **ExamSchedule Schema** - Complete exam scheduling system with venue, marks, and status tracking
- **Notification Schema** - Comprehensive notification system with metadata and relationship tracking
- **TeacherSubject Schema** - Teacher-subject assignment management with batch support

#### Admin Module (NEW)
- Admin module with complete CRUD operations
- Blockchain role assignment API (`assignBlockchainRole`)
- Teacher subject management:
  - Create teacher subject assignments
  - View all teacher subjects
  - View teacher subjects by specific teacher
  - Update teacher subject assignments
  - Delete (soft delete) teacher subjects
- Credential revocation system with reason tracking
- Complete exam schedule CRUD operations:
  - Create exam schedules
  - View all exams
  - View specific exam details
  - Update exam schedules
  - Delete (cancel) exams
- Student viewing by batch
- Automatic notification sending on admin actions

#### Teacher Module (NEW)
- Teacher module with dashboard and credential management
- Course setup dashboard API showing:
  - Total assigned subjects
  - Total batches
  - Total students
  - Detailed subject list
- Students page API with optional batch filtering
- Credentials page API showing all issued credentials with filters
- Upload marks API with:
  - W3C Verifiable Credential generation
  - SHA256 hash generation
  - Asynchronous blockchain anchoring
  - IPFS storage integration
  - Teacher subject validation
  - Automatic student notification

#### Notification Module (NEW)
- Complete notification system
- Get user notifications with optional limit
- Unread notifications count
- Mark single notification as read
- Mark all notifications as read
- Delete notifications
- Notification types:
  - credential_issued
  - credential_revoked
  - exam_scheduled
  - subject_assigned
  - role_assigned
  - marks_uploaded
  - profile_updated

#### User Profile Enhancements
- Email OTP verification for teachers and admins
- Send email OTP for profile update
- Verify email OTP and update profile
- Email validation and duplicate checking
- 10-minute OTP expiry window

#### Database Updates
- Added `batch` field to User schema for student batch tracking
- Enhanced User schema with email verification flags
- New collections: teachersubjects, examschedules, notifications

#### Documentation
- **API_DOCUMENTATION.md** - Complete API reference with examples
- **IMPLEMENTATION_SUMMARY.md** - Detailed implementation overview
- **QUICK_START.md** - Quick start guide for developers
- **CHANGELOG.md** - This file

### Changed
- Updated app.module.ts to include new modules (Admin, Teacher, Notification)
- Enhanced user.service.ts with email OTP methods
- Updated user.resolver.ts with new mutations
- Extended user.dto.ts with email OTP DTOs
- Modified user.schema.ts to include batch field

### Technical Details

#### New Dependencies Used
- All existing dependencies remain (no new packages required)
- Leverages existing:
  - @nestjs/mongoose for database operations
  - @nestjs/graphql for API layer
  - ethers for blockchain integration
  - nodemailer for email services

#### Architecture Improvements
- Modular architecture with clear separation of concerns
- Service layer for business logic
- Resolver layer for GraphQL API
- DTO layer for type safety
- Schema layer for database models

#### Security Enhancements
- Role-based access control on all new endpoints
- JWT authentication required for all operations
- OTP expiry mechanism
- Email validation
- Duplicate prevention checks

### API Statistics
- **26 new API endpoints** added
- **15 Admin operations**
- **4 Teacher operations**
- **5 Notification operations**
- **2 User profile operations**

### Performance Considerations
- Asynchronous blockchain operations (non-blocking)
- Asynchronous IPFS uploads
- Query optimization with field selection
- Indexed database queries

### Breaking Changes
None - All changes are additive and backward compatible

### Migration Guide
No migration required - new collections will be created automatically on first use.

### Known Issues
None

### Future Enhancements Planned
- [ ] GraphQL subscriptions for real-time notifications
- [ ] Pagination for large result sets
- [ ] Bulk credential upload
- [ ] Advanced filtering options
- [ ] Dashboard analytics
- [ ] File upload support
- [ ] Audit log system
- [ ] Rate limiting

---

## [1.0.0] - 2025-XX-XX

### Initial Release
- User authentication with wallet signatures
- Basic user management
- Blockchain integration
- IPFS integration
- Email service
- JWT authentication
- Role-based access control
- Credential schema
- User schema
- GraphQL API

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.1.0 | 2026-01-04 | Major feature update - Admin, Teacher, Notification modules |
| 1.0.0 | 2025-XX-XX | Initial release |

---

## Contributors
- Backend Development Team
- Blockchain Integration Team

---

## License
UNLICENSED - Private Project

---

**For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

**For implementation details, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**

**For getting started, see [QUICK_START.md](QUICK_START.md)**
