import { INestApplication } from '@nestjs/common';
import { NestApplicationContext } from '@nestjs/core';
import { plainToClass } from 'class-transformer';
import * as faker from 'faker';
import { TodoCreateDTO } from '../../src/app/todo/dto/todo.dto';
import { TodoService } from '../../src/app/todo/todo.service';
import { TodoEntity } from '../../src/model/todo.entity';

export interface TodoFixtureInterface {
  todoOne: TodoEntity;
}

export async function TodoFixture(
  module: NestApplicationContext | INestApplication,
  dedupe: any | TodoFixtureInterface = {},
): Promise<TodoFixtureInterface> {
  if (dedupe.todoOne) return dedupe;
  const todoService = await module.get<TodoService>(TodoService);
  const title = `This is a Todo - ${faker.random.alpha(33)}`;
  const description = faker.random.alpha(500);

  const todoOne = await todoService.create(
    plainToClass(TodoCreateDTO, {
      title,
      description,
    }),
  );
  return { todoOne };
}
