  
import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MicrosoftService } from './microsoft.strategy';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly microsoftService: MicrosoftService
  ) {}


  @Get('microsoft')
  async microsoftAuth(@Res() res:Response) {
    try{
      const state = false;
      const url = this.microsoftService.getAuthorizationUrl(state);
      console.log({url});
      res.redirect(url);
    }catch(err){
      console.log("err--->",err);
      
    }
  }
  
  @Get('microsoft/callback')
  async microsoftAuthRedirect(@Query('code') code: string, @Res() res: Response) {
    console.log({code});
    
    const accessToken = await this.microsoftService.getAccessToken(code);
    console.log({accessToken});
    
    const profile = await this.jwtService.decode(accessToken);
    console.log({profile});
    
    // const profile = await this.microsoftService.getUserProfile(accessToken);
  
    const user = {
      email: profile.unique_name,
      firstName: profile.given_name,
      lastName: profile.family_name,
    };
    
    const employer = await this.authService.validateUser(user, accessToken, 'microsoft');
    if (employer) {
      const mobileNotExists = employer.mobile_number ? false : true;
      // const secret = process.env.JWT_SECRET
      const jwtConfig = this.configService.get('jwt');
      const secrets = jwtConfig?.secret || 'rmginternalproject';
      console.log("secret",secrets)
      // const token = await this.authService.generatJwt(employer, 'employer', this.configService.get('jwt').secret, mobileNotExists);
      const token = await this.authService.generatJwt(employer, 'employer', secrets, mobileNotExists);
      
      res.cookie('auth_token', token?.access_token, {
        sameSite: "lax",
        secure: true,
        maxAge: 3600000,
        // domain: process.env.DOMAIN,
        domain: "localhost"
      });
      
      res.redirect("http://localhost:3000/employee-stack");
    } else {
      res.cookie('error', 'res.InactiveAccount', {
        sameSite: "lax",
        secure: true,
        maxAge: 3600000,
        // domain: process.env.DOMAIN,
        domain: "localhost"
      });
      res.redirect("http://localhost:3000/employee-stack");
    }
  }
//   @Get('microsoft/callback')
// async microsoftAuthRedirect(@Query('code') code: string, @Res() res: Response) {
//   try {
//     console.log("Authorization Code:", code);  // Log the received code
    
//     const accessToken = await this.microsoftService.getAccessToken(code);
//     console.log("Access Token:", accessToken);  // Check the value of the token
    
//     // Check if the accessToken is undefined or null
//     if (!accessToken) {
//       console.error("Failed to retrieve access token");
//       return res.redirect(process.env.ERROR_REDIRECT || "http://localhost:3001/error");
//     }

//     const profile = await this.jwtService.decode(accessToken) as any;
//     if (!profile) {
//       console.error("No profile data found");
//       return res.redirect(process.env.ERROR_REDIRECT || "http://localhost:3001/error");
//     }

//     console.log("Decoded Profile:", profile);

//     const user = {
//       email: profile.email,
//       firstName: profile.given_name,
//       lastName: profile.family_name,
//     };
    
//     const employer = await this.authService.validateUser(user, accessToken, 'microsoft');
//     if (employer) {
//       const token = await this.authService.generatJwt(employer, 'employer', 'rmginternalproject', false);
      
//       res.cookie('auth_token', token?.access_token, {
//         sameSite: "lax",
//         secure: true,
//         maxAge: 3600000,
//         domain: "localhost",
//       });
      
//       res.redirect("http://localhost:3001/auth/microsoft/callback");
//     } else {
//       res.cookie('error', 'res.InactiveAccount', {
//         sameSite: "lax",
//         secure: true,
//         maxAge: 3600000,
//         domain: "localhost",
//       });
//       res.redirect(process.env.ERROR_REDIRECT || "http://localhost:3001/error");
//     }
//   } catch (err) {
//     console.error("Error in microsoftAuthRedirect:", err);
//     res.redirect(process.env.ERROR_REDIRECT || "http://localhost:3001/error");
//   }
// }

}
  
