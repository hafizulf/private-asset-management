import { DomainEntity } from "../common/domainEntity";
import { DefaultEntityBehaviour } from "../common/dto/common-dto";

export interface ISellHistory {
  id?: string;
  commodityId: string;
  date: Date;
  qty: number;
  totalPrice: number;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class SellHistory 
  extends DomainEntity<ISellHistory> 
  implements DefaultEntityBehaviour<ISellHistory> 
{
  private constructor(props: ISellHistory) {
    const { id, ...data } = props;
    super(data, id);
  }

  public static create(props: ISellHistory): SellHistory {
    return new SellHistory(props);
  }

  public unmarshal(): ISellHistory {
    return {
      id: this.id,
      commodityId: this.commodityId,
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

  get date(): Date {
    return this.props.date;
  }

  get qty(): number {
    return this.props.qty;
  }

  get totalPrice(): number {
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
