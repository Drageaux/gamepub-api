import { IsString, Length } from 'class-validator';

export class CreateProjectDto {
  @Length(2, 30)
  @IsString()
  public name: string;

  @IsString()
  public creator: string;

  @IsString()
  public ghOwner: string;

  @IsString()
  public ghRepo: string;
}
