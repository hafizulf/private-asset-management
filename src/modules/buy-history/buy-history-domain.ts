import { ICommodity } from "../commodity/commodity-domain";
import { DomainEntity } from "../common/domainEntity";
import { DefaultEntityBehaviour } from "../common/dto/common-dto";

export interface IBuyHistory {
  id?: string;
  commodityId: string;
  commodity?: ICommodity;
  date: Date;
  qty: string;
  unitPrice?: string;
  totalPrice: string;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class BuyHistoryDomain 
  extends DomainEntity<IBuyHistory> 
  implements DefaultEntityBehaviour<IBuyHistory> 
{
  private constructor(props: IBuyHistory) {
    const { id, ...data } = props;
    super(data, id);
  }

  public static create(props: IBuyHistory): BuyHistoryDomain {
    return new BuyHistoryDomain(props);
  }

  public unmarshal(): IBuyHistory {
    return {
      id: this.id,
      commodityId: this.commodityId,
      commodity: this.commodity,
      date: this.date,
      qty: this.qty,
      unitPrice: this.unitPrice,
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

  get unitPrice(): string | undefined {
    return this.props.unitPrice;
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
