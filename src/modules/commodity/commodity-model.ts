import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { ICommodity } from "./commodity-domain";
import { sequelize } from "@/config/database";
import { uuidv7 } from "uuidv7";

export class Commodity extends Model <
  InferAttributes<Commodity>,
  InferCreationAttributes<Commodity>
> implements ICommodity {
  declare id: string;
  declare name: string;
  declare isActive: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date>;
}

Commodity.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: () => uuidv7(),
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  deletedAt: DataTypes.DATE
}, {
  sequelize,
  tableName: 'commodities',
  modelName: 'commodity',
  underscored: true,
  paranoid: true
})