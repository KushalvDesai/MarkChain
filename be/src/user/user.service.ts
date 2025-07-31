import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { UpdateUserProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getAllStudentsWithSubject(subject: string): Promise<any[]> {
    // Find all students who have the specified subject
    const students = await this.userModel.find({
      role: UserRole.STUDENT,
      subjects: subject,
      isActive: true,
    }).select('-nonce').exec();

    return students;
  }

  async getUsersByRole(role: UserRole): Promise<any[]> {
    const users = await this.userModel.find({
      role: role,
      isActive: true,
    }).select('-nonce').exec();

    return users;
  }

  async getUserProfile(walletAddress: string): Promise<any> {
    const user = await this.userModel.findOne({
      walletAddress: walletAddress.toLowerCase(),
      isActive: true,
    }).select('-nonce').exec();

    if (!user) {
      throw new NotFoundException(`User with wallet address ${walletAddress} not found`);
    }

    return user;
  }

  async updateUserProfile(
    walletAddress: string,
    updateData: UpdateUserProfileDto
  ): Promise<any> {
    const user = await this.userModel.findOneAndUpdate(
      { 
        walletAddress: walletAddress.toLowerCase(),
        isActive: true 
      },
      { $set: updateData },
      { new: true }
    ).select('-nonce').exec();

    if (!user) {
      throw new NotFoundException(`User with wallet address ${walletAddress} not found`);
    }

    return user;
  }

  async getAllUsers(): Promise<any[]> {
    return this.userModel.find({ isActive: true }).select('-nonce').exec();
  }
}
