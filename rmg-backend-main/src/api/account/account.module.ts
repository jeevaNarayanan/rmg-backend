import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema, ContactInformation, ContactInformationSchema, PrimaryContact, PrimaryContactSchema } from '../schemas/account.schema';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [MongooseModule.forFeature([{name:Account.name, schema:AccountSchema},{name:PrimaryContact.name, schema:PrimaryContactSchema},{name:ContactInformation.name, schema:ContactInformationSchema}]),
   AuthModule,
   HttpModule,

  ],
  providers: [AccountService,ConfigService],
  controllers: [AccountController]
})
export class AccountModule {}
