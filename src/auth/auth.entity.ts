import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Account } from '../account/account.entity';
import { AuthProvider } from './auth.interface';

@Entity({ name: 'auth' })
export class Auth {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Account, (account) => account.login_activities, {
    onDelete: 'CASCADE',
  })
  account: Account;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  access_token: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date | null;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, unknown>;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'enum', enum: AuthProvider })
  provider: AuthProvider;

  @Column({ type: 'boolean', default: false })
  is_revoked: boolean;
}
