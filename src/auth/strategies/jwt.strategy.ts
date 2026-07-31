import { Injectable } from "@nestjs/common";
import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
   constructor(){
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([
            (req:Request)=> req.cookies?.access_token || null,
            ExtractJwt.fromAuthHeaderAsBearerToken()
        ]),
        ignoreExpiration:false,
        secretOrKey:'nest'
    })
   }

   async validate(payload:JwtPayload){
    return{
        id:payload.sub,
        email:payload.email,
        role:payload.role
    }
   }
}