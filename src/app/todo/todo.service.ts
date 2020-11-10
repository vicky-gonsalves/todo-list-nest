import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TodoCreateDTO,
  TodoReadDTO,
  TodoSO,
  TodoUpdateDTO,
} from './dto/todo.dto';
import { TodoEntity } from '../../model/todo.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly todoRepo: Repository<TodoEntity>,
  ) {
  }

  private responseObject = (todo: TodoEntity): TodoSO => {
    return todo;
  };

  public async getAll(
    todoDTO: TodoReadDTO,
    options: IPaginationOptions,
  ): Promise<Pagination<TodoSO>> {
    const queryBuilder = this.todoRepo.createQueryBuilder('t');
    if (todoDTO.hasOwnProperty('q')) {
      const q = todoDTO.q.toLowerCase();
      queryBuilder.where(
        'LOWER(t.title) LIKE :title OR LOWER(t.description) LIKE :description',
        {
          title: `%${q}%`,
          description: `%${q}%`,
        },
      );
    }
    if (todoDTO.hasOwnProperty('done')) {
      queryBuilder.where(`t.done = :val`, { val: todoDTO.done });
    }
    if (todoDTO.hasOwnProperty('priority')) {
      queryBuilder.where(`t.priority = :val`, { val: todoDTO.priority });
    }
    if (
      todoDTO.hasOwnProperty('sort') &&
      todoDTO.hasOwnProperty('order') &&
      ['title', 'due', 'done', 'priority'].indexOf(todoDTO.sort) > -1
    ) {
      queryBuilder.orderBy(`t.${todoDTO.sort}`, todoDTO.order);
    } else {
      queryBuilder.orderBy('t.createdAt', 'DESC');
    }
    return paginate<TodoSO>(queryBuilder, options);
  }

  public async get(id: string): Promise<TodoSO> {
    const todo = await this.todoRepo.findOne({ id });
    if (!todo) {
      throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    } else {
      return this.responseObject(todo);
    }
  }

  public async create(todoDTO: TodoCreateDTO): Promise<TodoSO> {
    const newTodo = this.todoRepo.create(todoDTO);
    await this.todoRepo.save(newTodo);
    return this.responseObject(newTodo);
  }

  public async update(id: string, todoDTO: TodoUpdateDTO): Promise<TodoSO> {
    const todo = await this.todoRepo.findOne({ id });
    if (!todo) {
      throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    } else {
      await this.todoRepo.update({ id }, todoDTO);
      const updatedTodo = await this.todoRepo.findOne({ id });
      return this.responseObject(updatedTodo);
    }
  }

  public async delete(id: string) {
    const todo = await this.todoRepo.findOne({ id });
    if (!todo) {
      throw new HttpException('Todo not found', HttpStatus.NOT_FOUND);
    } else {
      await this.todoRepo.delete({ id });
      return { deleted: true };
    }
  }
}
