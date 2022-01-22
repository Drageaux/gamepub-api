import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateProjectDto {
  @Length(3, 30)
  @IsString()
  public name: string;

  @IsString()
  public creator: string;

  @IsString()
  @IsOptional()
  public githubRepo: string;
}
