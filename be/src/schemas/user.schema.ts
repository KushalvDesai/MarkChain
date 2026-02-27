import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  walletAddress: string;

  @Prop({ required: true, unique: true })
  did: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ type: String, required: false })
  nonce?: string;

  @Prop()
  name?: string;

  @Prop({ unique: true, sparse: true })
  studentId?: string;

  @Prop()
  batch?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  // OTP verification fields
  @Prop()
  otp?: string;

  @Prop()
  otpExpiry?: Date;

  @Prop({ default: false })
  isVerified?: boolean;

  // Blockchain integration fields
  @Prop({ unique: true, sparse: true })
  email?: string; // For traditional login support

  @Prop()
  password?: string; // For traditional login support

  @Prop()
  didHash?: string; // The hashed DID stored on blockchain

  @Prop()
  blockchainRole?: string; // Role assigned on blockchain (TEACHER_ROLE, STUDENT_ROLE)

  @Prop({ default: false })
  didRegistered?: boolean; // Whether DID is registered on blockchain

  @Prop([String])
  assignedSubjects?: string[]; // Subjects assigned to teachers
}


export const UserSchema = SchemaFactory.createForClass(User);
