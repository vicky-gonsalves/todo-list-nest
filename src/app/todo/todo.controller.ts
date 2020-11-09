import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate/index';
import {
  TodoCreateDTO,
  TodoReadDTO,
  TodoSO,
  TodoUpdateDTO,
} from './dto/todo.dto';
import { TodoService } from './todo.service';

@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Get()
  public async getAll(
    @Query() todoDTO: TodoReadDTO,
  ): Promise<Pagination<TodoSO>> {
    const page = todoDTO.page ? todoDTO.page : 1;
    const limit = todoDTO.limit ? todoDTO.limit : 10;
    return this.todoService.getAll(todoDTO, { page, limit });
  }

  @Get(':id')
  public async get(@Param('id') id: string): Promise<TodoSO> {
    return await this.todoService.get(id);
  }

  @Post()
  public async create(@Body() todoDTO: TodoCreateDTO): Promise<TodoSO> {
    return this.todoService.create(todoDTO);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() todoDTO: TodoUpdateDTO,
  ): Promise<TodoSO> {
    return this.todoService.update(id, todoDTO);
  }

  @Delete(':id')
  public async destroy(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.todoService.delete(id);
  }
}
