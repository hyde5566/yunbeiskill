import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export class ManageProjectMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds!: string[];
}
