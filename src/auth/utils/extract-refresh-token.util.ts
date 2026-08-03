import {type Request } from "express";
import { ExtractJwt } from "passport-jwt";

export const extractRefreshToken = (req:Request):string | null=>{
    return req.cookies?.refresh_token
    || ExtractJwt.fromAuthHeaderAsBearerToken()(req)
    || req.body?.refreshToken
    || null
}