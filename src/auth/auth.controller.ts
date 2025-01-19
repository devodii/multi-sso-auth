import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { FacebookAuthGuard } from 'src/guards/facebook-auth.guard';
import { GoogleAuthGuard } from 'src/guards/google-auth.guard';
import { JwtAuth } from 'src/guards/jwt.guard';
import { Account } from '../account/account.entity';
import { AuthProvider, AuthRequest } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('whoAmI')
  async whoAmI(@CurrentUser() user: Account) {
    console.log({ user });
    return user;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() {
    return HttpStatus.OK;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() request: AuthRequest, @Res() response: Response) {
    await this.authService.callbackHandler(
      request,
      response,
      AuthProvider.GOOGLE,
    );
  }

  @Get('/facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookCallback(
    @Req() request: AuthRequest,
    @Res() response: Response,
  ) {
    await this.authService.callbackHandler(
      request,
      response,
      AuthProvider.FACEBOOK,
    );
  }

  @JwtAuth()
  @Get('protected')
  async protected() {
    return { data: 'protected' };
  }
}
