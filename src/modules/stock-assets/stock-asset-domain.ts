import { ICommodity } from "../commodity/commodity-domain";
import { DomainEntity } from "../common/domainEntity";
import { DefaultEntityBehaviour } from "../common/dto/common-dto";

export interface IStockAsset {
  id?: string;
  commodityId: string;
  commodity?: ICommodity;
  qty: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class StockAssetDomain
  extends DomainEntity<IStockAsset>
  implements DefaultEntityBehaviour<IStockAsset> 
{
  private constructor(props: IStockAsset) {
    const { id, ...data } = props;
    super(data, id);
  }

  public static create(props: IStockAsset): StockAssetDomain {
    return new StockAssetDomain(props);
  }

  public unmarshal(): IStockAsset {
    return {
      id: this.id,
      commodityId: this.commodityId,
      commodity: this.commodity,
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

  get commodity(): ICommodity | undefined {
    return this.props.commodity;
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
