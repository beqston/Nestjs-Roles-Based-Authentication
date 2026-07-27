import { IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty()
    @IsString()
    email!:string
    @IsNotEmpty()
    @IsString()
    password!:string
}
