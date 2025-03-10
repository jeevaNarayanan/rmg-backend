import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import handlebars from 'handlebars';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';


@Injectable()
export class MailService {
  sendMail(arg0: { to: string; subject: string; text: string; }) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private readonly mailerService: MailerService,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit(): any {
    this.eventEmitter.on(
      'event.data.generatePassword',
      (user, randomPassword) => {
        this.generateEmployerPassword(user, randomPassword);
      },
    );
    this.eventEmitter.on(
        'event.data.generateWelcomeMail',
        (user, randomPassword) => {
          this.sendWelcomeEmail(user, randomPassword);
        },
      );
      this.eventEmitter.on(
        'event.data.forgotPasswordOTP',
        (data) => {
          const { email, first_name, last_name, otp } = data;
          this.sendForgetPassword({ email, first_name, last_name }, otp);
        }
      );
      
    // this.eventEmitter.on(
    //   'event.data.generateWelcomeEmail',
    //   (user) => {
    //     this.sendWelcomeEmailRecruiter(user);
    //   },
    // );
    // this.eventEmitter.on(
    //   'event.data.welcomeMail',
    //   (user) => {
    //     this.candidateWelcomeMessage(user);
    //   },
    // );
    // this.eventEmitter.on(
    //   'event.data.AdminGeneratePassword',
    //   (user,randomPassword) => {
    //     this.generateAdminPassword(user,randomPassword);
    //   },
    // );
    // this.eventEmitter.on(
    //   'event.data.forgotPasswordOTP',
    //   (data) => {
    //     const { email, first_name, last_name, otp } = data;
    //     this.sendForgetPassword({ email, first_name, last_name }, otp);
    //   }
    // );
  }


  // async sendWelcomeEmail(user: any, randomPassword: string) {
  //   try {
  //     const emailBody = `
  //       Hi ${user.name},
  
  //       Welcome to RMG!
  
  //       We are excited to have you onboard. Below are your login details:
        
  //       Username: ${user.email}
  //       Password: ${randomPassword}
  
  //       You can log in using the above credential.
  
  //       If you have any questions, feel free to reach out to us.
  
  //       Best Regards,
  //       The Agira Team
  //     `;
  
  //     const info = await this.mailerService.sendMail({
  //       to: user.email,
  //       subject: 'Ekam: Welcome to RMG!',
  //       text: emailBody,
  //     });
  
  //     return info;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
  
async sendWelcomeEmail(user: any,randomPassword: string){
  try{
    const source = fs.readFileSync(`./src/templates/welcom-employer.hbs`,`utf8`);
    const template = handlebars.compile(source);
    const html = template({user, randomPassword})

    const info = await this.mailerService.sendMail({
      to: user.email,
      subject : 'Welcome to RMG',
      html: html

    });
    return info;
  }catch (error) {
    console.error('Error sending password email:', error);
      throw error;
  }
}

    //  sendWelcomeEmail(user: any, randomPassword: any) {
    //     throw new Error('Method not implemented.');
    // }
    generateEmployerPassword(user: any, randomPassword: any) {
        throw new Error('Method not implemented.');
    }
    sendWelcomeEmailPassword(user: any, randomPassword: any) {
        throw new Error('Method not implemented.');
    }
    // generateCandidatePassword(user: any, randomPassword: any) {
    //     throw new Error('Method not implemented.');
    // }



