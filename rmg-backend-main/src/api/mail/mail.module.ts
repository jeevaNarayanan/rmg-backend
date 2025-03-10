import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
    imports: [
        MailerModule.forRoot({
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: 'jeeva.narayanan2012@gmail.com',
              pass: '',
            },
          },
        }),
      ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
