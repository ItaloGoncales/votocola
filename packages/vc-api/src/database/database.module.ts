import { Module, type DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './database.config.js';

@Module({})
export class DatabaseModule {
  static forRoot(env: NodeJS.ProcessEnv = process.env): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [TypeOrmModule.forRoot(buildDataSourceOptions(env))],
      exports: [TypeOrmModule],
    };
  }
}