    async sendForgetPassword(user: any, otp: number) {
      try {
        const source = fs.readFileSync(`./src/templates/forgot-password.hbs`, 'utf8');
        const template = handlebars.compile(source);
        const html = template({
          user :user.first_name
          ? { first_name: user.first_name, last_name: user.last_name }
          : { name: user.name },
          otp
        });
    
        const info = await this.mailerService.sendMail({
          to: user.email,
          subject: 'RMG: Forgot Password',
          html: html
        });
    
        return info;
      } catch (error) {
        console.error('Error sending password email:', error);
        throw error; 
      }
    }


//   async sendForgetPassword(user: any, otp: number) {
//     const source = fs.readFileSync(
//       `./src/templates/forget-password-otp.hbs`,
//       'utf8',
//     );
//     const template = handlebars.compile(source);
//     const html = template({
//       user :user.first_name
//       ? { first_name: user.first_name, last_name: user.last_name }
//       : { name: user.name },
//       otp,
//       url: process.env.SITE_LOGO_URL,
//     });
 
//     const info = await this.mailerService.sendMail({
//       to: user.email,
//       subject: 'Ekam: Reset password',
//       html: html,
//     });
//     return info;
//   }

//   async generateCandidatePassword(user: any, randomPassword: string) {
//     try {
//       const source = fs.readFileSync(`./src/templates/password-candidate.hbs`, 'utf8');
//       const template = handlebars.compile(source);
//       const html = template({ user, randomPassword, url: process.env.SITE_LOGO_URL ,baseurl:process.env.BASEURL});
  
//       const info = await this.mailerService.sendMail({
//         to: user.email,
//         subject: 'Ekam: Login Password',
//         html: html
//       });
  
//       return info;
//     } catch (error) {
//       console.error('Error sending password email:', error);
//       throw error; 
//     }
//   }

//   async candidateWelcomeMessage(user: any) {
//     try {
//       const source = fs.readFileSync(`./src/templates/welcome-candidate.hbs`, 'utf8');
//       const template = handlebars.compile(source);
//       const html = template({ user, url: process.env.SITE_LOGO_URL,baseurl:process.env.BASEURL });
  
//       const info = await this.mailerService.sendMail({
//         to: user.email,
//         subject: 'Ekam: Welcome To Ekam',
//         html: html
//       });
  
//       return info;
//     } catch (error) {
//       throw error; 
//     }
//   }




//   async generateAdminPassword(user: any, randomPassword: string) {
//     try {
//       const source = fs.readFileSync(`./src/templates/password-admin.hbs`, 'utf8');
//       const template = handlebars.compile(source);
//       const html = template({ user:{name:user.name}, randomPassword, url: process.env.SITE_LOGO_URL });
  
//       const info = await this.mailerService.sendMail({
//         to: user.email,
//         subject: 'Ekam: Admin Login Password',
//         html: html
//       });
  
//       return info;
//     } catch (error) {
//       console.error('Error sending password :', error);
//       throw error; 
//     }
//   }

//   async sendPasswordChangeNotification(admin: any, randomPassword: string) {
//     try{
//     const source = fs.readFileSync('./src/templates/reset-password.hbs', 'utf8');
//     const template = handlebars.compile(source);
//     const html = template({admin:{name:admin.name}, randomPassword, url: process.env.SITE_LOGO_URL });
//     const info= await this.mailerService.sendMail({
//       to:admin.email,
//       subject: 'Password Change Notification',
//       html,
//     });
//     return info
//   }
//   catch (error) {
//     console.error('Error sending password :', error);
//     throw error;
//   }
// }

//   async sentJobAlert(user: any, company: any, job: any,) {
//     try {
//       const source = fs.readFileSync(`./src/templates/job-alert.hbs`, 'utf8');
//       const template = handlebars.compile(source);
//       const html = template({ job, company, user, url: process.env.BASEURL });

//       const info = await this.mailerService.sendMail({
//         to: user.email,
//         subject: `Ekam Job Alert: ${job.title}`,
//         html: html,
//       });
//       return info;
//     } catch (error) {
//       console.error('Error sending job alert email:', error);
//       throw error; // Propagate the error up to handle it at a higher level
//     }
//   }

//   async sendOtpPassword( data: { email: string, otp: number }) {
//     const { email, otp } = data;
//   try {
//       const source = fs.readFileSync(`./src/templates/change-email-otp.hbs`,
//       'utf8');
//       const template = handlebars.compile(source);
//       const html = template({ otp,url: process.env.SITE_LOGO_URL });
  
//       const info = await this.mailerService.sendMail({
//         to: email,
//         subject: `Your OTP Password`,
//         html: html,
//       });
//       return info;
//     } catch (error) {
//       console.error('Error sending OTP password email:', error);
//       throw error; 
//     }
//   }

//   async remarkEmail(user: any,remarks: string,){
//     try {
//        const source = fs.readFileSync(`./src/templates/remark-enquiry.hbs`,'utf8');
//        const template = handlebars.compile(source);
//        const html = template({user,remarks, url: process.env.SITE_LOGO_URL});

//        const info = await this.mailerService.sendMail({
//          to: user.email,
//          subject:`Re: Your enquiry at Ekam`,
//          html:html
//        });
//        return info;
//     }catch (error){
//       throw(error)
//     }
//   }

//   async invoiceMail(invoiceData: any, invoicePdf: any) {
//     try {
//       const source = fs.readFileSync(`./src/templates/invoice-email-template.hbs`,'utf8');
//       const template = handlebars.compile(source);
//       invoiceData.payment_id = invoiceData.payment_id ? invoiceData.payment_id : null;
//       invoiceData.reference_id = invoiceData.reference_id ? invoiceData.reference_id : null;
//       const html = template({user: invoiceData.recruiter, invoiceData: invoiceData, url: process.env.SITE_LOGO_URL, baseurl: process.env.BASEURL});
//       const info = await this.mailerService.sendMail({
//         to: invoiceData.recruiter.email,
//         subject: 'Ekam subscribtion Invoice',
//         html:html,
//         attachments: [
//           {
//             filename: 'invoice.pdf',
//             content: invoicePdf,
//             encoding: 'base64',
//           },
//         ],
//       })
//       return info;
//     } catch (error) {
//       throw(error)
//     }
//   }

//   async sendWelcomeEmailRecruiter(user: any,) {
//     try {
//       const source = fs.readFileSync(`./src/templates/welcome-email-recruiter.hbs`, 'utf8');
//       const template = handlebars.compile(source);
//       const html = template({ user, url: process.env.SITE_LOGO_URL, baseurl: process.env.BASEURL});
  
//       const info = await this.mailerService.sendMail({
//         to: user.email,
//         subject: 'Welcome to EKAM!',
//         html: html
//       });
  
//       return info;
//     } catch (error) {
//       console.error('Error sending password email:', error);
//       throw error; 
//     }
//   }

//   async sendWelcomeEmailPassword(user: any, randomPassword: string) {
//     try {
//       const source = fs.readFileSync(`./src/templates/password-recruiter.hbs`, 'utf8');
//       const template = handlebars.compile(source);
//       const html = template({ user, randomPassword, url: process.env.SITE_LOGO_URL,baseurl:process.env.BASEURL });
  
//       const info = await this.mailerService.sendMail({
//         to: user.email,
//         subject: 'Ekam: Login Password',
//         html: html
//       });
  
//       return info;
//     } catch (error) {
//       console.error('Error sending password email:', error);
//       throw error; 
//     }
//   }


}
