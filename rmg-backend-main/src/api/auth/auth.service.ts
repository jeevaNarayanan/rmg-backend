import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IJwtConfig } from 'src/utils/interface.utils';
import { Connection, Types } from "mongoose";
import { InjectConnection } from '@nestjs/mongoose';
// import { ReferenceCounter } from '../schemas/reference-counter.schema';
import { ObjectId } from 'mongodb';
@Injectable()
export class AuthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

  ) {}

  async generatJwt(user, role, secret, mobileNotExists: boolean = false): Promise<{ access_token: string }> {
    let payload: any = {
      sub: user._id,
      first_name: user.first_name || user.name,
      last_name: user.last_name,
      role: role,
    };
    if (mobileNotExists) {
      payload.mobileNotExists = true;
    }
    // const secret = this.configService.get<IJwtConfig>('jwt');
    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: secret,
        expiresIn: process.env.JWT_EXPIRES_IN
      }),
    };
  }

  async verifyToken(token) {
    const secret = process.env.JWT_SECRET
    // this.configService.get<IJwtConfig>('jwt');
    const valid = await this.jwtService.verifyAsync(token, {
      secret: secret,
    });
    await this.checkUserStatus(valid);
    return valid;
  }

  async verifyUserToken(authorization, secret) {
    try {
      if (!authorization) {
        throw new HttpException(
            'Token is required for authentication',
          HttpStatus.BAD_REQUEST,
        );
      }
      const key = authorization.split(' ');
      const token = key[1];
      const valid = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });
      if(!valid) {
        throw new HttpException(
          'Token is Invalid',
          HttpStatus.BAD_REQUEST,
        );
      }
      return true
    } catch (error) {
      throw new HttpException(
        'Token is Invalid',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async checkUserStatus(user: any): Promise<any> {
    try {
      let modelName: any = {};
      if (user?.role === 'employer') {
        modelName = this.connection.db.collection('employees');
      } else if (user?.role === 'admin') {
        modelName = this.connection.db.collection('admins');
      }
      else {
        throw new NotFoundException(`Model ${user?.role} not found`);
      }
      const userDate = await modelName.findOne({
        _id: new ObjectId(user?.sub),
        ...(user?.role === 'admin' && { is_active: 'active' } )
      });
      if (!userDate) {
        throw new HttpException('User is Unautherized', HttpStatus.UNAUTHORIZED);
      }
      return userDate
    } catch (error) {
      throw new HttpException(
        error.message || 'User is Unautherized',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateUser(profile: any, access_token, provider): Promise<any> {

    const employeeCollection = this.connection.db.collection('employees');

    const existingUser = await employeeCollection.findOne({ email: profile.email });
    if (existingUser) {
      if (existingUser.status !== 'active') {
        return null
      }
      await employeeCollection.updateOne(
        { email: profile.email },
        { $set: { access_token: access_token, updatedAt: new Date(), provider: provider } }
      );

      const updatedUser = await employeeCollection.findOne({ email: profile.email });
      return updatedUser;
    
    }
   

    const newUser = {
      email: profile.email,
      first_name: profile.firstName,
      last_name: profile.lastName,
      access_token: access_token,
      status: 'active',
      provider: provider,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await employeeCollection.insertOne(newUser);

    const createdUser = await employeeCollection.findOne({ _id: new Types.ObjectId(result.insertedId) });

    return createdUser
  }

}
