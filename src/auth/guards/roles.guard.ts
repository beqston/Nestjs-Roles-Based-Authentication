import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  
  constructor(private reflector:Reflector){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const requredRoles = this.reflector.getAllAndOverride<Role[]>(process.env.ROLES_KEY , [
      context.getHandler(),
      context.getClass()
    ])

    if(!requredRoles) return true
    const {user} = context.switchToHttp().getRequest()
    return requredRoles.some(role=>user.role == role);
  }
}
