import { IsEmail, IsNumber, IsString, Length } from 'class-validator';

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
  // TODO: test if raw string in param can be number type
  @IsNumber()
  public jobnumber: number;
}

export class IdPathParams {
  @IsString()
  public id: string;
}
