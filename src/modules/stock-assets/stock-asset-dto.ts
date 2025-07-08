import { IBuyHistory } from "../buy-history/buy-history-domain";
import { ISellHistory } from "../sell-history/sell-history-domain";
import { IStockAsset } from "./stock-asset-domain";

export interface IStockAssetHistory extends Omit<IStockAsset, "qty"> {
  commodityName: string;
  quantity: string;
  totalAssetValue: number;
  totalProfit: number;
  totalBuyingPrice: number;
  totalSellingPrice: number;
  buyHistories: IBuyHistory[];
  sellHistories: ISellHistory[];
}
