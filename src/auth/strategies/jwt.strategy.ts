import { Injectable } from "@nestjs/common";
import {PassportStrategy} from '@nestjs/passport'
import {ExtractJwt, Strategy} from 'passport-jwt'
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
   constructor(){
    const secret = process.env.JWT_SECRET_KEY 
    if(!secret) throw new Error('Please provide JWT_SECRET_KEY')
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([
            (req:Request)=> req.cookies?.access_token || null,
            ExtractJwt.fromAuthHeaderAsBearerToken()
        ]),
        ignoreExpiration:false,
        secretOrKey:secret
    })
   }

   async validate(payload:JwtPayload){
    return{
        id:payload.sub,
        email:payload.email,
        role:payload.role,
    }
   }
}