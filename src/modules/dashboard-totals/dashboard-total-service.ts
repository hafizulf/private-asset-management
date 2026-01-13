import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { IDashboardTotalRepository } from "./dashboard-total-repository-interface";
import { IDashboardTotal } from "./dashboard-total-domain";
import { IUserRepository } from "../users/user-repository-interface";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { 
  BasicDashboardParams,
  BuySellSeriesPoint,
  BuySellSeriesResponse,
  DashboardFilter,
  DashboardGranularity,
  DashboardMetric,
  DateFormat,
  BuySellSeriesDateFormat, 
  DateRange, 
  ENUM_FILTER_DASHBOARD,
  TotalProfitLossResponse,
  TotalStockAssetsResponse,
  totalTransactions,
  Window,
  TopCommoditiesResponse,
  RecentTransactionRow,
} from "./dashboard-total.dto";
import { IBuyHistoryRepository } from "../buy-history/buy-history-repository-interface";
import { ISellHistoryRepository } from "../sell-history/sell-history-repository-interface";
import { IStockAssetRepository } from "../stock-assets/stock-asset-repository-interface";
import { toDecimal } from "@/helpers/math.helper";
import Decimal from "decimal.js";
import dayjs from "dayjs";
// import { Pagination } from "../common/pagination";


