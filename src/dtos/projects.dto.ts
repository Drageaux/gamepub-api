import { IsArray, IsOptional, IsString, Length, ValidateIf } from 'class-validator';

export class CreateProjectDto {
  @Length(3, 100)
  @IsString()
  public name: string;

  @ValidateIf((obj, val) => val != null && val != '')
  @Length(3, 100)
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

export class AdminCreateProjectDto extends CreateProjectDto {
  @IsString()
  @IsOptional()
  creator: string;
}
