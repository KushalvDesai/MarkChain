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
  // New types
  RemoveComponentInput,
  BatchUpdateComponentInput,
  ComponentQueryInput,
  StudentSubjectInput,
  RegisterDIDForUserInput,
  UpdateComponentGradeInput,
  RenounceRoleInput,
  CredentialStatsResponse,
  ComponentHistoryEntry,
  CredentialDetailResponse,
  BatchUpdateResponse,
} from './blockchain.types';
import { AuthGuard } from '@nestjs/passport';

@Resolver()
export class BlockchainResolver {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly ipfsService: IPFSService,
    @Inject(UserService) private readonly userService: UserService,
  ) { }

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

      console.log('--- assignSubjectToTeacher input ---', input);

      const txHash = await this.blockchainService.assignSubjectToTeacher(
        input.teacherAddress,
        input.subject,
        input.transactionHash,
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
        input.transactionHash,
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

  // Teacher Operations — Grade a component for a single student
  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async updateComponentGrade(
    @Args('input') input: UpdateComponentGradeInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'TEACHER' && currentUser.role !== 'ADMIN') {
        return {
          success: false,
          error: 'Only teachers and admins can grade components',
        };
      }

      // Parse grade data & upload to IPFS
      const gradeData = JSON.parse(input.gradeData);
      gradeData.issuer = currentUser.walletAddress;
      gradeData.issuerName = currentUser.name || currentUser.email;
      gradeData.gradedAt = new Date().toISOString();

      const ipfsHash = await this.ipfsService.uploadCredential(gradeData);

      const txHash = await this.blockchainService.updateCredentialWithComponent(
        input.studentAddress,
        input.subjectName,
        input.componentName,
        ipfsHash,
      );

      return {
        success: true,
        transactionHash: txHash,
        message: `Component '${input.componentName}' graded. IPFS: ${ipfsHash}`,
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

  // Student Operations — get own credential detail
  @UseGuards(JwtAuthGuard)
  @Query(() => CredentialDetailResponse, { nullable: true })
  async getMyCredentialDetail(
    @Args('subject') subject: string,
    @Context() context,
  ): Promise<CredentialDetailResponse | null> {
    try {
      const user = context.req.user;
      if (!user.walletAddress) return null;

      const credential = await this.blockchainService.getStudentCredential(
        user.walletAddress,
        subject,
      );

      if (!credential || credential.ipfsHash === '') return null;

      return {
        ipfsHash: credential.ipfsHash,
        version: credential.version.toString(),
        totalComponents: credential.totalComponents.toString(),
        createdAt: credential.createdAt.toString(),
        lastUpdatedAt: credential.lastUpdatedAt.toString(),
        expiresAt: credential.expiresAt.toString(),
        revoked: credential.revoked,
        isExpired: credential.isExpired,
      };
    } catch (error) {
      return null;
    }
  }

  // Admin/Teacher — get student credential detail
  @UseGuards(JwtAuthGuard)
  @Query(() => CredentialDetailResponse, { nullable: true })
  async getStudentCredentialDetail(
    @Args('input') input: StudentSubjectInput,
    @Context() context,
  ): Promise<CredentialDetailResponse | null> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
        return null;
      }

      const credential = await this.blockchainService.getStudentCredential(
        input.studentAddress,
        input.subject,
      );

      if (!credential || credential.ipfsHash === '') return null;

      return {
        ipfsHash: credential.ipfsHash,
        version: credential.version.toString(),
        totalComponents: credential.totalComponents.toString(),
        createdAt: credential.createdAt.toString(),
        lastUpdatedAt: credential.lastUpdatedAt.toString(),
        expiresAt: credential.expiresAt.toString(),
        revoked: credential.revoked,
        isExpired: credential.isExpired,
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
      return [];
    } catch (error) {
      return [];
    }
  }

  // Public Verification — now using getStudentCredential
  @Query(() => CredentialDetailResponse, { nullable: true })
  async verifyBlockchainCredential(
    @Args('input') input: VerifyCredentialInput,
  ): Promise<CredentialDetailResponse | null> {
    try {
      const credential = await this.blockchainService.getStudentCredential(
        input.studentAddress,
        input.subject,
      );

      if (!credential || credential.ipfsHash === '') return null;

      return {
        ipfsHash: credential.ipfsHash,
        version: credential.version.toString(),
        totalComponents: credential.totalComponents.toString(),
        createdAt: credential.createdAt.toString(),
        lastUpdatedAt: credential.lastUpdatedAt.toString(),
        expiresAt: credential.expiresAt.toString(),
        revoked: credential.revoked,
        isExpired: credential.isExpired,
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
      const currentUser = context.req?.user;
      if (!currentUser || currentUser.role !== 'ADMIN') {
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

  // ==================== NEW RESOLVERS ====================

  // --- Component Management ---

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async removeComponent(
    @Args('input') input: RemoveComponentInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        return { success: false, error: 'Only admins can remove components' };
      }

      const txHash = await this.blockchainService.removeComponent(
        input.subjectName,
        input.componentName,
      );

      return {
        success: true,
        transactionHash: txHash,
        message: `Component '${input.componentName}' removed from '${input.subjectName}'`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => BatchUpdateResponse)
  async batchUpdateComponentGrade(
    @Args('input') input: BatchUpdateComponentInput,
    @Context() context,
  ): Promise<BatchUpdateResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'TEACHER' && currentUser.role !== 'ADMIN') {
        throw new Error('Only teachers and admins can batch grade');
      }

      // Upload each student's grade data to IPFS
      const ipfsHashes: string[] = [];
      for (const gradeDataStr of input.gradeDataArray) {
        const gradeData = JSON.parse(gradeDataStr);
        gradeData.issuer = currentUser.walletAddress;
        gradeData.gradedAt = new Date().toISOString();
        const hash = await this.ipfsService.uploadCredential(gradeData);
        ipfsHashes.push(hash);
      }

      const txHash = await this.blockchainService.batchUpdateComponent(
        input.studentAddresses,
        input.subjectName,
        input.componentName,
        ipfsHashes,
      );

      return {
        success: true,
        txHash,
        studentsProcessed: input.studentAddresses.length,
        message: `Batch graded ${input.studentAddresses.length} students`,
      };
    } catch (error) {
      throw new Error(`Batch update failed: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async isValidComponent(
    @Args('input') input: ComponentQueryInput,
  ): Promise<boolean> {
    try {
      return await this.blockchainService.isValidComponent(
        input.subjectName,
        input.componentName,
      );
    } catch (error) {
      return false;
    }
  }

  // --- Credential Stats & History ---

  @UseGuards(JwtAuthGuard)
  @Query(() => CredentialStatsResponse)
  async getCredentialStats(
    @Args('input') input: StudentSubjectInput,
    @Context() context,
  ): Promise<CredentialStatsResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
        throw new Error('Only admins and teachers can view credential stats');
      }

      return await this.blockchainService.getCredentialStats(
        input.studentAddress,
        input.subject,
      );
    } catch (error) {
      throw new Error(`Failed to get credential stats: ${error.message}`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [ComponentHistoryEntry])
  async getMyComponentHistory(
    @Args('subject') subject: string,
    @Context() context,
  ): Promise<ComponentHistoryEntry[]> {
    try {
      const user = context.req.user;
      if (!user.walletAddress) return [];

      // Use getStudentComponentHistory with the user's own address
      return await this.blockchainService.getStudentComponentHistory(
        user.walletAddress,
        subject,
      );
    } catch (error) {
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [ComponentHistoryEntry])
  async getStudentComponentHistory(
    @Args('input') input: StudentSubjectInput,
    @Context() context,
  ): Promise<ComponentHistoryEntry[]> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN' && currentUser.role !== 'TEACHER') {
        throw new Error('Only admins and teachers can view student history');
      }

      return await this.blockchainService.getStudentComponentHistory(
        input.studentAddress,
        input.subject,
      );
    } catch (error) {
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async isCredentialValid(
    @Args('input') input: StudentSubjectInput,
  ): Promise<boolean> {
    try {
      return await this.blockchainService.isCredentialValid(
        input.studentAddress,
        input.subject,
      );
    } catch (error) {
      return false;
    }
  }

  // --- Subject Management ---

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async subjectExistsOnChain(
    @Args('subject') subject: string,
  ): Promise<boolean> {
    try {
      return await this.blockchainService.subjectExistsOnChain(subject);
    } catch (error) {
      return false;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  async hasTeacherSubject(
    @Args('teacherAddress') teacherAddress: string,
    @Args('subject') subject: string,
    @Context() context,
  ): Promise<boolean> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        return false;
      }
      return await this.blockchainService.hasSubject(teacherAddress, subject);
    } catch (error) {
      return false;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Number)
  async getTeacherSubjectCount(
    @Args('teacherAddress') teacherAddress: string,
    @Context() context,
  ): Promise<number> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Only admins can view teacher subject counts');
      }
      return await this.blockchainService.getTeacherSubjectCount(teacherAddress);
    } catch (error) {
      throw new Error(`Failed to get teacher subject count: ${error.message}`);
    }
  }

  // --- DID Management ---

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async registerDIDForUser(
    @Args('input') input: RegisterDIDForUserInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        return { success: false, error: 'Only admins can register DID for users' };
      }

      const txHash = await this.blockchainService.registerDIDForUser(
        input.userAddress,
        input.did,
      );

      // Update user record
      await this.userService.updateDIDStatus(input.userAddress, input.did, true);

      return {
        success: true,
        transactionHash: txHash,
        message: `DID registered for user ${input.userAddress}`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => String)
  async didToAddress(
    @Args('didHash') didHash: string,
  ): Promise<string> {
    try {
      return await this.blockchainService.didToAddress(didHash);
    } catch (error) {
      throw new Error(`Failed to resolve DID: ${error.message}`);
    }
  }

  // --- Role Management ---

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TransactionResponse)
  async renounceRole(
    @Args('input') input: RenounceRoleInput,
    @Context() context,
  ): Promise<TransactionResponse> {
    try {
      const currentUser = context.req.user;
      const roles = this.blockchainService.getRoleConstants();

      let roleConstant: string;
      if (input.role === 'TEACHER_ROLE') {
        roleConstant = roles.TEACHER_ROLE;
      } else if (input.role === 'STUDENT_ROLE') {
        roleConstant = roles.STUDENT_ROLE;
      } else {
        return { success: false, error: 'Invalid role. Use TEACHER_ROLE or STUDENT_ROLE' };
      }

      const txHash = await this.blockchainService.renounceRole(
        roleConstant,
        input.callerConfirmation,
      );

      return {
        success: true,
        transactionHash: txHash,
        message: `Role ${input.role} renounced successfully`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => String)
  async getRoleAdmin(
    @Args('role') role: string,
    @Context() context,
  ): Promise<string> {
    try {
      const currentUser = context.req.user;
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Only admins can query role admins');
      }

      const roles = this.blockchainService.getRoleConstants();
      let roleConstant: string;
      if (role === 'TEACHER_ROLE') {
        roleConstant = roles.TEACHER_ROLE;
      } else if (role === 'STUDENT_ROLE') {
        roleConstant = roles.STUDENT_ROLE;
      } else if (role === 'BACKEND_ROLE') {
        roleConstant = roles.BACKEND_ROLE;
      } else {
        roleConstant = role; // Allow passing raw bytes32
      }

      return await this.blockchainService.getRoleAdmin(roleConstant);
    } catch (error) {
      throw new Error(`Failed to get role admin: ${error.message}`);
    }
  }

  // --- Utility ---

  @Query(() => Boolean)
  async supportsInterface(
    @Args('interfaceId') interfaceId: string,
  ): Promise<boolean> {
    try {
      return await this.blockchainService.supportsInterface(interfaceId);
    } catch (error) {
      return false;
    }
  }

}
