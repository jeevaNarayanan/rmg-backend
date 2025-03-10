import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
// import { MicrosoftStrategy } from './microsoft.strategy';
import { MicrosoftService } from './microsoft.strategy';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [ConfigService, AuthService, JwtService,MicrosoftService],
  exports: [AuthService]
})
export class AuthModule {}
