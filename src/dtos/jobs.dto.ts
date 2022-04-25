import { SubmissionStatusEnum } from '@/interfaces/job.interface';
import { IsBoolean, IsEnum, IsOptional, IsString, Length, ValidateIf } from 'class-validator';

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

export class PatchJobDto {
  @IsString()
  @IsOptional()
  public title: string;

  @ValidateIf((obj, val) => val != null && val != '')
  @Length(1, 1000)
  @IsString()
  @IsOptional()
  public body: string;

  @IsString()
  @IsOptional()
  public imageUrl: string;

  @IsString()
  @IsOptional()
  public closed: boolean;
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

export class UpdateJobSubscriptionDto {
  @IsBoolean()
  public accepted: boolean;

  @IsBoolean()
  public notified: boolean;
}

export class UpdateJobSubmissionStatusDto {
  @IsEnum(SubmissionStatusEnum)
  public status: SubmissionStatusEnum;
}
