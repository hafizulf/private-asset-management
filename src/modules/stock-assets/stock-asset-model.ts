import { Association, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import { IStockAsset } from "./stock-asset-domain";
import { sequelize } from "@/config/database";
import { uuidv7 } from "uuidv7";
import { Commodity } from "../commodity/commodity-model";

export class StockAsset extends Model <
  InferAttributes<StockAsset>,
  InferCreationAttributes<StockAsset>
> implements IStockAsset {
  declare id: CreationOptional<string>;
  declare commodityId: string;
  declare commodity?: NonAttribute<Commodity>;
  declare qty: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
  
  static associations: {
    commodity: Association<StockAsset, Commodity>;
  }
}

StockAsset.init({
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
  qty: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  deletedAt: DataTypes.DATE
}, {
  sequelize,
  tableName: "stock_assets",
  modelName: "stockAsset",
  underscored: true,
  paranoid: true,
})
