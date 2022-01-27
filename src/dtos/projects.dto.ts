import { IsArray, IsOptional, IsString, Length, ValidateIf } from 'class-validator';

export class CreateProjectDto {
  @Length(3, 35)
  @IsString()
  public name: string;

  @IsString()
  public creator: string;

  @ValidateIf((obj, val) => val != null && val != '')
  @Length(3, 50)
  @IsString()
  @IsOptional()
  public displayName: string;

  @IsString()
  @IsOptional()
  public githubRepo: string;

  @IsArray()
  @IsOptional()
  public tags: string[];

  @IsString()
  @IsOptional()
  public description: string;

  @IsString()
  @IsOptional()
  public imageUrl: string;
}
