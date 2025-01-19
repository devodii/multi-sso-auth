import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async intercept(
    ctx: ExecutionContext,
    handler: CallHandler<any>,
  ): Promise<any> {
    const request = ctx.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) return handler.handle();

    let decodedAccount: { id: string; email: string };

    try {
      decodedAccount = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      console.log({ decodedAccount });
    } catch {}

    try {
      const accountId = decodedAccount['id'];

      if (accountId) {
        const account = await this.accountService.findById(accountId);

        request.currentUser = account;
      }
    } catch (err) {
      throw new Error(err);
    }

    return handler.handle();
  }

  public extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
