import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlockchainService } from './blockchain.service';
import { IPFSService } from './ipfs.service';
import { UserService } from '../user/user.service';
import {
  TransactionResponse,
  RoleResponse,
  DIDResponse,
  TeacherSubjectsResponse,
  BlockchainCredential,
  CredentialData,
  BlockchainUserStatus,
  NetworkInfo,
  IssueBlockchainCredentialInput,
  RevokeCredentialInput,
  AssignRoleInput,
  SubjectAssignmentInput,
  LinkWalletInput,
  RegisterDIDInput,
  VerifyCredentialInput,
  SubjectResponse,
  ComponentResponse,
  CreateSubjectInput,
  RegisterComponentInput,
  SubjectWithComponentsResponse,
  ComponentWithTxResponse,
  CreateCredentialInput,
  CredentialTxResponse,
} from './blockchain.types';
import { AuthGuard } from '@nestjs/passport';

@Resolver()
export class BlockchainResolver {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly ipfsService: IPFSService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  // Admin Operations
  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async assignBlockchainRole(
    @Args('input') input: AssignRoleInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      // Check if user is admin
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Only admins can assign blockchain roles',
        };
      }

      // Get role constant
      const roles = this.blockchainService.getRoleConstants();
      let roleConstant: string;

      if (input.role === 'TEACHER_ROLE') {
        roleConstant = roles.TEACHER_ROLE;
      } else if (input.role === 'STUDENT_ROLE') {
        roleConstant = roles.STUDENT_ROLE;
      } else {
        return {
          success: false,
          error: 'Invalid role. Use TEACHER_ROLE or STUDENT_ROLE',
        };
      }

      const txHash = await this.blockchainService.grantRole(
        roleConstant,
        input.userAddress,
      );

      // Update user record
      await this.userService.updateBlockchainRole(input.userAddress, input.role);

      return { 
        success: true, 
        transactionHash: txHash,
        message: `${input.role} assigned successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async assignSubjectToTeacher(
    @Args('input') input: SubjectAssignmentInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Only admins can assign subjects to teachers',
        };
      }

      const txHash = await this.blockchainService.assignSubjectToTeacher(
        input.teacherAddress,
        input.subject,
      );

      // Update user record
      await this.userService.addSubjectToTeacher(input.teacherAddress, input.subject);

      return { 
        success: true, 
        transactionHash: txHash,
        message: `Subject ${input.subject} assigned to teacher`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async removeSubjectFromTeacher(
    @Args('input') input: SubjectAssignmentInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Only admins can remove subjects from teachers',
        };
      }

      const txHash = await this.blockchainService.removeSubjectFromTeacher(
        input.teacherAddress,
        input.subject,
      );

      // Update user record
      await this.userService.removeSubjectFromTeacher(input.teacherAddress, input.subject);

      return { 
        success: true, 
        transactionHash: txHash,
        message: `Subject ${input.subject} removed from teacher`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async revokeBlockchainCredential(
    @Args('input') input: RevokeCredentialInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Only admins can revoke credentials',
        };
      }

      const txHash = await this.blockchainService.revokeCredential(
        input.studentAddress,
        input.subject,
      );

      return { 
        success: true, 
        transactionHash: txHash,
        message: 'Credential revoked successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // User Operations
  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async linkWalletAddress(
    @Args('input') input: LinkWalletInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      // Debug logging
      console.log('Context.req exists:', !!context.req);
      console.log('Context.req.user exists:', !!context.req.user);
      console.log('Context.req.user:', context.req.user);
      console.log('Input:', input);
      
      const userId = context.req.user.userId;
      console.log('Extracted userId:', userId);
      
      await this.userService.linkWallet(userId, input.walletAddress);

      return {
        success: true,
        message: 'Wallet address linked successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async registerUserDID(
    @Args('input') input: RegisterDIDInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const txHash = await this.blockchainService.registerDID(input.did);
      
      // Update user record
      const userId = context.req.user.userId;
      await this.userService.updateDIDStatus(userId, input.did, true);

      return {
        success: true,
        transactionHash: txHash,
        message: 'DID registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => BlockchainUserStatus)
  async getMyBlockchainStatus(
    @Context() context,
  ): Promise<BlockchainUserStatus> {
    try {
      const user = context.req.user;
      
      // Get assigned subjects for teachers
      let assignedSubjects: string[] = [];
      if (user.role === 'TEACHER' && user.walletAddress) {
        assignedSubjects = await this.blockchainService.getTeacherSubjects(user.walletAddress);
      }

      return {
        walletAddress: user.walletAddress,
        didHash: user.didHash,
        blockchainRole: user.blockchainRole,
        didRegistered: user.didRegistered || false,
        hasBlockchainRole: !!user.blockchainRole,
        assignedSubjects,
      };
    } catch (error) {
      return {
        didRegistered: false,
        hasBlockchainRole: false,
        assignedSubjects: [],
      };
    }
  }

  // Teacher Operations
  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async issueBlockchainCredential(
    @Args('input') input: IssueBlockchainCredentialInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'TEACHER') {
        return {
          success: false,
          error: 'Only teachers can issue credentials',
        };
      }

      // Parse credential data
      const credentialData = JSON.parse(input.credentialData as string);
      credentialData.issuer = currentUser.walletAddress;
      credentialData.issueDate = new Date().toISOString();

      // Upload to IPFS
      const ipfsHash = await this.ipfsService.uploadCredential(credentialData);

      // Store on blockchain
      const txHash = await this.blockchainService.issueOrUpdateCredential(
        input.studentAddress,
        input.subject,
        ipfsHash,
      );

      return {
        success: true,
        transactionHash: txHash,
        message: `Credential issued successfully. IPFS: ${ipfsHash}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [String])
  async getMyAssignedSubjects(
    @Context() context,
  ): Promise<string[]> {
    try {
      const user = context.req.user;
      if (user.role !== 'TEACHER' || !user.walletAddress) {
        return [];
      }

      return await this.blockchainService.getTeacherSubjects(user.walletAddress);
    } catch (error) {
      return [];
    }
  }

  // Student Operations
  @UseGuards(JwtAuthGuard)
  @Query(() => BlockchainCredential, { nullable: true })
  async getMySubjectCredential(
    @Args('subject') subject: string,
    @Context() context,
  ): Promise<BlockchainCredential | null> {
    try {
      const user = context.req.user;
      if (!user.walletAddress) {
        return null;
      }

      const credential = await this.blockchainService.getStudentSubjectCredential(
        user.walletAddress,
        subject,
      );
      
      if (!credential || credential.ipfsHash === '') {
        return null;
      }

      // Get full credential data from IPFS
      const credentialData = await this.ipfsService.getCredential(credential.ipfsHash);

      return {
        ipfsHash: credential.ipfsHash,
        issuer: credential.issuer,
        updatedAt: credential.updatedAt.toString(),
        subject: credentialData?.subject,
        studentName: credentialData?.studentName,
        grade: credentialData?.grade,
      };
    } catch (error) {
      return null;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [BlockchainCredential])
  async getMyBlockchainCredentials(
    @Context() context,
  ): Promise<BlockchainCredential[]> {
    try {
      const user = context.req.user;
      if (!user.walletAddress) {
        return [];
      }

      // This would need to be implemented to get all credentials for a student
      // For now, return empty array
      return [];
    } catch (error) {
      return [];
    }
  }

  // Public Verification
  @Query(() => BlockchainCredential, { nullable: true })
  async verifyBlockchainCredential(
    @Args('input') input: VerifyCredentialInput,
  ): Promise<BlockchainCredential | null> {
    try {
      const credential = await this.blockchainService.getStudentSubjectCredential(
        input.studentAddress,
        input.subject,
      );
      
      if (!credential || credential.ipfsHash === '') {
        return null;
      }

      // Get full credential data from IPFS
      const credentialData = await this.ipfsService.getCredential(credential.ipfsHash);

      return {
        ipfsHash: credential.ipfsHash,
        issuer: credential.issuer,
        updatedAt: credential.updatedAt.toString(),
        subject: credentialData?.subject,
        studentName: credentialData?.studentName,
        grade: credentialData?.grade,
      };
    } catch (error) {
      return null;
    }
  }

  // Utility Operations
  @Query(() => NetworkInfo)
  async getBlockchainNetworkInfo(): Promise<NetworkInfo> {
    try {
      return {
        contractAddress: this.blockchainService.getContractAddress(),
        walletAddress: this.blockchainService.getWalletAddress(),
        network: 'sepolia',
        chainId: '11155111',
        isConnected: true,
      };
    } catch (error) {
      return {
        contractAddress: '',
        walletAddress: '',
        network: 'sepolia',
        chainId: '11155111',
        isConnected: false,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async testIPFSConnection(): Promise<boolean> {
    try {
      return await this.ipfsService.testConnection();
    } catch (error) {
      return false;
    }
  }

  // Week 1 Core Blockchain APIs - User pays gas fees via MetaMask
  @UseGuards(JwtAuthGuard)
  @Mutation(() => SubjectWithComponentsResponse)
  async createSubject(
    @Args('input') input: CreateSubjectInput,
    @Context() context,
  ): Promise<any> {
    try {
      const currentUser = context.req?.user;
      
      // Only check admin role if auth is enabled
      if (currentUser && currentUser.role !== 'ADMIN') {
        throw new Error('Only admins can create subjects');
      }

      const result = await this.blockchainService.createSubject(
        input.subjectName,
        input.transactionHash,
        currentUser?.walletAddress || 'admin',
        input.description,
        input.credits
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to create subject: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => ComponentWithTxResponse)
  async registerComponent(
    @Args('input') input: RegisterComponentInput,
    @Context() context,
  ): Promise<any> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Only admins can register components');
      }

      const result = await this.blockchainService.registerComponent(
        input.subjectName,
        input.componentName,
        currentUser.walletAddress || 'admin',
        input.weightage,
        input.maxMarks
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to register component: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [SubjectResponse])
  async getAllSubjects(): Promise<any> {
    try {
      return await this.blockchainService.getAllSubjects();
    } catch (error) {
      throw new Error(`Failed to get subjects: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [ComponentResponse])
  async getSubjectComponents(
    @Args('subjectName') subjectName: string,
  ): Promise<any> {
    try {
      return await this.blockchainService.getSubjectComponents(subjectName);
    } catch (error) {
      throw new Error(`Failed to get components: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CredentialTxResponse)

  async createNewCredential(
    @Args('input') input: CreateCredentialInput,
    @Context() context,
  ): Promise<any> {
    try {
      const currentUser = context.req.user;

      if (currentUser.role !== 'TEACHER' && currentUser.role !== 'ADMIN') {
        throw new Error('Only teachers and admins can create credentials');
      }

      const credentialData = JSON.parse(input.credentialData);
      credentialData.issuer = currentUser.walletAddress;
      credentialData.issuerName = currentUser.name || currentUser.email;

      const result = await this.blockchainService.createNewCredential(
        input.studentAddress,
        input.subjectName,
        credentialData,
        input.validityPeriod ?? 31536000
      );
      return {
        ...result,
        message: `Credential created. IPFS: ${result.ipfsHash}`,
      };

    } catch (error) {
      throw new Error(`createNewCredential failed: ${error.message}`);
    }
  }

}
