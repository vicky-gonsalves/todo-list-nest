import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import * as faker from 'faker';
import { IPaginationOptions } from 'nestjs-typeorm-paginate/index';
import { getConnection, Repository } from 'typeorm/index';
import { v4 } from 'uuid';
import {
  TodoFixture,
  TodoFixtureInterface,
} from '../../../test/fixtures/todo.fixture';
import { TodoEntity } from '../../model/todo.entity';
import { TodoCreateDTO, TodoReadDTO, TodoUpdateDTO } from './dto/todo.dto';
import { TodoModule } from './todo.module';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let module: TestingModule = null;
  let todoRepository: Repository<TodoEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [TodoService],
      imports: [
        TodoModule,
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([TodoEntity]),
      ],
    }).compile();
    service = module.get<TodoService>(TodoService);
    todoRepository = module.get(getRepositoryToken(TodoEntity));
  }, 20000);

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    const entities = getConnection().entityMetadatas;

    for (const entity of entities) {
      const repository = await getConnection().getRepository(entity.name);
      await repository.clear();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Successful => GetAll', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) {
        const seed = v4();
        await TodoFixture(module, { seed });
      }
    });

    it('should get all todo list with limit', async () => {
      const options: IPaginationOptions = {
        limit: 10,
        page: 1,
      };
      const query = plainToClass(TodoReadDTO, {});
      await validateOrReject(query);
      const todo = await service.getAll(query, options);
      expect(todo.items).toBeDefined();
      expect(todo.items).toBeInstanceOf(Array);
      expect(todo.items).toHaveLength(options.limit);
      expect(todo.meta).toBeDefined();
    });

    it('should get all todo list with fuzzy search', async () => {
      const options: IPaginationOptions = {
        limit: 10,
        page: 1,
      };
      const query = plainToClass(TodoReadDTO, {
        q: 'a',
      });
      await validateOrReject(query);
      const todo = await service.getAll(query, options);
      expect(todo.items).toBeDefined();
      expect(todo.items).toBeInstanceOf(Array);
      expect(todo.items).toHaveLength(options.limit);
      expect(todo.meta).toBeDefined();
    });

    it('should get all todo list with filter:done', async () => {
      const options: IPaginationOptions = {
        limit: 10,
        page: 1,
      };
      const query = plainToClass(TodoReadDTO, {
        done: false,
      });
      await validateOrReject(query);
      const todo = await service.getAll(query, options);
      expect(todo.items).toBeDefined();
      expect(todo.items).toBeInstanceOf(Array);
      expect(todo.items).toHaveLength(options.limit);
      expect(todo.meta).toBeDefined();
    });

    it('should get all todo list with filter:priority', async () => {
      const options: IPaginationOptions = {
        limit: 10,
        page: 1,
      };
      const query = plainToClass(TodoReadDTO, {
        priority: 2,
      });
      await validateOrReject(query);
      const todo = await service.getAll(query, options);
      expect(todo.items).toBeDefined();
      expect(todo.items).toBeInstanceOf(Array);
      expect(todo.items).toHaveLength(options.limit);
      expect(todo.meta).toBeDefined();
    });

    it('should get all todo list with sort', async () => {
      const options: IPaginationOptions = {
        limit: 10,
        page: 1,
      };
      const query = plainToClass(TodoReadDTO, {
        sort: 'priority',
        order: 'DESC',
      });
      await validateOrReject(query);
      const todo = await service.getAll(query, options);
      expect(todo.items).toBeDefined();
      expect(todo.items).toBeInstanceOf(Array);
      expect(todo.items).toHaveLength(options.limit);
      expect(todo.meta).toBeDefined();
    });

    it('should ignore sort param and sort by default order', async () => {
      const options: IPaginationOptions = {
        limit: 10,
        page: 1,
      };
      const query = plainToClass(TodoReadDTO, {
        sort: 'description',
        order: 'DESC',
      });
      await validateOrReject(query);
      const todo = await service.getAll(query, options);
      expect(todo.items).toBeDefined();
      expect(todo.items).toBeInstanceOf(Array);
      expect(todo.items).toHaveLength(options.limit);
      expect(todo.meta).toBeDefined();
    });
  });

  describe('Successful => Get', () => {
    const seed = v4();
    let fixture: TodoFixtureInterface;
    let spy: any;

    beforeEach(async () => {
      spy = jest.spyOn(todoRepository, 'findOne');
      fixture = await TodoFixture(module, { seed });
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should get a todo item', async () => {
      const todo = await service.get(fixture.todoOne.id);
      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(fixture.todoOne.title);
      expect(todo.description).toBe(fixture.todoOne.description);
      expect(todo.done).toBe(fixture.todoOne.done);
      expect(todo.due).toEqual(fixture.todoOne.due);
      expect(todo.priority).toBe(fixture.todoOne.priority);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Failing => Get', () => {
    let spy: any;

    beforeEach(async () => {
      spy = jest.spyOn(todoRepository, 'findOne');
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should throw HttpException with 404 if todo does not exists', async () => {
      const id = v4();
      try {
        await service.get(id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toEqual('Todo not found');
        expect(e.status).toEqual(HttpStatus.NOT_FOUND);
        expect(spy).toHaveBeenCalled();
      }
    });
  });

  describe('Successful => Create', () => {
    let spy: any;
    beforeEach(() => {
      spy = jest.spyOn(todoRepository, 'create');
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should create a todo item with default values', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
      });
      await validateOrReject(data);
      const todo = await service.create(data);
      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(data.title);
      expect(todo.description).toBe(data.description);
      expect(todo.done).toBeFalsy();
      expect(todo.due).toBeNull();
      expect(todo.priority).toBe(2);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
      expect(spy).toHaveBeenCalled();
    });

    it('should create a todo item with defined values', async () => {
      const date = new Date().getTime() + 3600;
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
        due: new Date(date),
        done: false,
        priority: 3,
      });
      await validateOrReject(data);
      const todo = await service.create(data);
      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(data.title);
      expect(todo.description).toBe(data.description);
      expect(todo.done).toBe(data.done);
      expect(todo.due).toBe(data.due);
      expect(todo.priority).toBe(data.priority);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Validation => Create', () => {
    let spy: any;
    beforeEach(() => {
      spy = jest.spyOn(todoRepository, 'create');
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should not create a todo item if no title and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        description: faker.random.alpha(500),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isNotEmpty).toBe('title should not be empty');
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not create a todo item if no description and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(99),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isNotEmpty).toBe(
          'description should not be empty',
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not create a todo item if title is longer than 100 characters and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(101),
        description: faker.random.alpha(500),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.maxLength).toEqual(
          `title must be shorter than or equal to 100 characters`,
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not create a todo item if title is not a string and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.number(),
        description: faker.random.alpha(500),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isString).toBe('title must be a string');
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not create a todo item if description is longer than 500 characters and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.alpha(501),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.maxLength).toBe(
          `description must be shorter than or equal to 500 characters`,
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not create a todo item if description is not string and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.number(),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isString).toBe('description must be a string');
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not create a todo item if due date is past date and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: new Date('2020-11-07T08:07:26.015Z'),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.minDate).toEqual(
          'Due date must be future date',
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not create a todo item if due date is not a date instance and throw ValidationError', async () => {
      const data = plainToClass(TodoCreateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: new Date('NOT A DATE'),
      });
      try {
        await validateOrReject(data);
        await service.create(data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isDate).toEqual(
          'Due date must be a Date instance',
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });
  });

  describe('Successful => Update', () => {
    const seed = v4();
    let fixture: TodoFixtureInterface;
    let spy: any;

    beforeEach(async () => {
      spy = jest.spyOn(todoRepository, 'update');
      fixture = await TodoFixture(module, { seed });
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should update a todo item', async () => {
      const data = plainToClass(TodoUpdateDTO, {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
        priority: 1,
        due: new Date(new Date().getTime() + 3600),
        done: true,
      });
      await validateOrReject(data);
      const todo = await service.update(fixture.todoOne.id, data);
      expect(todo).toBeDefined();
      expect(todo.id).toBeDefined();
      expect(todo.title).toBe(data.title);
      expect(todo.description).toBe(data.description);
      expect(todo.done).toBe(data.done);
      expect(todo.due).toBeInstanceOf(Date);
      expect(todo.due).toEqual(data.due);
      expect(todo.priority).toBe(data.priority);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Validation => Update', () => {
    let spy: any;
    beforeEach(() => {
      spy = jest.spyOn(todoRepository, 'update');
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should not update a todo item if todo doesnt exists and throw 404 HttpException', async () => {
      const id = v4();
      const data = plainToClass(TodoUpdateDTO, {
        description: faker.random.alpha(500),
      });
      try {
        await validateOrReject(data);
        await service.update(id, data);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toEqual('Todo not found');
        expect(e.status).toEqual(HttpStatus.NOT_FOUND);
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not update a todo item if title is longer than 100 characters and throw ValidationError', async () => {
      const id = v4();
      const data = plainToClass(TodoUpdateDTO, {
        title: faker.random.alpha(101),
        description: faker.random.alpha(500),
      });
      try {
        await validateOrReject(data);
        await service.update(id, data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.maxLength).toEqual(
          `title must be shorter than or equal to 100 characters`,
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not update a todo item if title is not a string and throw ValidationError', async () => {
      const id = v4();
      const data = plainToClass(TodoUpdateDTO, {
        title: faker.random.number(),
        description: faker.random.alpha(500),
      });
      try {
        await validateOrReject(data);
        await service.update(id, data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isString).toBe('title must be a string');
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not update a todo item if description is longer than 500 characters and throw ValidationError', async () => {
      const id = v4();
      const data = plainToClass(TodoUpdateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.alpha(501),
      });
      try {
        await validateOrReject(data);
        await service.update(id, data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.maxLength).toBe(
          `description must be shorter than or equal to 500 characters`,
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not update a todo item if description is not string and throw ValidationError', async () => {
      const id = v4();
      const data = plainToClass(TodoUpdateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.number(),
      });
      try {
        await validateOrReject(data);
        await service.update(id, data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isString).toBe('description must be a string');
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not update a todo item if due date is past date and throw ValidationError', async () => {
      const id = v4();
      const data = plainToClass(TodoUpdateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: new Date('2020-11-07T08:07:26.015Z'),
      });
      try {
        await validateOrReject(data);
        await service.update(id, data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.minDate).toEqual(
          'Due date must be future date',
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });

    it('should not update a todo item if due date is not a date instance and throw ValidationError', async () => {
      const id = v4();
      const data = plainToClass(TodoUpdateDTO, {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: new Date('NOT A DATE'),
      });
      try {
        await validateOrReject(data);
        await service.update(id, data);
      } catch (e) {
        expect(e).toBeInstanceOf(Array);
        expect(e[0].constraints.isDate).toEqual(
          'Due date must be a Date instance',
        );
        expect(spy).not.toHaveBeenCalled();
      }
    });
  });

  describe('Successful => Delete', () => {
    const seed = v4();
    let fixture: TodoFixtureInterface;
    let spy: any;

    beforeEach(async () => {
      spy = jest.spyOn(todoRepository, 'delete');
      fixture = await TodoFixture(module, { seed });
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should delete a todo item', async () => {
      const todo = await service.delete(fixture.todoOne.id);
      expect(todo).toBeDefined();
      expect(todo.deleted).toBeTruthy();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Failing => Delete', () => {
    let spy: any;

    beforeEach(async () => {
      spy = jest.spyOn(todoRepository, 'delete');
    });

    afterEach(() => {
      spy.mockClear();
    });

    it('should throw HttpException with 404 if todo does not exists', async () => {
      const id = v4();
      try {
        await service.delete(id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.response).toEqual('Todo not found');
        expect(e.status).toEqual(HttpStatus.NOT_FOUND);
        expect(spy).not.toHaveBeenCalled();
      }
    });
  });
});
