import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    try {
      request.user = {};
      //checking for public route
      const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
      const skipToken = this.reflector.get<boolean>('skipToken', context.getHandler());
      if (request.headers.authorization && !skipToken) {
        const key = request.headers.authorization.split(' ');
        const token = key[1];
        const decoded = await this.authService.verifyToken(token);

        if (!decoded) {
          return response.status(HttpStatus.UNAUTHORIZED).json({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'Invalid Token'
          });
        }
        context.switchToHttp().getResponse().locals.user = decoded;
        request.user = decoded;
        return true;
      } else if (isPublic) {
        return true;
      } else {
        response.status(HttpStatus.UNAUTHORIZED).json({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Token is required for authentication',
        });
        return false;
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Token is Invalid',
        error.statusCode || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

