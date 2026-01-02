import { ICommodity } from "../commodity/commodity-domain";
import { DomainEntity } from "../common/domainEntity";
import { DefaultEntityBehaviour } from "../common/dto/common-dto";

export interface ISellHistory {
  id?: string;
  commodityId: string;
  commodity?: ICommodity;
  date: Date;
  qty: string;
  totalPrice: string;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class SellHistoryDomain 
  extends DomainEntity<ISellHistory> 
  implements DefaultEntityBehaviour<ISellHistory> 
{
  private constructor(props: ISellHistory) {
    const { id, ...data } = props;
    super(data, id);
  }

  public static create(props: ISellHistory): SellHistoryDomain {
    return new SellHistoryDomain(props);
  }

  public unmarshal(): ISellHistory {
    return {
      id: this.id,
      commodityId: this.commodityId,
      commodity: this.commodity,
      date: this.date,
      qty: this.qty,
      totalPrice: this.totalPrice,
      memo: this.memo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt
    }
  }

  get id(): string {
    return this._id;
  }

  get commodityId(): string {
    return this.props.commodityId;
  }

  get commodity(): ICommodity | undefined {
    return this.props.commodity;
  }

  get date(): Date {
    return this.props.date;
  }

  get qty(): string {
    return this.props.qty;
  }

  get totalPrice(): string {
    return this.props.totalPrice;
  }

  get memo(): string | undefined {
    return this.props.memo;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }
}
