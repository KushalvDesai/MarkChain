import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { UpdateUserProfileDto } from './dto/user.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  // async getAllStudentsWithSubject(subject: string): Promise<any[]> {
  //   // Find all students - subject filtering removed since subjects field is removed
  //   const students = await this.userModel.find({
  //     role: UserRole.STUDENT,
  //     isActive: true,
  //   })
  //   .select('-nonce')
  //   .exec();

  //   return students;
  // }

  async getUsersByRole(role: UserRole): Promise<any[]> {
    const users = await this.userModel.find({
      role: role,
      isActive: true,
    })
    .select('-nonce')
    .exec();

    return users;
  }

  async getUserProfile(walletAddress: string): Promise<any> {
    const user = await this.userModel.findOne({
      walletAddress: walletAddress.toLowerCase(),
      isActive: true,
    })
    .select('-nonce')
    .exec();

    if (!user) {
      throw new NotFoundException(`User with wallet address ${walletAddress} not found`);
    }

    return user;
  }

  async updateUserProfile(
    walletAddress: string,
    updateData: UpdateUserProfileDto
  ): Promise<any> {
    // Only allow updating student name and studentId
    const allowedFields = ['name', 'studentId'];
    const updatePayload: any = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        updatePayload[key] = updateData[key];
      }
    }

    // Prevent duplicate studentId
    if (updatePayload.studentId) {
      const existing = await this.userModel.findOne({
        studentId: updatePayload.studentId,
        walletAddress: { $ne: walletAddress.toLowerCase() }
      });
      if (existing) {
        throw new Error('Student ID already exists for another user');
      }
    }

    // Only update existing user profile
    const user = await  this.userModel.findOneAndUpdate(
      {
        walletAddress: walletAddress.toLowerCase(),
        isActive: true
      },
      { $set: updatePayload },
      { new: true }
    )
    .select('-nonce')
    .exec();

    if (!user) {
      throw new NotFoundException(`User with wallet address ${walletAddress} not found`);
    }

    return user;
  }

  // OTP Methods
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private validateStudentIdFormat(studentId: string): boolean {
    const regex = /^(23|24|25)CS\d{3}$/;
    return regex.test(studentId);
  }

  private generateStudentEmail(studentId: string): string {
    return `${studentId.toLowerCase()}@charusat.edu.in`;
  }

  async sendOTPForVerification(walletAddress: string, studentId: string): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      // Validate student ID format
      if (!this.validateStudentIdFormat(studentId)) {
        throw new BadRequestException('Invalid student ID format. Expected format: 23CSXXX or 24CSXXX or 25CSXXX');
      }

      // Check if student ID is already taken by another user
      const existingUser = await this.userModel.findOne({
        studentId: studentId,
        walletAddress: { $ne: walletAddress.toLowerCase() }
      });

      if (existingUser) {
        throw new BadRequestException('Student ID already exists for another user');
      }

      // Find the user
      const user = await this.userModel.findOne({
        walletAddress: walletAddress.toLowerCase(),
        isActive: true
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate OTP and set expiry (10 minutes)
      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      const email = this.generateStudentEmail(studentId);

      // Update user with OTP details
      await this.userModel.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        {
          $set: {
            otp: otp,
            otpExpiry: otpExpiry,
            isVerified: false
          }
        }
      );

      // Send OTP email
      const emailSent = await this.emailService.sendOTP(email, otp, studentId);

      if (!emailSent) {
        throw new Error('Failed to send OTP email');
      }

      return {
        success: true,
        message: 'OTP sent successfully to your student email',
        email: email
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  }

  async verifyOTPAndUpdateProfile(
    walletAddress: string,
    otp: string,
    updateData: UpdateUserProfileDto
  ): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      // Find user with matching OTP
      const user = await this.userModel.findOne({
        walletAddress: walletAddress.toLowerCase(),
        otp: otp,
        isActive: true
      });

      if (!user) {
        throw new BadRequestException('Invalid OTP');
      }

      // Check if OTP has expired
      if (!user.otpExpiry || new Date() > user.otpExpiry) {
        // Clear expired OTP
        await this.userModel.findOneAndUpdate(
          { walletAddress: walletAddress.toLowerCase() },
          {
            $unset: {
              otp: 1,
              otpExpiry: 1
            }
          }
        );
        throw new BadRequestException('OTP has expired');
      }

      // Validate student ID format if provided
      if (updateData.studentId && !this.validateStudentIdFormat(updateData.studentId)) {
        throw new BadRequestException('Invalid student ID format. Expected format: 23CSXXX or 24CSXXX');
      }

      // Check for duplicate student ID if provided
      if (updateData.studentId) {
        const existingUser = await this.userModel.findOne({
          studentId: updateData.studentId,
          walletAddress: { $ne: walletAddress.toLowerCase() }
        });
        if (existingUser) {
          throw new BadRequestException('Student ID already exists for another user');
        }
      }

      // Prepare update payload
      const allowedFields = ['name', 'studentId'];
      const updatePayload: any = {};
      for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
          updatePayload[key] = updateData[key];
        }
      }

      // Update user profile and mark as verified
      const updatedUser = await this.userModel.findOneAndUpdate(
        { walletAddress: walletAddress.toLowerCase() },
        {
          $set: {
            ...updatePayload,
            isVerified: true
          },
          $unset: {
            otp: 1,
            otpExpiry: 1
          }
        },
        { new: true }
      )
      .select('-nonce')
      .exec();

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP'
      };
    }
  }

  async getAllUsers(): Promise<any[]> {
    return this.userModel
      .find({ isActive: true })
      .select('-nonce')
      .exec();
  }
}
