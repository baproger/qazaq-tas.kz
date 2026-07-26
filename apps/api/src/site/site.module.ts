import { Module } from '@nestjs/common';
import { SiteAdminController } from './site-admin.controller';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

@Module({
  controllers: [SiteController, SiteAdminController],
  providers: [SiteService],
})
export class SiteModule {}
