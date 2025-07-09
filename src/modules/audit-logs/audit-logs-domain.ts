import { IBuyHistory } from "../buy-history/buy-history-domain";
import { DomainEntity } from "../common/domainEntity";
import { DefaultEntityBehaviour } from "../common/dto/common-dto";
import { ISellHistory } from "../sell-history/sell-history-domain";
import { IUser } from "../users/user-domain";

export interface IAuditLogs {
  id?: string;
  userId: string;
  user?: IUser;
  type: "buy" | "sell";
  action: string;
  payload: IBuyHistory | ISellHistory;
  createdAt?: Date;
  deletedAt?: Date;
}

export class AuditLogsDomain 
  extends DomainEntity<IAuditLogs> 
  implements DefaultEntityBehaviour<IAuditLogs> 
{
  constructor(props: IAuditLogs) {
    super(props, props.id);
  }

  public static create(props: IAuditLogs): AuditLogsDomain {
    return new AuditLogsDomain(props);
  }

  unmarshal(): IAuditLogs {
    return {
      id: this.id,
      userId: this.userId,
      user: this.user,
      type: this.type,
      action: this.action,
      payload: this.payload,
      createdAt: this.createdAt,
      deletedAt: this.deletedAt,
    }
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get user(): IUser | undefined {
    return this.props.user;
  }

  get type(): "buy" | "sell" {
    return this.props.type;
  }

  get action(): string {
    return this.props.action;
  }

  get payload(): IBuyHistory | ISellHistory {
    return this.props.payload;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }
}
