import { IsOptional, IsString, Length, ValidateIf } from 'class-validator';

export class CreateJobDto {
  @IsString()
  public title: string;

  @ValidateIf((obj, val) => val != null && val != '')
  @Length(1, 1000)
  @IsString()
  @IsOptional()
  public body: string;

  @IsString()
  @IsOptional()
  public imageUrl: string;
}

export class CreateJobCommentDto {
  @Length(1, 400)
  @IsString()
  public body: string;
}

export class CreateJobSubmissionDto {
  @IsString()
  public githubRepo: string;

  @ValidateIf((obj, val) => val != null && val != '')
  @Length(1, 400)
  @IsString()
  @IsOptional()
  public body: string;
}
