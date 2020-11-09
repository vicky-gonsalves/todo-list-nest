import { HttpStatus, INestApplication } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as faker from 'faker';
import * as request from 'supertest';
import { getConnection } from 'typeorm/index';
import { v4 } from 'uuid';
import { TodoModule } from '../src/app/todo/todo.module';
import { TodoEntity } from '../src/model/todo.entity';
import { ValidationPipe } from '../src/shared/pipe/validation.pipe';
import { TodoFixture, TodoFixtureInterface } from './fixtures/todo.fixture';

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule = null;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        TodoModule,
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([TodoEntity]),
      ],
      providers: [
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }, 20000);

  afterAll(async () => {
    await moduleFixture.close();
  });

  afterEach(async () => {
    const entities = getConnection().entityMetadatas;

    for (const entity of entities) {
      const repository = await getConnection().getRepository(entity.name);
      await repository.clear();
    }
  });

  describe('GET /todo', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) {
        const seed = v4();
        await TodoFixture(moduleFixture, { seed });
      }
    });

    it('should get todo list todo items', async () => {
      const res = await request(app.getHttpServer())
        .get('/todo')
        .send()
        .expect(HttpStatus.OK);

      expect(res.body).toBeDefined();
      expect(res.body.items).toBeDefined();
      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.items).toHaveLength(10);
      expect(res.body.meta).toBeDefined();
      expect(res.body.links).toBeDefined();
    });

    it('should get todo list todo items if limit and page is provided', async () => {
      const res = await request(app.getHttpServer())
        .get('/todo')
        .query({ page: 1, limit: 5 })
        .send()
        .expect(HttpStatus.OK);

      expect(res.body).toBeDefined();
      expect(res.body.items).toBeDefined();
      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.items).toHaveLength(5);
      expect(res.body.meta).toBeDefined();
      expect(res.body.links).toBeDefined();
    });

    it('should get todo list todo items with fuzzy search', async () => {
      const res = await request(app.getHttpServer())
        .get('/todo')
        .query({ q: 'This is a todo' })
        .send()
        .expect(HttpStatus.OK);

      expect(res.body).toBeDefined();
      expect(res.body.items).toBeDefined();
      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
      expect(res.body.links).toBeDefined();
    });

    it('should get todo list todo items with filter', async () => {
      const res = await request(app.getHttpServer())
        .get('/todo')
        .query({ priority: 2, done: false })
        .send()
        .expect(HttpStatus.OK);

      expect(res.body).toBeDefined();
      expect(res.body.items).toBeDefined();
      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
      expect(res.body.links).toBeDefined();
    });

    it('should get sorted todo list todo items', async () => {
      const res = await request(app.getHttpServer())
        .get('/todo')
        .query({ sort: 'priority', order: 'DESC' })
        .send()
        .expect(HttpStatus.OK);

      expect(res.body).toBeDefined();
      expect(res.body.items).toBeDefined();
      expect(res.body.items).toBeInstanceOf(Array);
      expect(res.body.meta).toBeDefined();
      expect(res.body.links).toBeDefined();
    });
  });

  describe('GET /todo/:id', () => {
    const seed = v4();
    let fixture: TodoFixtureInterface;
    beforeEach(async () => {
      fixture = await TodoFixture(moduleFixture, { seed });
    });

    it('should get todo item', async () => {
      const res = await request(app.getHttpServer())
        .get(`/todo/${fixture.todoOne.id}`)
        .send()
        .expect(HttpStatus.OK);
      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(fixture.todoOne.title);
      expect(res.body.description).toBe(fixture.todoOne.description);
      expect(res.body.done).toBe(fixture.todoOne.done);
      expect(res.body.due).toEqual(fixture.todoOne.due);
      expect(res.body.priority).toBe(fixture.todoOne.priority);
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should throw HttpException with 404 if todo does not exists', async () => {
      const id = v4();
      const res = await request(app.getHttpServer())
        .get(`/todo/${id}`)
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(res.body).toBeDefined();
      expect(res.body.message).toBe('Todo not found');
    });
  });

  describe('POST /todo', () => {

    it('should create a todo item with default values', async () => {
      const data = {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.CREATED);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(data.title);
      expect(res.body.description).toBe(data.description);
      expect(res.body.done).toBeFalsy();
      expect(res.body.due).toBeNull();
      expect(res.body.priority).toBe(2);
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should create a todo item with defined values', async () => {
      const date = new Date().getTime() + 3600;
      const data = {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
        due: new Date(date),
        done: false,
        priority: 3,
      };

      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.CREATED);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(data.title);
      expect(res.body.description).toBe(data.description);
      expect(res.body.done).toBe(data.done);
      expect(res.body.due).toBe(data.due.toISOString());
      expect(res.body.priority).toBe(data.priority);
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should not create a todo item if no title and throw Bad Request Error', async () => {
      const data = {
        description: faker.random.alpha(500),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it('should not create a todo item if no description and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(99),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it('should not create a todo item if title is longer than 100 characters and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(101),
        description: faker.random.alpha(500),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it('should not create a todo item if title is not a string and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.number(),
        description: faker.random.alpha(500),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it('should not create a todo item if description is longer than 500 characters and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.alpha(501),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it('should not create a todo item if description is not string and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.number(),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it('should not create a todo item if due date is past date and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: new Date('2020-11-07T08:07:26.015Z'),
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });

    it('should not create a todo item if due date is not a date instance and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: 'NOT A DATE',
      };
      const res = await request(app.getHttpServer())
        .post(`/todo`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('PUT /todo/:id', () => {
    const seed = v4();
    let fixture: TodoFixtureInterface;

    beforeEach(async () => {
      fixture = await TodoFixture(moduleFixture, { seed });
    });

    it('should update a todo item', async () => {
      const data = {
        title: faker.random.alpha(50),
        description: faker.random.alpha(500),
        priority: 1,
        due: new Date(new Date().getTime() + 3600),
        done: true,
      };
      const res = await request(app.getHttpServer())
        .put(`/todo/${fixture.todoOne.id}`)
        .send(data)
        .expect(HttpStatus.OK);

      expect(res.body).toBeDefined();
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(data.title);
      expect(res.body.description).toBe(data.description);
      expect(res.body.done).toBe(data.done);
      expect(res.body.due).toBe(data.due.toISOString());
      expect(res.body.priority).toBe(data.priority);
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.updatedAt).toBeDefined();
    });

    it('should not update a todo item if todo doesnt exists and throw 404 Not Found Error', async () => {
      const id = v4();
      const data = {
        description: faker.random.alpha(500),
      };

      await request(app.getHttpServer())
        .put(`/todo/${id}`)
        .send(data)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should not update a todo item if title is longer than 100 characters and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(101),
        description: faker.random.alpha(500),
      };
      await request(app.getHttpServer())
        .put(`/todo/${fixture.todoOne.id}`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update a todo item if title is not a string and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.number(),
        description: faker.random.alpha(500),
      };
      await request(app.getHttpServer())
        .put(`/todo/${fixture.todoOne.id}`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update a todo item if description is longer than 500 characters and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.alpha(501),
      };
      await request(app.getHttpServer())
        .put(`/todo/${fixture.todoOne.id}`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update a todo item if description is not string and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.number(),
      };
      await request(app.getHttpServer())
        .put(`/todo/${fixture.todoOne.id}`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update a todo item if due date is past date and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: new Date('2020-11-07T08:07:26.015Z'),
      };
      await request(app.getHttpServer())
        .put(`/todo/${fixture.todoOne.id}`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should not update a todo item if due date is not a date instance and throw Bad Request Error', async () => {
      const data = {
        title: faker.random.alpha(100),
        description: faker.random.alpha(500),
        due: 'NOT A DATE',
      };
      await request(app.getHttpServer())
        .put(`/todo/${fixture.todoOne.id}`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
    });

  });

  describe('DELETE /todo/:id', () => {
    const seed = v4();
    let fixture: TodoFixtureInterface;

    beforeEach(async () => {
      fixture = await TodoFixture(moduleFixture, { seed });
    });


    it('should delete a todo item', async () => {
      await request(app.getHttpServer())
        .delete(`/todo/${fixture.todoOne.id}`)
        .send()
        .expect(HttpStatus.OK);
    });

    it('should throw Not Found with 404 if todo does not exists', async () => {
      const id = v4();
      await request(app.getHttpServer())
        .delete(`/todo/${id}`)
        .send()
        .expect(HttpStatus.NOT_FOUND);
    });
  });


});
