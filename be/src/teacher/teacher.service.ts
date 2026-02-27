import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { TeacherSubject, TeacherSubjectDocument } from '../schemas/teacher-subject.schema';
import { Credential, CredentialDocument } from '../schemas/credential.schema';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IPFSService } from '../blockchain/ipfs.service';
import { NotificationService } from '../notification/notification.service';
import { UploadMarksInput } from './dto/teacher.dto';
import * as crypto from 'crypto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(TeacherSubject.name) private teacherSubjectModel: Model<TeacherSubjectDocument>,
    @InjectModel(Credential.name) private credentialModel: Model<CredentialDocument>,
    private blockchainService: BlockchainService,
    private ipfsService: IPFSService,
    private notificationService: NotificationService,
  ) {}

  // Get Teacher Dashboard - Course Setup
  async getCourseSetup(teacherWalletAddress: string): Promise<any> {
    const teacher = await this.userModel.findOne({
      walletAddress: teacherWalletAddress.toLowerCase(),
      role: 'TEACHER',
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const subjects = await this.teacherSubjectModel.find({
      teacherWalletAddress: teacherWalletAddress.toLowerCase(),
      isActive: true,
    }).exec();

    // Get unique batches
    const batchesSet = new Set<string>();
    subjects.forEach(subject => {
      subject.batches.forEach(batch => batchesSet.add(batch));
    });

    // Get students count - for now all active students
    const studentsCount = await this.userModel.countDocuments({
      role: 'STUDENT',
      isActive: true,
    });

    return {
      totalSubjects: subjects.length,
      totalBatches: batchesSet.size,
      totalStudents: studentsCount,
      subjects: subjects.map(subject => ({
        _id: subject._id,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        academicYear: subject.academicYear,
        semester: subject.semester,
        batches: subject.batches,
        department: subject.department,
      })),
    };
  }

  // Get Students for Teacher Dashboard
  async getTeacherStudents(teacherWalletAddress: string, batch?: string): Promise<any[]> {
    const teacher = await this.userModel.findOne({
      walletAddress: teacherWalletAddress.toLowerCase(),
      role: 'TEACHER',
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Get all active students
    const students = await this.userModel.find({
      role: 'STUDENT',
      isActive: true,
    })
    .select('-nonce -password')
    .exec();

    return students.map(student => ({
      _id: student._id,
      walletAddress: student.walletAddress,
      did: student.did,
      name: student.name || 'Unknown',
      studentId: student.studentId || 'N/A',
      email: student.email,
      batch: 'N/A', // Add batch field to User schema if needed
      isActive: student.isActive,
    }));
  }

  // Get Credentials for Teacher Dashboard
  async getTeacherCredentials(teacherWalletAddress: string, subject?: string): Promise<any[]> {
    const teacher = await this.userModel.findOne({
      walletAddress: teacherWalletAddress.toLowerCase(),
      role: 'TEACHER',
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const query: any = {
      teacherDID: teacher.did,
    };

    if (subject) {
      query.subject = subject;
    }

    const credentials = await this.credentialModel.find(query)
      .sort({ createdAt: -1 })
      .exec();

    return credentials.map(cred => ({
      _id: cred._id,
      studentDID: cred.studentDID,
      studentName: cred.studentName || 'Unknown',
      subject: cred.subject,
      marks: cred.marks,
      grade: cred.grade,
      examType: cred.examType,
      academicYear: cred.academicYear,
      semester: cred.semester,
      isRevoked: cred.isRevoked,
      blockchainTxHash: cred.blockchainTxHash,
      ipfsHash: cred.ipfsHash,
      createdAt: (cred as any).createdAt,
    }));
  }

  // Upload Marks (Create Credential)
  async uploadMarks(input: UploadMarksInput, teacherWalletAddress: string): Promise<any> {
    const teacher = await this.userModel.findOne({
      walletAddress: teacherWalletAddress.toLowerCase(),
      role: 'TEACHER',
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const student = await this.userModel.findOne({
      walletAddress: input.studentWalletAddress.toLowerCase(),
      role: 'STUDENT',
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if teacher is assigned to this subject
    const subjectAssignment = await this.teacherSubjectModel.findOne({
      teacherWalletAddress: teacherWalletAddress.toLowerCase(),
      subjectCode: input.subject,
      isActive: true,
    });

    if (!subjectAssignment) {
      throw new BadRequestException('You are not assigned to teach this subject');
    }

    // Validate marks
    if (input.marks < 0 || input.marks > 100) {
      throw new BadRequestException('Marks must be between 0 and 100');
    }

    // Create Verifiable Credential JSON
    const vcJson = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ['VerifiableCredential', 'AcademicCredential'],
      issuer: {
        id: teacher.did,
        name: teacher.name || 'Unknown Teacher',
      },
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: student.did,
        name: student.name || 'Unknown Student',
        studentId: student.studentId,
        achievement: {
          type: 'AcademicGrade',
          subject: input.subject,
          marks: input.marks,
          grade: input.grade,
          examType: input.examType,
          academicYear: input.academicYear,
          semester: input.semester,
          institution: input.institution || 'Unknown Institution',
        },
      },
    };

    // Generate hash of VC
    const vcHash = crypto.createHash('sha256').update(JSON.stringify(vcJson)).digest('hex');

    // Create credential in database
    const credential = new this.credentialModel({
      studentDID: student.did,
      teacherDID: teacher.did,
      subject: input.subject,
      marks: input.marks,
      vcHash,
      vcJson,
      academicYear: input.academicYear,
      semester: input.semester,
      examType: input.examType,
      studentName: student.name,
      institution: input.institution,
      grade: input.grade,
      issuerAddress: teacherWalletAddress,
      blockchainStatus: 'pending',
    });

    await credential.save();

    // Try to anchor on blockchain and IPFS (async, don't block)
    this.anchorCredentialAsync((credential as any)._id.toString(), vcJson, vcHash).catch(err => {
      console.error('Failed to anchor credential:', err);
    });

    // Send notification to student
    await this.notificationService.createNotification({
      recipientDID: student.did,
      recipientWalletAddress: student.walletAddress,
      type: 'credential_issued',
      title: 'New Credential Issued',
      message: `You received ${input.marks} marks in ${input.subject}`,
      senderDID: teacher.did,
      senderWalletAddress: teacher.walletAddress,
      relatedEntityId: (credential as any)._id.toString(),
      relatedEntityType: 'credential',
      metadata: {
        subject: input.subject,
        marks: input.marks,
        grade: input.grade,
      },
    });

    return {
      success: true,
      message: 'Marks uploaded successfully',
      credentialId: (credential as any)._id.toString(),
      vcHash,
    };
  }

  // Helper method to anchor credential on blockchain and IPFS
  private async anchorCredentialAsync(credentialId: string, vcJson: any, vcHash: string) {
    try {
      const credential = await this.credentialModel.findById(credentialId);
      if (!credential) return;

      // Upload to IPFS
      const ipfsHash = await this.ipfsService.uploadJSON(vcJson);
      credential.ipfsHash = ipfsHash;

      // Anchor on blockchain
      const txHash = await this.blockchainService.issueCredential(
        credential.studentDID,
        vcHash,
        ipfsHash
      );
      credential.blockchainTxHash = txHash;
      credential.blockchainStatus = 'confirmed';

      await credential.save();
    } catch (error) {
      console.error('Anchoring failed:', error);
      const credential = await this.credentialModel.findById(credentialId);
      if (credential) {
        credential.blockchainStatus = 'failed';
        await credential.save();
      }
    }
  }
}
