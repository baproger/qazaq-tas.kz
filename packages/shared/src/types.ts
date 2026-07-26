/** Общие типы, используемые и в API, и в интерфейсе. */

/** Ответ API с постраничным выводом */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Параметры запроса списка */
export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Пользователь в токене авторизации */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

/** Стандартный ответ об ошибке API */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
