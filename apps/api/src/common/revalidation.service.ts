import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Сообщает сайту, что содержимое изменилось.
 *
 * Next кеширует страницы витрины, поэтому без такого сигнала опубликованный
 * товар появлялся бы на сайте с задержкой в несколько минут.
 */
@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Запрос отправляется без ожидания: сохранение товара не должно
   * ни тормозить, ни падать из-за недоступного сайта.
   */
  trigger(): void {
    const secret = this.config.get<string>('REVALIDATE_SECRET');
    const webUrl = this.config.get<string>('WEB_URL') ?? 'http://localhost:3000';

    if (!secret) {
      this.logger.warn('REVALIDATE_SECRET не задан — кеш сайта не будет сброшен');
      return;
    }

    void fetch(`${webUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
      .then((response) => {
        if (!response.ok) {
          this.logger.warn(`Сайт отклонил сброс кеша: ${response.status}`);
        }
      })
      .catch((error: unknown) => {
        this.logger.warn(`Не удалось сбросить кеш сайта: ${String(error)}`);
      });
  }
}
