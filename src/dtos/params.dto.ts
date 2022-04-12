import { IsNumberString, IsString, Length } from 'class-validator';

export class UsernamePathParams {
  @IsString()
  @Length(3, 35)
  public username: string;
}

export class ProjectPathParams extends UsernamePathParams {
  @Length(3, 100)
  @IsString()
  public projectname: string;
}

export class JobNumberPathParams extends ProjectPathParams {
  @IsNumberString()
  public jobnumber: number;
}

export class JobSubmissionPathParams extends JobNumberPathParams {
  @IsNumberString()
  public submissionnumber: number;
}

export class IdPathParams {
  @IsString()
  public id: string;
}

export class PuidPathParams {
  @IsString()
  public puid: string;
}
