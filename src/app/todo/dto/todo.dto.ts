import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinDate,
  MinLength,
} from 'class-validator';

export class TodoReadDTO {
  @ApiPropertyOptional({
    description: 'Page Number',
    type: Number,
    default: 1,
  })
  // @Type(() => Number)
  @IsOptional()
  page: number;

  @ApiPropertyOptional({
    description: 'Items per page limit',
    type: Number,
    default: 10,
  })
  // @Type(() => Number)
  @IsOptional()
  limit: number;

  @ApiPropertyOptional({
    description: 'Query for fuzzy search',
    type: String,
  })
  @IsString()
  @IsOptional()
  q: string;

  @ApiPropertyOptional({
    description: 'Sort column name [Allowed values: title|due|done|priority]',
    type: String,
  })
  @IsString()
  @IsOptional()
  sort: string;

  @ApiPropertyOptional({
    description: 'Sort order [Allowed values: ASC|DESC]',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  order: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'filter by done',
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  done: boolean;

  @ApiPropertyOptional({
    description: 'filter by priority',
    type: Number,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  priority: number;
}

export class TodoCreateDTO {
  @ApiProperty({
    type: String,
    maxLength: 100,
    description: 'Title of the Todo',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @MinLength(1)
  title: string;

  @ApiProperty({
    type: String,
    maxLength: 500,
    description: 'Description of the Todo',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @MinLength(1)
  description: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'Due Date of the Todo',
  })
  @MinDate(new Date(), {
    message: 'Due date must be future date',
  })
  @IsDate({
    message: 'Due date must be a Date instance',
  })
  @Type(() => Date)
  @IsOptional()
  due: Date;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Status of the Todo',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  done: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Priority of the Todo',
    minimum: 1,
    maximum: 3,
    default: 2,
  })
  @Min(1)
  @Max(3)
  @IsOptional()
  priority: number;
}

export class TodoUpdateDTO {
  @ApiPropertyOptional({
    type: String,
    maxLength: 100,
    description: 'Title of the Todo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  title: string;

  @ApiPropertyOptional({
    type: String,
    maxLength: 500,
    description: 'Description of the Todo',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @IsOptional()
  description: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'Due Date of the Todo',
  })
  @MinDate(new Date(), {
    message: 'Due date must be future date',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({
    message: 'Due date must be a Date instance',
  })
  due: Date;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Status of the Todo',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  done: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Priority of the Todo',
    minimum: 1,
    maximum: 3,
    default: 2,
  })
  @Min(1)
  @Max(3)
  @IsOptional()
  priority: number;
}

export type TodoSO = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly due: Date;
  readonly done: boolean;
  readonly priority: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
