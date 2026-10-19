import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({ require_protocol: true }, { message: 'Must be a valid URL with http:// or https://' })
  @IsNotEmpty()
  originalUrl: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  customCode?: string; // Optional custom slug
}
