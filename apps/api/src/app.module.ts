import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { SiteModule } from './site/site.module';
import { UploadsModule } from './uploads/uploads.module';
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
    CommonModule,
    AuthModule,
    CatalogModule,
    SiteModule,
    UploadsModule,
    HealthModule,
  ],
})
export class AppModule {}
