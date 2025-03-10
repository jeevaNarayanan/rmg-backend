import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditSchema } from '../schemas/audit.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Audit.name, schema: AuditSchema },
    ]),
    AuthModule
  ],
  controllers: [AuditController],
  providers: [AuditService]
})
export class AuditModule {}
