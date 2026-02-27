import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ethers } from 'ethers';
import { GRADING_SSI_ABI } from './contract-abi';
import { IPFSService } from './ipfs.service';
import { Subject, SubjectDocument } from '../schemas/subject.schema';
import { Component, ComponentDocument } from '../schemas/component.schema';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(
    private configService: ConfigService,
    private readonly ipfsService: IPFSService,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Component.name) private componentModel: Model<ComponentDocument>,
  ) {
    this.initializeBlockchain();
  }

  private initializeBlockchain() {
    try {
      const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
      const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
      const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

      // this.logger.log(`Blockchain Config - RPC URL: ${rpcUrl}`);
      // this.logger.log(`Blockchain Config - Private Key: ${privateKey ? privateKey.substring(0, 10) + '...' : 'NOT SET'}`);
      // this.logger.log(`Blockchain Config - Contract Address: ${contractAddress}`);

      if (!rpcUrl || !privateKey || !contractAddress) {
        throw new Error('Missing required blockchain configuration');
      }

      if (privateKey === 'your_private_key_here') {
        throw new Error('Please set a real private key in BLOCKCHAIN_PRIVATE_KEY environment variable');
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(contractAddress, GRADING_SSI_ABI, this.wallet);

      this.logger.log('Blockchain service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  // Role Management Functions
  async assignRole(userAddress: string, role: string): Promise<string> {
    try {
      const tx = await this.contract.assignRole(userAddress, role);
      await tx.wait();
      this.logger.log(`Role ${role} assigned to ${userAddress}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to assign role: ${error.message}`);
      throw error;
    }
  }

  async grantRole(role: string, account: string): Promise<string> {
    try {
      const tx = await this.contract.grantRole(role, account);
      await tx.wait();
      this.logger.log(`Role ${role} granted to ${account}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to grant role: ${error.message}`);
      throw error;
    }
  }

  async revokeRole(role: string, account: string): Promise<string> {
    try {
      const tx = await this.contract.revokeRole(role, account);
      await tx.wait();
      this.logger.log(`Role ${role} revoked from ${account}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to revoke role: ${error.message}`);
      throw error;
    }
  }

  async hasRole(role: string, account: string): Promise<boolean> {
    try {
      return await this.contract.hasRole(role, account);
    } catch (error) {
      this.logger.error(`Failed to check role: ${error.message}`);
      throw error;
    }
  }

  // DID Management Functions
  async registerDID(did: string): Promise<string> {
    try {
      const tx = await this.contract.registerDID(did);
      await tx.wait();
      this.logger.log(`DID registered: ${did}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to register DID: ${error.message}`);
      throw error;
    }
  }

  async getDID(userAddress: string): Promise<string> {
    try {
      const didBytes32 = await this.contract.didRegistry(userAddress);
      return didBytes32 === ethers.ZeroHash ? '' : didBytes32;
    } catch (error) {
      this.logger.error(`Failed to get DID: ${error.message}`);
      throw error;
    }
  }

  // Credential Management Functions
  async issueOrUpdateCredential(
    studentAddress: string,
    subject: string,
    ipfsHash: string
  ): Promise<string> {
    try {
      const tx = await this.contract.issueOrUpdateCredential(
        studentAddress,
        subject,
        ipfsHash
      );
      await tx.wait();
      this.logger.log(`Credential issued for ${studentAddress} in ${subject}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to issue credential: ${error.message}`);
      throw error;
    }
  }

  // Alias method for issueOrUpdateCredential with DID-based parameters
  async issueCredential(
    studentDID: string,
    vcHash: string,
    ipfsHash: string
  ): Promise<string> {
    try {
      // Extract address from DID if needed, or use as is
      // DID format: did:ethr:0xAddress
      const addressMatch = studentDID.match(/0x[a-fA-F0-9]{40}/);
      const studentAddress = addressMatch ? addressMatch[0] : studentDID;

      // Use a generic subject identifier or hash for this type of credential
      const tx = await this.contract.issueOrUpdateCredential(
        studentAddress,
        vcHash.substring(0, 32), // Use first 32 chars of hash as subject identifier
        ipfsHash
      );
      await tx.wait();
      this.logger.log(`Credential issued for ${studentDID} with hash ${vcHash}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to issue credential: ${error.message}`);
      throw error;
    }
  }

  async revokeCredential(studentAddress: string, subject: string): Promise<string> {
    try {
      const tx = await this.contract.revokeCredential(studentAddress, subject);
      await tx.wait();
      this.logger.log(`Credential revoked for ${studentAddress} in ${subject}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to revoke credential: ${error.message}`);
      throw error;
    }
  }

  async getMySubjectCredential(subject: string): Promise<any> {
    try {
      return await this.contract.getMySubjectCredential(subject);
    } catch (error) {
      this.logger.error(`Failed to get my credential: ${error.message}`);
      throw error;
    }
  }

  async getStudentSubjectCredential(
    studentAddress: string,
    subject: string
  ): Promise<any> {
    try {
      return await this.contract.getStudentSubjectCredential(studentAddress, subject);
    } catch (error) {
      this.logger.error(`Failed to get student credential: ${error.message}`);
      throw error;
    }
  }

  // Subject Management Functions
  async assignSubjectToTeacher(teacherAddress: string, subject: string): Promise<string> {
    try {
      const tx = await this.contract.assignSubjectToTeacher(teacherAddress, subject);
      await tx.wait();
      this.logger.log(`Subject ${subject} assigned to teacher ${teacherAddress}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to assign subject to teacher: ${error.message}`);
      throw error;
    }
  }

  async removeSubjectFromTeacher(teacherAddress: string, subject: string): Promise<string> {
    try {
      const tx = await this.contract.removeSubjectFromTeacher(teacherAddress, subject);
      await tx.wait();
      this.logger.log(`Subject ${subject} removed from teacher ${teacherAddress}`);
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to remove subject from teacher: ${error.message}`);
      throw error;
    }
  }

  async getTeacherSubjects(teacherAddress: string): Promise<string[]> {
    try {
      const subjects: string[] = [];
      let index = 0;
      
      while (true) {
        try {
          const subject = await this.contract.teacherSubjects(teacherAddress, index);
          if (!subject) break;
          subjects.push(subject);
          index++;
        } catch {
          break;
        }
      }
      
      return subjects;
    } catch (error) {
      this.logger.error(`Failed to get teacher subjects: ${error.message}`);
      throw error;
    }
  }

  // Role Constants
  getRoleConstants() {
    return {
      DEFAULT_ADMIN_ROLE: ethers.ZeroHash,
      STUDENT_ROLE: ethers.keccak256(ethers.toUtf8Bytes('STUDENT_ROLE')),
      TEACHER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('TEACHER_ROLE'))
    };
  }

  // Utility Functions
  getContractAddress(): string {
    return this.contract.target.toString();
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  /**
   * 1. Create a new credential for a student
   * @param studentAddress - Student's blockchain address
   * @param subject - Subject name
   * @param ipfsHash - IPFS hash of credential data
   * @param validityPeriod - Validity period in seconds (e.g., 31536000 = 1 year)
   * @returns Transaction hash
   */
  async createCredential(
    studentAddress: string,
    subject: string,
    ipfsHash: string,
    validityPeriod: number
  ): Promise<string> {
    try {
      if (typeof this.contract.createCredential !== 'function') {
        throw new Error(
          'createCredential does not exist on the deployed contract. ' +
          'You may need to redeploy the new GradingSSI contract and update CONTRACT_ADDRESS in .env'
        );
      }
      const tx = await this.contract.createCredential(
        studentAddress,
        subject,
        ipfsHash,
        validityPeriod
      );
      await tx.wait();
      this.logger.log(
        `Credential created for ${studentAddress} in ${subject} with ${validityPeriod}s validity`
      );
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to create credential: ${error.message}`);
      throw error;
    }
  }

  /**
   * 2. Update credential with a specific component grade
   * @param studentAddress - Student's blockchain address
   * @param subject - Subject name
   * @param component - Component name (e.g., "Midterm", "Final", "Assignment 1")
   * @param ipfsHash - IPFS hash of the component grade data
   * @returns Transaction hash
   */
  async updateCredentialWithComponent(
    studentAddress: string,
    subject: string,
    component: string,
    ipfsHash: string
  ): Promise<string> {
    try {
      const tx = await this.contract.updateCredentialWithComponent(
        studentAddress,
        subject,
        component,
        ipfsHash
      );
      await tx.wait();
      this.logger.log(
        `Component '${component}' updated for ${studentAddress} in ${subject}`
      );
      return tx.hash;
    } catch (error) {
      this.logger.error(`Failed to update credential component: ${error.message}`);
      throw error;
    }
  }

  /**
   * 3. Get student's own credential (called by student)
   * @param subject - Subject name
   * @returns Credential details with all metadata
   */
  async getMyCredential(subject: string): Promise<{
    ipfsHash: string;
    version: bigint;
    totalComponents: bigint;
    createdAt: bigint;
    lastUpdatedAt: bigint;
    expiresAt: bigint;
    revoked: boolean;
    isExpired: boolean;
  }> {
    try {
      const result = await this.contract.getMyCredential(subject);
      this.logger.log(`Retrieved credential for subject: ${subject}`);
      
      return {
        ipfsHash: result.ipfsHash,
        version: result.version,
        totalComponents: result.totalComponents,
        createdAt: result.createdAt,
        lastUpdatedAt: result.lastUpdatedAt,
        expiresAt: result.expiresAt,
        revoked: result.revoked,
        isExpired: result.isExpired
      };
    } catch (error) {
      this.logger.error(`Failed to get my credential: ${error.message}`);
      throw error;
    }
  }

  /**
   * 4. Get student's credential (called by admin/teacher)
   * @param studentAddress - Student's blockchain address
   * @param subject - Subject name
   * @returns Credential details with all metadata
   */
  async getStudentCredential(
    studentAddress: string,
    subject: string
  ): Promise<{
    ipfsHash: string;
    version: bigint;
    totalComponents: bigint;
    createdAt: bigint;
    lastUpdatedAt: bigint;
    expiresAt: bigint;
    revoked: boolean;
    isExpired: boolean;
  }> {
    try {
      const result = await this.contract.getStudentCredential(studentAddress, subject);
      this.logger.log(`Retrieved credential for ${studentAddress} in ${subject}`);
      
      return {
        ipfsHash: result.ipfsHash,
        version: result.version,
        totalComponents: result.totalComponents,
        createdAt: result.createdAt,
        lastUpdatedAt: result.lastUpdatedAt,
        expiresAt: result.expiresAt,
        revoked: result.revoked,
        isExpired: result.isExpired
      };
    } catch (error) {
      this.logger.error(`Failed to get student credential: ${error.message}`);
      throw error;
    }
  }

  /**
   * 5. Check if a credential is valid (not revoked and not expired)
   * @param studentAddress - Student's blockchain address
   * @param subject - Subject name
   * @returns True if valid, false otherwise
   */
  async isCredentialValid(studentAddress: string, subject: string): Promise<boolean> {
    try {
      const isValid = await this.contract.isCredentialValid(studentAddress, subject);
      this.logger.log(
        `Credential validity check for ${studentAddress} in ${subject}: ${isValid}`
      );
      return isValid;
    } catch (error) {
      this.logger.error(`Failed to check credential validity: ${error.message}`);
      throw error;
    }
  }

  /**
   * 6. Create a new subject - User pays gas fees via MetaMask
   * Frontend calls smart contract directly, then sends tx hash to this API
   * @param subjectName - Subject name
   * @param transactionHash - Transaction hash from MetaMask signed transaction
   * @param createdBy - User who created it
   * @param description - Optional subject description
   * @param credits - Optional subject credits
   * @returns Success status and saved subject
   */
  async createSubject(
    subjectName: string,
    transactionHash: string,
    createdBy: string,
    description?: string,
    credits?: number
  ) {
    try {
      // Validate transaction hash - check for all falsy values
      if (!transactionHash || 
          transactionHash === 'null' || 
          transactionHash === 'undefined' ||
          typeof transactionHash === 'undefined' ||
          transactionHash.trim() === '') {
        throw new Error('Transaction hash is required. Please sign the transaction with MetaMask first. Frontend must send the tx hash from MetaMask.');
      }
      
      // Validate transaction hash format (should be 0x followed by 64 hex characters)
      const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
      if (!txHashRegex.test(transactionHash)) {
        throw new Error(`Invalid transaction hash format. Received: "${transactionHash}". Expected: 0x followed by 64 hexadecimal characters.`);
      }
      
      // Verify transaction exists on blockchain
      const txReceipt = await this.provider.getTransactionReceipt(transactionHash);
      if (!txReceipt) {
        throw new Error('Transaction not found on blockchain. Please wait for confirmation.');
      }
      
      if (txReceipt.status === 0) {
        throw new Error('Transaction failed on blockchain');
      }
      
      // Verify transaction was sent to our contract
      if (txReceipt.to?.toLowerCase() !== this.contract.target.toString().toLowerCase()) {
        throw new Error('Transaction was not sent to the correct contract');
      }
      
      this.logger.log(`Transaction verified successfully`);
      
      // Check if subject already exists with this transaction hash
      const existingSubject = await this.subjectModel.findOne({ blockchainHash: transactionHash });
      if (existingSubject) {
        this.logger.log(`Subject already exists with this transaction hash`);
        return {
          success: true,
          txHash: transactionHash,
          subject: {
            _id: String(existingSubject._id),
            subjectName: existingSubject.subjectName,
            blockchainHash: existingSubject.blockchainHash,
            isActive: existingSubject.isActive,
            createdBy: existingSubject.createdBy,
            description: existingSubject.description,
            credits: existingSubject.credits,
            createdAt: existingSubject.createdAt.toISOString(),
            updatedAt: existingSubject.updatedAt.toISOString(),
          }
        };
      }
      
      // Save to MongoDB
      const newSubject = new this.subjectModel({
        subjectName,
        blockchainHash: transactionHash,
        createdBy,
        description,
        credits,
        isActive: true,
      });
      
      const savedSubject = await newSubject.save();
      this.logger.log(`Subject saved to MongoDB: ${subjectName}`);
      
      return {
        success: true,
        txHash: transactionHash,
        subject: {
          _id: String(savedSubject._id),
          subjectName: savedSubject.subjectName,
          blockchainHash: savedSubject.blockchainHash,
          isActive: savedSubject.isActive,
          createdBy: savedSubject.createdBy,
          description: savedSubject.description,
          credits: savedSubject.credits,
          createdAt: savedSubject.createdAt.toISOString(),
          updatedAt: savedSubject.updatedAt.toISOString(),
        }
      };
    } catch (error) {
      this.logger.error(`Failed to create subject: ${error.message}`);
      throw new Error(`Failed to create subject: ${error.message}`);
    }
  }

  /**
   * 7. Register a component for a subject (Admin only)
   * @param subject - Subject name
   * @param component - Component name (e.g., "Midterm", "Assignments")
   * @param createdBy - Admin who created it
   * @param weightage - Optional weightage for component
   * @param maxMarks - Optional max marks
   * @returns Transaction hash, success status, and saved component
   */
  async registerComponent(
    subject: string, 
    component: string, 
    createdBy?: string,
    weightage?: number,
    maxMarks?: number
  ) {
    try {
      // Guard: check the function exists on the deployed contract
      if (typeof this.contract.registerComponent !== 'function') {
        throw new Error(
          'registerComponent does not exist on the deployed contract. ' +
          'You may need to redeploy the new GradingSSI contract and update CONTRACT_ADDRESS in .env'
        );
      }

      // Register on blockchain
      const tx = await this.contract.registerComponent(subject, component);
      if (!tx) {
        throw new Error('Transaction returned undefined — contract may not match the ABI');
      }
      await tx.wait();
      this.logger.log(`Component '${component}' registered on blockchain for subject: ${subject}`);
      
      // Save to MongoDB
      const newComponent = new this.componentModel({
        componentName: component,
        subjectName: subject,
        blockchainHash: tx.hash,
        createdBy: createdBy || 'admin',
        weightage: weightage,
        maxMarks: maxMarks,
        isActive: true,
      });
      const savedComponent = await newComponent.save();
      this.logger.log(`Component saved to MongoDB: ${component}`);
      
      return { 
        txHash: tx.hash,
        success: true,
        component: {
          _id: String(savedComponent._id),
          componentName: savedComponent.componentName,
          subjectName: savedComponent.subjectName,
          blockchainHash: savedComponent.blockchainHash,
          isActive: savedComponent.isActive,
          createdBy: savedComponent.createdBy,
          weightage: savedComponent.weightage,
          maxMarks: savedComponent.maxMarks,
          createdAt: savedComponent.createdAt.toISOString(),
          updatedAt: savedComponent.updatedAt.toISOString(),
        }
      };
    } catch (error) {
      this.logger.error(`Failed to register component: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all subjects from MongoDB
   */
  async getAllSubjects() {
    try {
      const subjects = await this.subjectModel.find({ isActive: true }).exec();
      return subjects.map(subject => ({
        _id: String(subject._id),
        subjectName: subject.subjectName,
        blockchainHash: subject.blockchainHash,
        isActive: subject.isActive,
        createdBy: subject.createdBy,
        description: subject.description,
        credits: subject.credits,
        createdAt: subject.createdAt.toISOString(),
        updatedAt: subject.updatedAt.toISOString(),
      }));
    } catch (error) {
      this.logger.error(`Failed to get subjects: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get components for a subject from MongoDB
   */
  async getSubjectComponents(subjectName: string) {
    try {
      const components = await this.componentModel.find({ subjectName, isActive: true }).exec();
      return components.map(component => ({
        _id: String(component._id),
        componentName: component.componentName,
        subjectName: component.subjectName,
        blockchainHash: component.blockchainHash,
        isActive: component.isActive,
        createdBy: component.createdBy,
        weightage: component.weightage,
        maxMarks: component.maxMarks,
        createdAt: component.createdAt.toISOString(),
        updatedAt: component.updatedAt.toISOString(),
      }));
    } catch (error) {
      this.logger.error(`Failed to get components: ${error.message}`);
      throw error;
    }
  }

 async createNewCredential(
  studentAddress: string,
  subjectName: string,
  credentialData: object,
  validityPeriod: number // in seconds, e.g. 31536000 = 1 year
): Promise<{ txHash: string; ipfsHash: string; success: boolean }> {
  try {
    // 1. Check subject exists in MongoDB
    const subject = await this.subjectModel.findOne({ subjectName, isActive: true });
    if (!subject) {
      throw new Error(`Subject '${subjectName}' does not exist. Create it first.`);
    }

    // 2. Check credential doesn't already exist for this student+subject
    const alreadyExists = await this.contract.isCredentialValid(studentAddress, subjectName)
      .catch(() => false);
    // isCredentialValid returns false for non-existent too, so check via getStudentCredential
    try {
      const existing = await this.contract.getStudentCredential(studentAddress, subjectName);
      if (existing && existing.createdAt > 0n) {
        throw new Error(
          `Credential already exists for student ${studentAddress} in subject '${subjectName}'. Use updateCredentialWithComponent to add grades.`
        );
      }
    } catch (e) {
      // If error is our custom message, rethrow
      if (e.message.includes('Credential already exists')) throw e;
      // Otherwise it means credential doesn't exist — continue
    }

    // 3. Upload credential data to IPFS
    const ipfsHash = await this.ipfsService.uploadCredential({
      ...credentialData,
      subject: subjectName,
      studentAddress,
      createdAt: new Date().toISOString(),
    } as any);
    this.logger.log(`Credential data uploaded to IPFS: ${ipfsHash}`);

    // 4. Create credential on blockchain
    const tx = await this.contract.createCredential(
      studentAddress,
      subjectName,
      ipfsHash,
      validityPeriod
    );
    await tx.wait();
    this.logger.log(`Credential created on blockchain for ${studentAddress} in ${subjectName}`);

    return { txHash: tx.hash, ipfsHash, success: true };
  } catch (error) {
    this.logger.error(`Failed to create credential: ${error.message}`);
    throw error;
  }
}

}