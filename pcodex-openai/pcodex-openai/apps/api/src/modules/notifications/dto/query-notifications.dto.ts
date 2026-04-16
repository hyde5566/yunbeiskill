import { IsBooleanString, IsOptional } from "class-validator";

export class QueryNotificationsDto {
  @IsOptional()
  @IsBooleanString()
  isRead?: string;
}
