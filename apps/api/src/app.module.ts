import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // .env лежит в корне монорепо, поэтому поднимаемся на два уровня выше
      envFilePath: ['../../.env', '.env'],
      cache: true,
    }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    HealthModule,
  ],
})
export class AppModule {}
