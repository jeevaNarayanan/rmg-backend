import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';
import { AuthService } from './auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { EmployeeModule } from './employee/employee.module';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AccountModule } from './account/account.module';
// import { GreetingsModule } from './greetings/greetings.module';
import { AuditModule } from './audit/audit.module';
import { ProjectModule } from './project/project.module';
import { LogModule } from './log/log.module';

@Module({
  imports: [AuthModule, TestModule, AdminModule, EmployeeModule, MailModule, DashboardModule, AccountModule, AuditModule, ProjectModule, LogModule],
  controllers:[],
  providers:[]
})
export class ApiModule {
}
