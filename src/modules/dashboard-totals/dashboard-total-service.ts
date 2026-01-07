import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { IDashboardTotalRepository } from "./dashboard-total-repository-interface";
import { IDashboardTotal } from "./dashboard-total-domain";
import { IUserRepository } from "../users/user-repository-interface";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { 
  DateFormat, 
  DateRange, 
  ENUM_FILTER_DASHBOARD,
  TotalProfitLossParams, 
  TotalProfitLossResponse,
  TotalStockAssetsResponse,
} from "./dashboard-total.dto";
import { IBuyHistoryRepository } from "../buy-history/buy-history-repository-interface";
import { ISellHistoryRepository } from "../sell-history/sell-history-repository-interface";
import { IStockAssetRepository } from "../stock-assets/stock-asset-repository-interface";
import { toDecimal } from "@/helpers/math.helper";
import Decimal from "decimal.js";
import dayjs from "dayjs";


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
  async totalProfitLoss(params: TotalProfitLossParams): Promise<TotalProfitLossResponse> {
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

    const currentSellHistory = toDecimal(await this._sellHistoryRepository.countPrice(filter, currentRange));
    const currentBuyHistory = toDecimal(await this._buyHistoryRepository.countPrice(filter, currentRange));
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
   * 4. Total Sell Transactions [day, month, year]
   * 5. Buy vs sell over time (daily/weekly)
   * 6. Top 5 commodities by volume/value
   * 7. Last 10 buys/sells with date, commodity, qty, total
   */
}
