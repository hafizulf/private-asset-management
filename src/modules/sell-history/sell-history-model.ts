import { sequelize } from "@/config/database";
import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { ISellHistory } from "./sell-history-domain";
import { uuidv7 } from "uuidv7";
import { Commodity } from "../commodity/commodity-model";

export class SellHistory extends Model <
  InferAttributes<SellHistory>,
  InferCreationAttributes<SellHistory>
> implements ISellHistory {
  declare id: CreationOptional<string>;
  declare commodityId: string;
  declare commodity?: NonAttribute<Commodity>;
  declare date: Date;
  declare qty: number;
  declare totalPrice: number;
  declare memo: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  static associations: {
    commodity: Association<SellHistory, Commodity>;
  }
}

SellHistory.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv7()
  },
  commodityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Commodity,
      key: "id"
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  memo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  deletedAt: DataTypes.DATE
}, {
  sequelize,
  tableName: "sell_histories",
  modelName: "sellHistory",
  underscored: true,
  paranoid: true
})