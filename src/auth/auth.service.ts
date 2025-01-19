import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { nanoid } from 'nanoid';
import { Account } from 'src/account/account.entity';
import { MoreThan, Repository } from 'typeorm';
import { Auth } from './auth.entity';
import { AuthProvider, AuthRequest } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly repo: Repository<Auth>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  create = async (data: Omit<Partial<Auth>, 'id'>) => {
    const record = this.repo.create({ id: `auth_${nanoid(19)}`, ...data });
    return await this.repo.save(record);
  };

  findByAccessToken = async (token: string) => {
    return await this.repo.findOne({
      where: {
        access_token: token,
      },
    });
  };

  findActiveActivities = async (accountId: string) => {
    return await this.repo.find({
      where: {
        account: { id: accountId },
        is_revoked: false,
        expires_at: MoreThan(new Date()),
      },
      relations: ['account'],
    });
  };

  // For when the user decides to log out of all devices
  revokeAccountTokens = async (accountId: string) => {
    const activities = await this.repo.find({
      where: { account: { id: accountId } },
    });

    const updatedActivities = activities.map((activity) => ({
      ...activity,
      is_revoked: true,
    }));

    await this.repo.save(updatedActivities);
  };

  callbackHandler = async (
    request: AuthRequest,
    response: Response,
    provider: AuthProvider,
  ) => {
    const accessToken = await this.jwtService.signAsync(
      { id: request.accountId },
      {
        expiresIn: '30d',
        secret: this.configService.get('JWT_SECRET'),
      },
    );

    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    await this.create({
      account: { id: request.accountId } as Account,
      expires_at: in30Days,
      access_token: accessToken,
      provider,
    });

    response.redirect(
      `${this.configService.get<string>('FRONTEND_URL')}?token=${accessToken}`,
    );
  };
}
