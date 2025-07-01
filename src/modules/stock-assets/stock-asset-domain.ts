import { DomainEntity } from "../common/domainEntity";
import { DefaultEntityBehaviour } from "../common/dto/common-dto";

export interface IStockAsset {
  id?: string;
  commodityId: string;
  qty: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class StockAsset 
  extends DomainEntity<IStockAsset>
  implements DefaultEntityBehaviour<IStockAsset> 
{
  private constructor(props: IStockAsset) {
    const { id, ...data } = props;
    super(data, id);
  }

  public static create(props: IStockAsset): StockAsset {
    return new StockAsset(props);
  }

  public unmarshal(): IStockAsset {
    return {
      id: this.id,
      commodityId: this.commodityId,
      qty: this.qty,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  get id(): string {
    return this._id;
  }

  get commodityId(): string {
    return this.props.commodityId;
  }

  get qty(): number {
    return this.props.qty;
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
