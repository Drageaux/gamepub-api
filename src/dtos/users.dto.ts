import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  public username: string;

  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}
