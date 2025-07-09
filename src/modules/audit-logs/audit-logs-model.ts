import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { IAuditLogs } from "./audit-logs-domain";
import { User } from "../users/user-model";
import { IBuyHistory } from "../buy-history/buy-history-domain";
import { ISellHistory } from "../sell-history/sell-history-domain";
import { uuidv7 } from "uuidv7";
import { sequelize } from "@/config/database";

export class AuditLogs extends Model <
  InferAttributes<AuditLogs>,
  InferCreationAttributes<AuditLogs>
> implements IAuditLogs {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare user: NonAttribute<User>;
  declare type: "buy" | "sell";
  declare action: string;
  declare payload: IBuyHistory | ISellHistory;
  declare createdAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  static associations: {
    user: Association<AuditLogs, User>;
  }
}

AuditLogs.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv7(),
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id"
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  sequelize,
  modelName: "auditLogs",
  tableName: "audit_logs",
  underscored: true,
  paranoid: true,
});
