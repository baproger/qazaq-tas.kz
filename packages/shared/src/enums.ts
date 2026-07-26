/**
 * Перечисления системы QAZAQ TAS ERP.
 *
 * ВАЖНО: значения обязаны совпадать с enum в packages/database/prisma/schema.prisma.
 * Здесь они продублированы, чтобы фронтенд не тянул в браузер сгенерированный Prisma-клиент.
 */

/** Роли пользователей системы */
export const UserRole = {
  /** Директор — видит весь бизнес */
  DIRECTOR: 'DIRECTOR',
  /** Менеджер продаж — клиенты, лиды, сделки */
  SALES_MANAGER: 'SALES_MANAGER',
  /** Производство — задания, планы, материалы */
  PRODUCTION: 'PRODUCTION',
  /** Склад — остатки, движение товара */
  WAREHOUSE: 'WAREHOUSE',
  /** Бухгалтер — счета, оплаты, документы */
  ACCOUNTANT: 'ACCOUNTANT',
  /** Администратор — настройки всей системы */
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Источник обращения клиента */
export const LeadSource = {
  WEBSITE: 'WEBSITE',
  WHATSAPP: 'WHATSAPP',
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
  SOCIAL: 'SOCIAL',
  MANUAL: 'MANUAL',
} as const;
export type LeadSource = (typeof LeadSource)[keyof typeof LeadSource];

/** Статус лида в воронке */
export const LeadStatus = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  QUALIFIED: 'QUALIFIED',
  PROPOSAL: 'PROPOSAL',
  WON: 'WON',
  LOST: 'LOST',
} as const;
export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

/** Этап сделки: расчёт → КП → договор → счёт → оплата */
export const DealStage = {
  CALCULATION: 'CALCULATION',
  PROPOSAL: 'PROPOSAL',
  CONTRACT: 'CONTRACT',
  INVOICE: 'INVOICE',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED',
} as const;
export type DealStage = (typeof DealStage)[keyof typeof DealStage];

/** Статус заказа в ERP */
export const OrderStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  IN_PRODUCTION: 'IN_PRODUCTION',
  READY: 'READY',
  SHIPPING: 'SHIPPING',
  DELIVERED: 'DELIVERED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/** Этапы производства (MES) */
export const ProductionStageCode = {
  PLANNING: 'PLANNING',
  MATERIALS: 'MATERIALS',
  MIXING: 'MIXING',
  MOLDING: 'MOLDING',
  DRYING: 'DRYING',
  QUALITY_CONTROL: 'QUALITY_CONTROL',
  PACKAGING: 'PACKAGING',
  COMPLETED: 'COMPLETED',
} as const;
export type ProductionStageCode = (typeof ProductionStageCode)[keyof typeof ProductionStageCode];

/** Статус производственного задания */
export const ProductionTaskStatus = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type ProductionTaskStatus = (typeof ProductionTaskStatus)[keyof typeof ProductionTaskStatus];

/** Тип склада */
export const WarehouseType = {
  RAW_MATERIALS: 'RAW_MATERIALS',
  MATERIALS: 'MATERIALS',
  MOLDS: 'MOLDS',
  FINISHED_GOODS: 'FINISHED_GOODS',
} as const;
export type WarehouseType = (typeof WarehouseType)[keyof typeof WarehouseType];

/** Тип складского движения */
export const StockMovementType = {
  IN: 'IN',
  OUT: 'OUT',
  TRANSFER: 'TRANSFER',
  RESERVE: 'RESERVE',
  RELEASE_RESERVE: 'RELEASE_RESERVE',
  INVENTORY: 'INVENTORY',
  WRITE_OFF: 'WRITE_OFF',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

/** Статус доставки */
export const DeliveryStatus = {
  PREPARING: 'PREPARING',
  LOADED: 'LOADED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

/** Статус счёта */
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

/** Способ оплаты */
export const PaymentMethod = {
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  CARD: 'CARD',
  OTHER: 'OTHER',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

/** Единица измерения */
export const Unit = {
  M2: 'M2',
  M3: 'M3',
  MP: 'MP',
  PCS: 'PCS',
  KG: 'KG',
  TON: 'TON',
  L: 'L',
} as const;
export type Unit = (typeof Unit)[keyof typeof Unit];
