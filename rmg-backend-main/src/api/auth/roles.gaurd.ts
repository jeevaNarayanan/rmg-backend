import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

const isMatchRole = (allowedRoles: string[] = [], userRole: string = ''): boolean  => {
  return allowedRoles.includes(userRole);
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const response = context.switchToHttp().getResponse();
    const  user = response?.locals?.user;
    const allowedRoles: string[] = this.reflector.get<string[]>('roles', context.getHandler());

    //checking for role matching
    if(isMatchRole(allowedRoles,user?.role)){
      return true
    }


    //checking for public route
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if(isPublic) return true;
    
    return false;
  }
}
