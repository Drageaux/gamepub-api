import { IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  public title: string;

  @IsString()
  @IsOptional()
  public body: string;

  @IsString()
  @IsOptional()
  public imageUrl: string;
}
