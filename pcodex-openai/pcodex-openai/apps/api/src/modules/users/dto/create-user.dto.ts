import { ArrayNotEmpty, IsArray, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsString()
  account!: string;

  @IsString()
  name!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  departmentId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roleIds!: string[];
}
