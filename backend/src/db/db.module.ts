import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import config from 'src/config';
import { MysqlCompatiblePool } from './mysql-compatible-pool';

@Global()
@Module({
  providers: [
    {
      provide: "MYSQL",
      useFactory: (configService: ConfigType<typeof config>) => {
        const { host, port, username, password, database } =
          configService.database;

        if (!database) {
          throw new Error('Database name is not defined in environment variables');
        }

        const pool = new MysqlCompatiblePool({
          host,
          user: username,
          password,
          database,
          port: port ? parseInt(port) : 5432,
          max: 10,
          idleTimeoutMillis: 300000,
          connectionTimeoutMillis: 60000,
          ssl: { rejectUnauthorized: false },
        });

        pool.on('connect', () => {
          console.log('Nueva conexión PostgreSQL establecida');
        });

        pool.on('error', (err) => {
          console.error('Error inesperado en el pool de PostgreSQL:', err);
        });

        return pool;
      },
      inject: [config.KEY],
    }
  ],
  exports: ["MYSQL"]
})
export class DbModule { }
