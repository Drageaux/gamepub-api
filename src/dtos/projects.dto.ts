import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateProjectDto {
  @Length(2, 30)
  @IsString()
  public name: string;

  @IsString()
  public creatorId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public ghOwner: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  public ghRepo: string;
}
