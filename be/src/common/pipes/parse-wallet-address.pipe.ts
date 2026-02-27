import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class ParseWalletAddressPipe implements PipeTransform {
  transform(value: any): string {
    if (!value || typeof value !== 'string') {
      throw new BadRequestException('Wallet address must be a string');
    }

    // Check if it's a valid Ethereum address
    if (!ethers.isAddress(value)) {
      throw new BadRequestException('Invalid Ethereum wallet address format');
    }

    return value.toLowerCase();
  }
}
