import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookStrategy } from 'src/strategies/facebook.strategy';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { AuthController } from './auth.controller';
import { Auth } from './auth.entity';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auth])],
  providers: [AuthService, GoogleStrategy, FacebookStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