@injectable()
export class DashboardTotalService {
  constructor(
    @inject(TYPES.IDashboardTotalRepository) private _repository: IDashboardTotalRepository,
    @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.IBuyHistoryRepository) private _buyHistoryRepository: IBuyHistoryRepository,
    @inject(TYPES.ISellHistoryRepository) private _sellHistoryRepository: ISellHistoryRepository,
    @inject(TYPES.IStockAssetRepository) private _stockAssetRepository: IStockAssetRepository,
    )
  {}

  async findAll(): Promise<IDashboardTotal[]> {
    return (await this._repository.findAll()).map((el) => el.unmarshal());
  }

  async insertDashboardTotal(): Promise<void> {
    try {
      const totalUserRegistered = await this._userRepository.countRegisteredUser();
      const totalUserActive = await this._userRepository.countActiveUser();

      const data = [
        {
          name: "user_registered",
          totalCounted: totalUserRegistered,
        },
        {
          name: "user_active",
          totalCounted: totalUserActive,
        },
      ];

      for (const element of data) {
        await this._repository.createOrUpdate(element);
      }
    } catch (error) {
      console.error(error);
      throw new AppError({
        statusCode: HttpCode.INTERNAL_SERVER_ERROR,
        description: "Failed to insert dashboard total",
      })
    }
  }

  /**
   * 1. Total Profit/Loss (Assets) [day, month, year, all time]
  */
  async totalProfitLoss(params: BasicDashboardParams): Promise<TotalProfitLossResponse> {
    const { filter, from, to } = params;

    let currentRange: DateRange | undefined;
    let previousRange: DateRange | undefined;

    if (filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
      const curFrom = from!;
      const curTo = to!;

      const days = dayjs(curTo).diff(dayjs(curFrom), "day") + 1;
      const prevTo = dayjs(curFrom).subtract(1, "day");
      const prevFrom = prevTo.subtract(days - 1, "day");

      currentRange = { from: curFrom, to: curTo };
      previousRange = {
        from: prevFrom.format(DateFormat),
        to: prevTo.format(DateFormat),
      };
    }

    const currentSellHistory = toDecimal((await this._sellHistoryRepository.countPrice(filter, currentRange)).totalPrice);
    const currentBuyHistory = toDecimal((await this._buyHistoryRepository.countPrice(filter, currentRange)).totalPrice);
    const currentProfitLoss = currentSellHistory.minus(currentBuyHistory);
    
    const previousSellHistory = toDecimal(await this._sellHistoryRepository.countPricePrevious(filter, previousRange));
    const previousBuyHistory = toDecimal(await this._buyHistoryRepository.countPricePrevious(filter, previousRange));
    const previousProfitLoss = previousSellHistory.minus(previousBuyHistory);

    let trend = new Decimal(0);
    if (!previousProfitLoss.isZero()) {
      trend = currentProfitLoss
        .minus(previousProfitLoss)
        .div(previousProfitLoss.abs())
        .mul(100);
    }

    return {
      totalProfitLoss: {
        value: currentProfitLoss.toFixed(2),
        trend: trend.toFixed(1),
      },
    };
  }

  /**
   * 2. Total Stock Assets filter by [commodity id or all]
  */
  async totalStockAssets(commodityId?: string): Promise<TotalStockAssetsResponse> {
    const rows = commodityId
      ? [await this._stockAssetRepository.findByCommodityId(commodityId)]
      : await this._stockAssetRepository.findAll();

    const totalStockAssets = rows.map((el) => ({
      commodityId: el.commodityId,
      commodityName: el.commodity!.name,
      qty: el.qty,
    }));

    return { totalStockAssets };
  }

  /**
   * 3. Total Buy Transactions [day, month, year] 
  */
  async totalBuyTransactions(params: BasicDashboardParams): Promise<totalTransactions> {
    const { filter, from, to } = params;

    let dateRange: DateRange | undefined;
    if (filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
      const curFrom = from!;
      const curTo = to!;
      dateRange = { from: curFrom, to: curTo };
    }

    return (await this._buyHistoryRepository.countPrice(filter, dateRange));
  }

  /**
   * 4. Total Sell Transactions [day, month, year]
  */
  async totalSellTransactions(params: BasicDashboardParams): Promise<totalTransactions> {
      const { filter, from, to } = params;

      let dateRange: DateRange | undefined;
      if (filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
        const curFrom = from!;
        const curTo = to!;
        dateRange = { from: curFrom, to: curTo };
      }

      return (await this._sellHistoryRepository.countPrice(filter, dateRange));
    }

  /**
   * 5. Buy vs sell over time (daily/weekly)
  */
  async totalBuySellSeries(
    params: BasicDashboardParams,
    granularity: DashboardGranularity,
    metric: DashboardMetric
  ): Promise<BuySellSeriesResponse> {
    const { filter, from, to } = params;

    const window =
      filter === ENUM_FILTER_DASHBOARD.ALL
        ? undefined
        : this.resolveWindow(filter, from, to);

    const [buyMinMax, sellMinMax] = await Promise.all([
      this._buyHistoryRepository.findMinMaxDate(),
      this._sellHistoryRepository.findMinMaxDate(),
    ]);

    const effectiveWindow: Window =
      filter === ENUM_FILTER_DASHBOARD.ALL
        ? (() => {
            const dates = [
              buyMinMax.minDate,
              buyMinMax.maxDate,
              sellMinMax.minDate,
              sellMinMax.maxDate,
            ]
              .filter(Boolean)
              .sort();

            const first = dates.at(0);
            const last = dates.at(-1);

            if (!first || !last) {
              const today = dayjs().format(DateFormat);
              return { from: today, to: today };
            }

            return { from: first, to: last };
          })()
        : (window as Window);

    const [buyAgg, sellAgg] = await Promise.all([
      this._buyHistoryRepository.findBucketedSeries(
        window?.from,
        window?.to,
        granularity,
        metric
      ),
      this._sellHistoryRepository.findBucketedSeries(
        window?.from,
        window?.to,
        granularity,
        metric
      ),
    ]);

    const buckets = this.buildBuckets(effectiveWindow.from, effectiveWindow.to, granularity);

    let totalBuy = new Decimal(0);
    let totalSell = new Decimal(0);

    const series: BuySellSeriesPoint[] = buckets.map((b) => {
      const buy = buyAgg[b] ?? new Decimal(0);
      const sell = sellAgg[b] ?? new Decimal(0);

      totalBuy = totalBuy.plus(buy);
      totalSell = totalSell.plus(sell);

      return {
        bucket: dayjs(b).format(BuySellSeriesDateFormat),
        buy: buy.toFixed(2),
        sell: sell.toFixed(2),
      };
    });

    return {
      meta: {
        filter,
        from: effectiveWindow.from,
        to: effectiveWindow.to,
        granularity,
        metric,
      },
      series,
      totals: {
        buy: totalBuy.toFixed(2),
        sell: totalSell.toFixed(2),
      },
    };
  }

  private resolveWindow(filter: DashboardFilter, from?: string, to?: string): Window {
    if (filter === ENUM_FILTER_DASHBOARD.DATE_RANGE) {
      return { from: from!, to: to! };
    }

    const now = dayjs();

    if (filter === ENUM_FILTER_DASHBOARD.DAY) {
      const d = now.format(DateFormat);
      return { from: d, to: d };
    }

    if (filter === ENUM_FILTER_DASHBOARD.MONTH) {
      return {
        from: now.startOf("month").format(DateFormat),
        to: now.endOf("month").format(DateFormat),
      };
    }

    if (filter === ENUM_FILTER_DASHBOARD.YEAR) {
      return {
        from: now.startOf("year").format(DateFormat),
        to: now.endOf("year").format(DateFormat),
      };
    }

    const today = now.format(DateFormat);
    return { from: today, to: today };
  }

  private buildBuckets(from: string, to: string, granularity: DashboardGranularity): string[] {
    const start = dayjs(from);
    const end = dayjs(to);

    if (granularity === "day") {
      const out: string[] = [];
      let cur = start;
      while (cur.isBefore(end) || cur.isSame(end, "day")) {
        out.push(cur.format(DateFormat));
        cur = cur.add(1, "day");
      }
      return out;
    }

    if (granularity === "week") {
      const out: string[] = [];
      let cur = start.startOf("week");
      const endW = end.startOf("week");
      while (cur.isBefore(endW) || cur.isSame(endW, "week")) {
        out.push(cur.format(DateFormat));
        cur = cur.add(1, "week");
      }
      return out;
    }

    const out: string[] = [];
    let cur = start.startOf("month");
    const endM = end.startOf("month");
    while (cur.isBefore(endM) || cur.isSame(endM, "month")) {
      out.push(cur.format(DateFormat));
      cur = cur.add(1, "month");
    }
    return out;
  }

  /**
   * 6. Top 5 commodities by volume/value
   */
  async totalTopCommodities(
    params: BasicDashboardParams,
    metric: DashboardMetric,
    limit: number = 5,
  ): Promise<TopCommoditiesResponse> {
    const { filter, from, to } = params;

    const window =
      filter === ENUM_FILTER_DASHBOARD.ALL
        ? undefined
        : this.resolveWindow(filter, from, to);

    const rows = await this._repository.findTopCommodities(
      window?.from,
      window?.to,
      metric,
      limit,
    );

    return {
      meta: {
        filter,
        from: window?.from,
        to: window?.to,
        metric,
        limit: 5,
      },
      items: rows.map((r) => ({
        commodityId: r.commodityId,
        commodityName: r.commodityName,
        buyQty: r.buyQty,
        buyValue: r.buyValue,
        sellQty: r.sellQty,
        sellValue: r.sellValue,
        totalQty: r.totalQty,
        totalValue: r.totalValue,
      })),
    };
  }


  /**
   * 7. Last 10 buys/sells with date, commodity, qty, total
   */
  async getRecentTransactions(): Promise<RecentTransactionRow[]> {
    const rows = await this._repository.getRecentTransactions();

    const items: RecentTransactionRow[] = rows.map((r) => ({
      date: dayjs(r.date).format("DD MMM YY"),
      commodity: r.commodity,
      type: r.type,
      qty: String(r.qty),
      total: String(r.total),
      createdAt: dayjs(r.createdAt).toISOString(),
    }));

    return items;
  }
}
