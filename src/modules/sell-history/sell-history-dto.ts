import { ISellHistory } from "./sell-history-domain";

export interface ISellHistoryView extends ISellHistory {
  commodityName: string;
  commodityUnit: string;
}

export interface ICommoditySellHistoryView {
  commodityId: string;
  commodityName: string;
  totalQty: string;
  totalPrice: number;
  sellHistories: ISellHistory[];
}
