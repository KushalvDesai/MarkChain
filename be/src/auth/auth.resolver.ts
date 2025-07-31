import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { NonceResponse, AuthResponse, VerifySignatureInput } from './auth.types';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => NonceResponse)
  async generateNonce(
    @Args('walletAddress') walletAddress: string,
  ): Promise<NonceResponse> {
    return this.authService.generateNonce(walletAddress);
  }

  @Mutation(() => AuthResponse)
  async verifySignature(
    @Args('input') input: VerifySignatureInput,
  ): Promise<AuthResponse> {
    return this.authService.verifySignature(input);
  }

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async me(@Context() context: any): Promise<string> {
    return `Hello ${context.req.user.walletAddress}! Your DID is ${context.req.user.did}`;
  }
}
