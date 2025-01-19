import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { nanoid } from 'nanoid';
import { AuthProvider } from 'src/auth/auth.interface';
import { mergeProps, PartialOrPromise, sql } from 'src/lib/utils';
import { Repository } from 'typeorm';
import { Account } from './account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private readonly repo: Repository<Account>,
  ) {}

  async create(data: Omit<Partial<Account>, 'id'>) {
    const record = this.repo.create({ id: `acc_${nanoid(19)}`, ...data });
    return await this.repo.save(record);
  }

  findById = async (id: string) => {
    return await this.repo.findOneBy({ id });
  };

  async findByEmail(email: string): Promise<Account | null> {
    return await this.repo.query(
      sql`SELECT * FROM account WHERE emails @> ARRAY[$1]::text[]`,
      [email],
    );
  }

  async findBySSO(
    provider: AuthProvider,
    userId: string,
  ): Promise<Account | null> {
    const response = await this.repo.query(
      sql`SELECT * FROM account WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(account.sso->'values') AS element WHERE element->>'provider' = $1::text AND element->>'userId' = $2::text)`,
      [provider, userId],
    );
    return response;
  }

  update = async (
    id: string,
    fn: (account: Account) => PartialOrPromise<Account>,
  ) => {
    try {
      const account = await this.findById(id);
      if (account) {
        mergeProps(account, await fn(account));
        return await this.repo.save(account);
      }
    } catch (error) {
      throw new Error(error);
    }
  };
}
