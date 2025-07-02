import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { IBuyHistory } from "./buy-history-domain";
import { sequelize } from "@/config/database";
import { uuidv7 } from "uuidv7";
import { Commodity } from "../commodity/commodity-model";

export class BuyHistory extends Model <
  InferAttributes<BuyHistory>,
  InferCreationAttributes<BuyHistory>
> implements IBuyHistory {
  declare id: CreationOptional<string>;
  declare commodityId: string;
  declare commodity?: NonAttribute<Commodity>;
  declare date: Date;
  declare qty: number;
  declare totalPrice: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;

  static associations: {
    commodity: Association<BuyHistory, Commodity>;
  }
}

BuyHistory.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv7(),
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
    type: DataTypes.DATE,
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
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  deletedAt: DataTypes.DATE
}, {
  sequelize,
  tableName: 'buy_histories',
  modelName: 'buyHistory',
  underscored: true,
  paranoid: true
})