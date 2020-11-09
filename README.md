## Simple TODO List server based on nest.js

## Installation

```bash
$ npm install
```

## Steps to environment setup
For demonstration purpose I have created 3 seperate `.env` files so that test and development environment will works seamlessly on same local machine.
This backend requires requires atleast 2 existing postgrsql databases to run development and tests.
Please specify database connections in `.env.development`, `.env.test` files. (Make sure to have seperate databases for different environments)

### ormconfig.json
`ormconfig.json` file is generated automatically with based on the npm tasks so no need to create it manually for this demo.

## Running Migration
You'll need to run the migration to setup initial tables:
```bash
$ npm run typeorm -- migration:run
```

## Running the app

```bash
# development
$ npm run start
```

## API Docs (Swagger UI)
Api Docs are Available at `/docs` route;

## Test
**Note**
Database migrations will run automatically with below commands (Only database should exists):

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License
  [MIT licensed](LICENSE).
