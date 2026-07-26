import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { AuthUser } from '@qazaq-tas/shared';
import { compare, hash } from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Срок жизни refresh-токена, дней. */
const REFRESH_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string, meta: RequestMeta): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Одинаковое сообщение для неверной почты и неверного пароля:
    // иначе по ответу можно перебором узнать, какие адреса зарегистрированы.
    if (!user || !user.isActive || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Неверная почта или пароль');
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    return this.issueTokens(
      { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      meta,
    );
  }

  async refresh(refreshToken: string, meta: RequestMeta): Promise<AuthTokens> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date() || !stored.user.isActive) {
      throw new UnauthorizedException('Сессия истекла, войдите заново');
    }

    // Одноразовое использование: старый токен отзываем, выдаём новую пару.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const { user } = stored;
    return this.issueTokens(
      { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      meta,
    );
  }

  /** Выход: отзываем refresh-токен текущей сессии. */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Выход со всех устройств. */
  async logoutAll(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(userId: string, current: string, next: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!(await compare(current, user.passwordHash))) {
      throw new UnauthorizedException('Текущий пароль указан неверно');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hash(next, 12) },
    });

    // Смена пароля закрывает все другие сессии.
    await this.logoutAll(userId);
  }

  private async issueTokens(user: AuthUser, meta: RequestMeta): Promise<AuthTokens> {
    // Приведение типа: срок жизни задаётся строкой из .env ('15m', '1h'),
    // а типы jsonwebtoken ожидают шаблонный литерал, который из env не выводится.
    const signOptions = {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '15m',
    } as JwtSignOptions;

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      signOptions,
    );

    // Refresh-токен — случайная строка; в базе храним только её хеш,
    // чтобы утечка таблицы не позволяла войти в систему.
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    return { accessToken, refreshToken, user };
  }
}

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
