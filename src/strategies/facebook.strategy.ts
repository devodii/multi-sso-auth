import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AccountService } from 'src/account/account.service';
import { AuthProvider } from 'src/auth/auth.interface';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountService: AccountService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_ID'),
      callbackURL: `${configService.get<string>('FACEBOOK_APP_ID')}/auth/facebook/callback`,
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails, id: subId } = profile;

    console.log({ profile });

    const ssoAccount = await this.accountService.findBySSO(
      AuthProvider.FACEBOOK,
      subId,
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
        emails: emails.map(({ value }) => value),
        basic_info: {
          firstName: name.givenName,
          lastName: name.familyName,
          avartarUrl: profile.profileUrl,
        },
        sso: {
          values: [{ provider: AuthProvider.FACEBOOK, userId: profile.id }],
        },
      });
      done(null, { accountId: newAccount.id });
      return newAccount;
    }

    done(null, { accountId: account.id });
  }
}
