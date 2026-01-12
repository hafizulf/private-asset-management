export const ENUM_FILTER_DASHBOARD = {
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
  DATE_RANGE: 'date_range',
} as const;

export type DashboardFilter =
  (typeof ENUM_FILTER_DASHBOARD)[keyof typeof ENUM_FILTER_DASHBOARD];

export const ENUM_GRANULARITY = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const;

export type DashboardGranularity =
  (typeof ENUM_GRANULARITY)[keyof typeof ENUM_GRANULARITY];

export const ENUM_METRIC = {
  VALUE: 'value',
  QTY: 'qty',
} as const;

export type DashboardMetric =
  (typeof ENUM_METRIC)[keyof typeof ENUM_METRIC];

export type DateRange = {
  from?: string;
  to?: string;
}

export const DateFormat = "YYYY-MM-DD";
export const BuySellSeriesDateFormat = "DD MMM YY";
export type TimeUnit = "day" | "month" | "year";

//

export type BasicDashboardParams = {
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

export type totalTransactions = {
  totalTransactions: number;
  totalPrice: string;
}

//
export type BuySellSeriesPoint = {
  bucket: string;
  buy: string;
  sell: string;
};

export type BuySellSeriesResponse = {
  meta: {
    filter: DashboardFilter;
    from: string;
    to: string;
    granularity: DashboardGranularity;
    metric: DashboardMetric;
  };
  series: BuySellSeriesPoint[];
  totals: {
    buy: string;
    sell: string;
  };
};

export type SeriesRow = {
  date: string | Date;
  qty: string;
  totalPrice: string;
};

export type Window = {
  from: string; 
  to: string
}

export type TopCommodityRow = {
  commodityId: string;
  commodityName: string;
  buyQty: string;
  buyValue: string;
  sellQty: string;
  sellValue: string;
  totalQty: string;
  totalValue: string;
}

export type TopCommoditiesResponse = {
  meta: {
    filter: DashboardFilter;
    from?: string;
    to?: string;
    metric: DashboardMetric;
    limit: number;
  };
  items: TopCommodityRow[];
}
