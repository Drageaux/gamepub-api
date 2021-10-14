import { IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  public name: string;
}
