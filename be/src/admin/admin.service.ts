import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { TeacherSubject, TeacherSubjectDocument } from '../schemas/teacher-subject.schema';
import { ExamSchedule, ExamScheduleDocument } from '../schemas/exam-schedule.schema';
import { Credential, CredentialDocument } from '../schemas/credential.schema';
import { BlockchainService } from '../blockchain/blockchain.service';
import { NotificationService } from '../notification/notification.service';
import {
  AssignBlockchainRoleInput,
  CreateTeacherSubjectInput,
  UpdateTeacherSubjectInput,
  AdminRevokeCredentialInput,
  CreateExamScheduleInput,
  UpdateExamScheduleInput,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(TeacherSubject.name) private teacherSubjectModel: Model<TeacherSubjectDocument>,
    @InjectModel(ExamSchedule.name) private examScheduleModel: Model<ExamScheduleDocument>,
    @InjectModel(Credential.name) private credentialModel: Model<CredentialDocument>,
    private blockchainService: BlockchainService,
    private notificationService: NotificationService,
  ) {}

  // Assign Blockchain Role
  async assignBlockchainRole(input: AssignBlockchainRoleInput, adminDID: string): Promise<any> {
    const user = await this.userModel.findOne({
      walletAddress: input.userWalletAddress.toLowerCase(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      // Get role constants from blockchain service
      const roles = this.blockchainService.getRoleConstants();
      let roleConstant: string;

      // Convert role string to blockchain role constant
      if (input.role === 'TEACHER_ROLE') {
        roleConstant = roles.TEACHER_ROLE;
      } else if (input.role === 'STUDENT_ROLE') {
        roleConstant = roles.STUDENT_ROLE;
      } else if (input.role === 'ADMIN_ROLE') {
        roleConstant = roles.DEFAULT_ADMIN_ROLE;
      } else {
        throw new BadRequestException('Invalid role. Use TEACHER_ROLE, STUDENT_ROLE, or ADMIN_ROLE');
      }

      // Assign role on blockchain using grantRole (not assignRole)
      const txHash = await this.blockchainService.grantRole(roleConstant, input.userWalletAddress);

      // Update user in database
      user.blockchainRole = input.role;
      await user.save();

      // Send notification
      await this.notificationService.createNotification({
        recipientDID: user.did,
        recipientWalletAddress: user.walletAddress,
        type: 'role_assigned',
        title: 'Blockchain Role Assigned',
        message: `You have been assigned the ${input.role} role on the blockchain.`,
        senderDID: adminDID,
        metadata: { role: input.role, txHash },
      });

      return {
        success: true,
        message: 'Blockchain role assigned successfully',
        txHash,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to assign blockchain role: ${error.message}`);
    }
  }

  // Create Teacher Subject Assignment
  async createTeacherSubject(input: CreateTeacherSubjectInput, adminDID: string): Promise<any> {
    const teacher = await this.userModel.findOne({
      walletAddress: input.teacherWalletAddress.toLowerCase(),
      role: 'TEACHER',
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if assignment already exists
    const existing = await this.teacherSubjectModel.findOne({
      teacherWalletAddress: input.teacherWalletAddress.toLowerCase(),
      subjectCode: input.subjectCode,
      academicYear: input.academicYear,
      semester: input.semester,
    });

    if (existing) {
      throw new BadRequestException('This subject is already assigned to the teacher for the specified period');
    }

    const teacherSubject = new this.teacherSubjectModel({
      teacherDID: teacher.did,
      teacherWalletAddress: teacher.walletAddress,
      teacherName: teacher.name || 'Unknown',
      subjectCode: input.subjectCode,
      subjectName: input.subjectName,
      academicYear: input.academicYear,
      semester: input.semester,
      batches: input.batches,
      department: input.department,
      assignedBy: adminDID,
      assignedAt: new Date(),
    });

    await teacherSubject.save();

    // Update teacher's assignedSubjects
    if (!teacher.assignedSubjects) {
      teacher.assignedSubjects = [];
    }
    if (!teacher.assignedSubjects.includes(input.subjectCode)) {
      teacher.assignedSubjects.push(input.subjectCode);
      await teacher.save();
    }

    // Send notification to teacher
    await this.notificationService.createNotification({
      recipientDID: teacher.did,
      recipientWalletAddress: teacher.walletAddress,
      type: 'subject_assigned',
      title: 'New Subject Assigned',
      message: `You have been assigned ${input.subjectName} (${input.subjectCode}) for ${input.academicYear} - ${input.semester}`,
      senderDID: adminDID,
      relatedEntityId: (teacherSubject as any)._id.toString(),
      relatedEntityType: 'subject',
      metadata: { subjectCode: input.subjectCode, subjectName: input.subjectName },
    });

    return teacherSubject;
  }

  // Get all teacher subjects
  async getAllTeacherSubjects(): Promise<any[]> {
    return this.teacherSubjectModel.find({ isActive: true }).exec();
  }

  // Get teacher subjects by teacher wallet
  async getTeacherSubjectsByTeacher(teacherWalletAddress: string): Promise<any[]> {
    return this.teacherSubjectModel.find({
      teacherWalletAddress: teacherWalletAddress.toLowerCase(),
      isActive: true,
    }).exec();
  }

  // Update teacher subject
  async updateTeacherSubject(input: UpdateTeacherSubjectInput): Promise<any> {
    const subject = await this.teacherSubjectModel.findById(input.subjectId);

    if (!subject) {
      throw new NotFoundException('Subject assignment not found');
    }

    Object.keys(input).forEach(key => {
      if (key !== 'subjectId' && input[key] !== undefined) {
        subject[key] = input[key];
      }
    });

    await subject.save();
    return subject;
  }

  // Delete teacher subject
  async deleteTeacherSubject(subjectId: string): Promise<any> {
    const subject = await this.teacherSubjectModel.findById(subjectId);

    if (!subject) {
      throw new NotFoundException('Subject assignment not found');
    }

    subject.isActive = false;
    await subject.save();

    return {
      success: true,
      message: 'Subject assignment deleted successfully',
    };
  }

  // Revoke Credential
  async revokeCredential(input: AdminRevokeCredentialInput, adminDID: string): Promise<any> {
    const credential = await this.credentialModel.findById(input.credentialId);

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    if (credential.isRevoked) {
      throw new BadRequestException('Credential is already revoked');
    }

    credential.isRevoked = true;
    credential.revokedAt = new Date();
    credential.revokedBy = adminDID;
    await credential.save();

    // Send notification to student
    await this.notificationService.createNotification({
      recipientDID: credential.studentDID,
      recipientWalletAddress: '', // Will be fetched in notification service
      type: 'credential_revoked',
      title: 'Credential Revoked',
      message: `Your credential for ${credential.subject} has been revoked.`,
      senderDID: adminDID,
      relatedEntityId: (credential as any)._id.toString(),
      relatedEntityType: 'credential',
      metadata: { subject: credential.subject, reason: input.reason },
    });

    return {
      success: true,
      message: 'Credential revoked successfully',
      credentialId: (credential as any)._id.toString(),
    };
  }

  // Create Exam Schedule
  async createExamSchedule(input: CreateExamScheduleInput, adminDID: string): Promise<any> {
    const teacher = await this.userModel.findOne({
      walletAddress: input.teacherWalletAddress.toLowerCase(),
      role: 'TEACHER',
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const examSchedule = new this.examScheduleModel({
      subject: input.subject,
      examName: input.examName,
      examType: input.examType,
      examDate: input.examDate,
      duration: input.duration,
      totalMarks: input.totalMarks,
      passingMarks: input.passingMarks,
      venue: input.venue,
      teacherDID: teacher.did,
      academicYear: input.academicYear,
      semester: input.semester,
      batch: input.batch,
      description: input.description,
    });

    await examSchedule.save();

    // Get students in the batch and send notifications
    const students = await this.userModel.find({
      role: 'STUDENT',
      isActive: true,
    });

    for (const student of students) {
      await this.notificationService.createNotification({
        recipientDID: student.did,
        recipientWalletAddress: student.walletAddress,
        type: 'exam_scheduled',
        title: 'New Exam Scheduled',
        message: `${input.examName} for ${input.subject} has been scheduled on ${new Date(input.examDate).toLocaleDateString()}`,
        senderDID: adminDID,
        relatedEntityId: (examSchedule as any)._id.toString(),
        relatedEntityType: 'exam',
        metadata: {
          subject: input.subject,
          examDate: input.examDate,
          venue: input.venue,
        },
      });
    }

    return examSchedule;
  }

  // Get all exam schedules
  async getAllExamSchedules(): Promise<any[]> {
    return this.examScheduleModel.find({ isActive: true }).sort({ examDate: 1 }).exec();
  }

  // Get exam schedule by ID
  async getExamScheduleById(examId: string): Promise<any> {
    const exam = await this.examScheduleModel.findById(examId);
    if (!exam) {
      throw new NotFoundException('Exam schedule not found');
    }
    return exam;
  }

  // Update exam schedule
  async updateExamSchedule(input: UpdateExamScheduleInput): Promise<any> {
    const exam = await this.examScheduleModel.findById(input.examId);

    if (!exam) {
      throw new NotFoundException('Exam schedule not found');
    }

    if (input.teacherWalletAddress) {
      const teacher = await this.userModel.findOne({
        walletAddress: input.teacherWalletAddress.toLowerCase(),
        role: 'TEACHER',
      });
      if (teacher) {
        exam.teacherDID = teacher.did;
      }
    }

    Object.keys(input).forEach(key => {
      if (key !== 'examId' && key !== 'teacherWalletAddress' && input[key] !== undefined) {
        exam[key] = input[key];
      }
    });

    await exam.save();
    return exam;
  }

  // Delete exam schedule
  async deleteExamSchedule(examId: string): Promise<any> {
    const exam = await this.examScheduleModel.findById(examId);

    if (!exam) {
      throw new NotFoundException('Exam schedule not found');
    }

    exam.isActive = false;
    exam.status = 'cancelled';
    await exam.save();

    return {
      success: true,
      message: 'Exam schedule deleted successfully',
    };
  }

  // View students by batch
  async getStudentsByBatch(batch: string): Promise<any[]> {
    // For now, return all students since batch field might not be in User schema
    // You can add batch field to User schema if needed
    return this.userModel.find({
      role: 'STUDENT',
      isActive: true,
    })
    .select('-nonce -password')
    .exec();
  }
}
