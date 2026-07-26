import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@qazaq-tas/database';

/**
 * Единая точка доступа к базе данных.
 * Все модули системы (CRM, производство, склад, финансы) работают через неё.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Подключение к базе данных установлено');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
