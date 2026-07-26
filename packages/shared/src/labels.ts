/** Русские подписи для перечислений — используются в интерфейсе и документах. */
import {
  DealStage,
  DeliveryStatus,
  InvoiceStatus,
  LeadSource,
  LeadStatus,
  OrderStatus,
  PaymentMethod,
  ProductionStageCode,
  ProductionTaskStatus,
  StockMovementType,
  Unit,
  UserRole,
  WarehouseType,
} from './enums';

export const UserRoleLabel: Record<UserRole, string> = {
  [UserRole.DIRECTOR]: 'Директор',
  [UserRole.SALES_MANAGER]: 'Менеджер продаж',
  [UserRole.PRODUCTION]: 'Производство',
  [UserRole.WAREHOUSE]: 'Склад',
  [UserRole.ACCOUNTANT]: 'Бухгалтер',
  [UserRole.ADMIN]: 'Администратор',
};

export const LeadSourceLabel: Record<LeadSource, string> = {
  [LeadSource.WEBSITE]: 'Сайт',
  [LeadSource.WHATSAPP]: 'WhatsApp',
  [LeadSource.PHONE]: 'Телефон',
  [LeadSource.EMAIL]: 'Email',
  [LeadSource.SOCIAL]: 'Соцсети',
  [LeadSource.MANUAL]: 'Добавлен вручную',
};

export const LeadStatusLabel: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'Новый',
  [LeadStatus.IN_PROGRESS]: 'В работе',
  [LeadStatus.QUALIFIED]: 'Квалифицирован',
  [LeadStatus.PROPOSAL]: 'Отправлено КП',
  [LeadStatus.WON]: 'Успешно',
  [LeadStatus.LOST]: 'Отказ',
};

export const DealStageLabel: Record<DealStage, string> = {
  [DealStage.CALCULATION]: 'Расчёт',
  [DealStage.PROPOSAL]: 'Коммерческое предложение',
  [DealStage.CONTRACT]: 'Договор',
  [DealStage.INVOICE]: 'Счёт выставлен',
  [DealStage.PAID]: 'Оплачено',
  [DealStage.CANCELLED]: 'Отменена',
};

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'Черновик',
  [OrderStatus.CONFIRMED]: 'Подтверждён',
  [OrderStatus.IN_PRODUCTION]: 'В производстве',
  [OrderStatus.READY]: 'Готов к отгрузке',
  [OrderStatus.SHIPPING]: 'Доставляется',
  [OrderStatus.DELIVERED]: 'Доставлен',
  [OrderStatus.CLOSED]: 'Закрыт',
  [OrderStatus.CANCELLED]: 'Отменён',
};

export const ProductionStageLabel: Record<ProductionStageCode, string> = {
  [ProductionStageCode.PLANNING]: 'Планирование',
  [ProductionStageCode.MATERIALS]: 'Подготовка материалов',
  [ProductionStageCode.MIXING]: 'Замес',
  [ProductionStageCode.MOLDING]: 'Формование',
  [ProductionStageCode.DRYING]: 'Сушка',
  [ProductionStageCode.QUALITY_CONTROL]: 'Контроль качества',
  [ProductionStageCode.PACKAGING]: 'Упаковка',
  [ProductionStageCode.COMPLETED]: 'Готовая продукция',
};

export const ProductionTaskStatusLabel: Record<ProductionTaskStatus, string> = {
  [ProductionTaskStatus.PLANNED]: 'Запланировано',
  [ProductionTaskStatus.IN_PROGRESS]: 'В работе',
  [ProductionTaskStatus.PAUSED]: 'Приостановлено',
  [ProductionTaskStatus.COMPLETED]: 'Выполнено',
  [ProductionTaskStatus.CANCELLED]: 'Отменено',
};

export const WarehouseTypeLabel: Record<WarehouseType, string> = {
  [WarehouseType.RAW_MATERIALS]: 'Сырьё',
  [WarehouseType.MATERIALS]: 'Материалы',
  [WarehouseType.MOLDS]: 'Формы',
  [WarehouseType.FINISHED_GOODS]: 'Готовая продукция',
};

export const StockMovementTypeLabel: Record<StockMovementType, string> = {
  [StockMovementType.IN]: 'Приход',
  [StockMovementType.OUT]: 'Расход',
  [StockMovementType.TRANSFER]: 'Перемещение',
  [StockMovementType.RESERVE]: 'Резерв',
  [StockMovementType.RELEASE_RESERVE]: 'Снятие резерва',
  [StockMovementType.INVENTORY]: 'Инвентаризация',
  [StockMovementType.WRITE_OFF]: 'Списание',
};

export const DeliveryStatusLabel: Record<DeliveryStatus, string> = {
  [DeliveryStatus.PREPARING]: 'Подготовка',
  [DeliveryStatus.LOADED]: 'Загружено',
  [DeliveryStatus.IN_TRANSIT]: 'В пути',
  [DeliveryStatus.DELIVERED]: 'Доставлено',
  [DeliveryStatus.CANCELLED]: 'Отменено',
};

export const InvoiceStatusLabel: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Черновик',
  [InvoiceStatus.ISSUED]: 'Выставлен',
  [InvoiceStatus.PARTIALLY_PAID]: 'Оплачен частично',
  [InvoiceStatus.PAID]: 'Оплачен',
  [InvoiceStatus.OVERDUE]: 'Просрочен',
  [InvoiceStatus.CANCELLED]: 'Аннулирован',
};

export const PaymentMethodLabel: Record<PaymentMethod, string> = {
  [PaymentMethod.BANK_TRANSFER]: 'Банковский перевод',
  [PaymentMethod.CASH]: 'Наличные',
  [PaymentMethod.CARD]: 'Карта',
  [PaymentMethod.OTHER]: 'Другое',
};

export const UnitLabel: Record<Unit, string> = {
  [Unit.M2]: 'м²',
  [Unit.M3]: 'м³',
  [Unit.MP]: 'м.п.',
  [Unit.PCS]: 'шт',
  [Unit.KG]: 'кг',
  [Unit.TON]: 'т',
  [Unit.L]: 'л',
};
