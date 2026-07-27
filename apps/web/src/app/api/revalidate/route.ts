import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Сброс кеша сайта по сигналу от API.
 *
 * Без этого страницы обновлялись бы только по истечении срока кеша,
 * и администратор, опубликовав товар, не увидел бы его сразу.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET;

  // Сброс кеша доступен только API: иначе любой желающий мог бы
  // заставлять сайт перестраивать страницы и нагружать сервер.
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ message: 'Доступ запрещён' }, { status: 401 });
  }

  revalidateTag('site', 'max');
  return NextResponse.json({ revalidated: true });
}
