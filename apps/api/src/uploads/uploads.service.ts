import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/** Готовые размеры под разные места на сайте. */
export type ImagePurpose = 'banner' | 'product' | 'category';

interface Preset {
  /** Максимальная ширина после сжатия */
  width: number;
  /** Пропорция обрезки; null — сохранить исходную */
  ratio: number | null;
  quality: number;
}

const PRESETS: Record<ImagePurpose, Preset> = {
  // Широкая полоса под лентой акций
  banner: { width: 2000, ratio: 21 / 9, quality: 82 },
  // Карточка товара — привычная пропорция каталога
  product: { width: 1400, ratio: 4 / 3, quality: 84 },
  category: { width: 800, ratio: 1, quality: 84 },
};

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 15 * 1024 * 1024;

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  /**
   * Папка хранения — в корне проекта, вне apps/web.
   * Файлы раздаёт само API по адресу /uploads/..., а Next проксирует к нему,
   * поэтому загруженное фото доступно сразу, без перезапуска сервера.
   */
  private readonly directory = process.env.UPLOAD_DIR ?? join(process.cwd(), '../../uploads');

  /**
   * Приводит загруженное изображение к нужному виду:
   * обрезает по пропорции, ужимает по ширине и переводит в WebP.
   * Благодаря этому в ленту можно загрузить снимок с телефона на 8 МБ,
   * а на сайт уйдёт файл в десятки раз легче и правильной формы.
   */
  async saveImage(
    buffer: Buffer,
    mimetype: string,
    purpose: ImagePurpose,
  ): Promise<{ url: string; width: number; height: number; bytes: number }> {
    if (!ALLOWED.includes(mimetype)) {
      throw new BadRequestException('Поддерживаются JPEG, PNG, WebP и AVIF');
    }
    if (buffer.byteLength > MAX_BYTES) {
      throw new BadRequestException('Файл больше 15 МБ');
    }

    const preset = PRESETS[purpose];

    let pipeline = sharp(buffer, { failOn: 'error' }).rotate(); // rotate() учитывает поворот из EXIF

    const meta = await pipeline.metadata();
    if (!meta.width || !meta.height) {
      throw new BadRequestException('Не удалось прочитать изображение');
    }

    if (preset.ratio) {
      const targetHeight = Math.round(preset.width / preset.ratio);
      pipeline = pipeline.resize(preset.width, targetHeight, {
        fit: 'cover',
        position: 'attention', // обрезаем так, чтобы сохранить самую заметную часть кадра
        withoutEnlargement: false,
      });
    } else {
      pipeline = pipeline.resize({ width: preset.width, withoutEnlargement: true });
    }

    const output = await pipeline.webp({ quality: preset.quality }).toBuffer({
      resolveWithObject: true,
    });

    const name = `${purpose}-${randomUUID()}.webp`;
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, name), output.data);

    this.logger.log(
      `Загружено ${name}: ${meta.width}x${meta.height} → ${output.info.width}x${output.info.height}, ` +
        `${Math.round(buffer.byteLength / 1024)} КБ → ${Math.round(output.data.byteLength / 1024)} КБ`,
    );

    return {
      url: `/uploads/${name}`,
      width: output.info.width,
      height: output.info.height,
      bytes: output.data.byteLength,
    };
  }
}
