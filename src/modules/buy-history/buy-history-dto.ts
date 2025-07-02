import { IBuyHistory } from "./buy-history-domain";

export interface IBuyHistoryView extends IBuyHistory {
  commodityName: string;
  commodityUnit: string;
}

export interface ICommodityBuyHistoryView {
  commodityId: string;
  commodityName: string;
  totalQty: string;
  totalPrice: number;
  buyHistories: IBuyHistory[];
}
