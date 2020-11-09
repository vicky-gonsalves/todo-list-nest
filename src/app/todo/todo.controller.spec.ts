import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import * as faker from 'faker';
import { v4 } from 'uuid';
import {
  TodoFixture,
  TodoFixtureInterface,
} from '../../../test/fixtures/todo.fixture';
import { TodoEntity } from '../../model/todo.entity';
import { TodoCreateDTO, TodoReadDTO } from './dto/todo.dto';
import { TodoController } from './todo.controller';
import { TodoModule } from './todo.module';
import { TodoService } from './todo.service';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;
  let module: TestingModule = null;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TodoModule,
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([TodoEntity]),
      ],
      controllers: [TodoController],
      providers: [TodoService],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('successful=>getAll', () => {
    it('should return list of todos', async () => {
      const expectedResult = [new TodoEntity()];
      const query = plainToClass(TodoReadDTO, {});
      service.getAll = jest.fn().mockResolvedValue(expectedResult);
      expect(await controller.getAll(query)).toBe(expectedResult);
    });

    it('should return list of todos with page and limit', async () => {
      const expectedResult = [new TodoEntity()];
      const query = plainToClass(TodoReadDTO, { page: 1, limit: 10 });
      service.getAll = jest.fn().mockResolvedValue(expectedResult);
      expect(await controller.getAll(query)).toBe(expectedResult);
    });
  });

  describe('successful=>get', () => {
    it('should return a todo', async () => {
      const seed = v4();
      const fixture: TodoFixtureInterface = await TodoFixture(module, { seed });
      service.get = jest.fn().mockResolvedValue(fixture.todoOne);
      expect(await controller.get(seed)).toBe(fixture.todoOne);
    });
  });

  describe('successful=>create', () => {
    it('should create a todo', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
      });
      service.create = jest.fn().mockResolvedValue(data);
      expect(await controller.create(data)).toBe(data);
    });
  });

  describe('successful=>update', () => {
    it('should update a todo', async () => {
      const seed = v4();
      await TodoFixture(module, { seed });
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
      });
      service.update = jest.fn().mockResolvedValue(data);
      expect(await controller.update(seed, data)).toBe(data);
    });
  });

  describe('successful=>destroy', () => {
    it('should delete a todo', async () => {
      const seed = v4();
      await TodoFixture(module, { seed });
      const expected = { deleted: true };
      service.delete = jest.fn().mockResolvedValue(expected);
      expect(await controller.destroy(seed)).toBe(expected);
    });
  });
});
