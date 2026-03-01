import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;

  @IsOptional()
  @IsString()
  employeeId?: string;
}
