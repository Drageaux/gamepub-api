import { IsArray, IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateAssetDto {
  @Length(3, 100)
  @IsString()
  @IsOptional()
  public displayName: string;

  @IsString()
  public githubRepo: string;

  @IsArray()
  @IsOptional()
  public tags: string[];

  @IsString()
  @IsOptional()
  public description: string;

  @IsBoolean()
  @IsOptional()
  public private: boolean;
}
