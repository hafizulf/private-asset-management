import { DomainEntity } from "../common/domainEntity";
import { DefaultEntityBehaviour } from "../common/dto/common-dto";

export interface ICommodity {
  id?: string;
  name: string;
  unit: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class CommodityDomain 
  extends DomainEntity<ICommodity> 
  implements DefaultEntityBehaviour<ICommodity> 
{
  private constructor(props: ICommodity) {
    const { id, ...data } = props;
    super(data, id);
  }

  public static create(props: ICommodity): CommodityDomain {
    return new CommodityDomain(props);
  }

  public unmarshal(): ICommodity {
    return {
      id: this.id,
      name: this.name,
      unit: this.unit,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this.props.name;
  }

  get unit(): string {
    return this.props.unit;
  }

  get isActive(): boolean {
    return this.props.isActive;
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
