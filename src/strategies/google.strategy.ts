import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AccountService } from 'src/account/account.service';
import { AuthProvider } from 'src/auth/auth.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private accountService: AccountService,
    private readonly configService: ConfigService,
  ) {
    const clientID = configService.get<string>('GOOGLE_ID');
    const clientSecret = configService.get('GOOGLE_SECRET');
    const callbackURL = `${configService.get('API_URL')}/auth/google/callback`;

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    try {
      const ssoAccount = await this.accountService.findBySSO(
        AuthProvider.GOOGLE,
        profile.id,
      );

      const account =
        ssoAccount ||
        (await this.accountService.findByEmail(profile.emails[0].value));

      // If account is found by email but does not have SSO, update the SSO
      if (account && !ssoAccount) {
        await this.accountService.update(account.id, (account) => ({
          ...account,
          sso: {
            values: [
              ...account.sso.values,
              { provider: AuthProvider.GOOGLE, userId: profile.id },
            ],
          },
        }));
      }

      if (!account?.id) {
        const newAccount = await this.accountService.create({
          emails: profile.emails.map(({ value }) => value),
          basic_info: {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            avartarUrl: profile.photos[0].value,
          },
          sso: {
            values: [{ provider: AuthProvider.GOOGLE, userId: profile.id }],
          },
        });
        done(null, { accountId: newAccount.id });
        return newAccount;
      }

      done(null, { accountId: account.id });
      return account;
    } catch (error) {
      done(error, null);
      throw new Error(error);
    }
  }
}
