import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';


const env = process.env.NODE_ENV || 'development';
config({ path: `.env.${env}` });
if (env === 'development') {
  console.log(`App running in ${env} mode`);
}

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {
  }

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.getValue(k, true));
    return this;
  }

  public isProduction() {
    const env = this.getValue('NODE_ENV', false);
    return env === 'production';
  }

  public isDevelopment() {
    const env = this.getValue('NODE_ENV', false);
    return env === 'development';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),

      entities: ['**/*.entity.ts'],

      migrationsTableName: 'migration',

      migrations: ['src/migration/*.ts'],

      cli: {
        migrationsDir: 'src/migration',
      },

      logging: this.isDevelopment(),
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
]);

export { configService };
