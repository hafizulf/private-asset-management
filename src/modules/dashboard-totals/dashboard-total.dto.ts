export const ENUM_FILTER_DASHBOARD = {
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
  DATE_RANGE: 'date_range',
} as const;

export type DashboardFilter =
  (typeof ENUM_FILTER_DASHBOARD)[keyof typeof ENUM_FILTER_DASHBOARD];

export type DateRange = {
  from?: string;
  to?: string;
}

export const DateFormat = "YYYY-MM-DD";

//

export type TotalProfitLossParams = {
  filter: DashboardFilter;
  from?: string;
  to?: string; 
}

export type TotalProfitLossResponse = {
  totalProfitLoss: {
    value: string;
    trend: string;
  },
}

type StockAssetItem = {
  commodityId: string;
  commodityName: string;
  qty: string;
}

export type TotalStockAssetsResponse = {
  totalStockAssets: StockAssetItem[];
}
