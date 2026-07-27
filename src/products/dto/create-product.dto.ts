import { IsNotEmpty, IsInt, IsString } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    title!:string

    @IsNotEmpty()
    @IsString()
    description!:string
}
