import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Auth } from '../auth/auth.entity';
import { AuthProvider } from '../auth/auth.interface';
import { AccountBasicInfo } from './account.interface';

@Entity({ name: 'account' })
export class Account {
  @PrimaryColumn()
  id: string;

  @Column('text', { array: true })
  @Index('emails_index', { unique: true }) // Ensure unique and indexed emails
  emails: string[];

  @Column('jsonb', { array: false })
  @Index('sso_gin_index', { synchronize: false })
  sso: {
    values: {
      provider: AuthProvider;
      userId: string; // The ID for the user from the provider
    }[];
  };

  @Column({ type: 'jsonb' })
  basic_info: Partial<AccountBasicInfo>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Auth, (_) => _.account)
  login_activities: Auth[];
}
