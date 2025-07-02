import { IBuyHistory } from "./buy-history-domain";

export interface IBuyHistoryView extends IBuyHistory {
  commodityName: string;
  commodityUnit: string;
}

export interface ICommodityBuyHistoryView {
  commodityId: string;
  commodityName: string;
  totalQty: number;
  totalPrice: number;
  buyHistories: IBuyHistory[];
}
