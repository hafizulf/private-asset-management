import { injectable } from "inversify";
import { IAuditLogsRepository } from "./audit-logs-repository-interface";
import { AuditLogsDomain } from "./audit-logs-domain";
import { BaseQueryOption } from "../common/dto/common-dto";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { Op, Sequelize } from "sequelize";
import { 
  AuditLogs as AuditLogsPersistence,
  User as UserPersistence,
} from "@/modules/common/sequelize";

@injectable()
export class AuditLogsRepository implements IAuditLogsRepository {
  findAll = async (): Promise<AuditLogsDomain[]> => {
    const data = await AuditLogsPersistence.findAll({
      include: [
        {
          model: UserPersistence, 
          attributes: ["fullName"],
        },
      ]
    });
    return data.map((el) => AuditLogsDomain.create(el.toJSON()));
  }
  findAllWithPagination = async (
    paginateOption: TStandardPaginateOption, 
    pagination: Pagination
  ): Promise<[AuditLogsDomain[], Pagination]> => {
    const search = paginateOption.search;
    const orderBy = paginateOption.orderBy ? paginateOption.orderBy : "createdAt";
    const sort = paginateOption.sort ? paginateOption.sort : "DESC";
    const searchCondition = search
      ? {
          [Op.or]: [
            Sequelize.literal(`"user"."full_name" ILIKE :search`),
            {
              action: {
                [Op.iLike]: `%${search}%`,
              }
            },
            {
              type: {
                [Op.iLike]: `%${search}%`,
              }
            },
            // Search in JSON column "payload" ->> 'commodityId'
            Sequelize.literal(`payload ->> 'commodityId' ILIKE :search`)
          ],
        }
      : {};

    const { rows, count } = await AuditLogsPersistence.findAndCountAll({
      include: [
        {
          model: UserPersistence, 
          attributes: ["fullName"],
        },
      ],
      where: {
        ...searchCondition,
      },
      replacements: { search: `%${search}%` },
      order: [
        orderBy === "user"
          ? [Sequelize.col("user.full_name"), sort] 
          : [Sequelize.col(orderBy), sort],
      ],
      limit: pagination.limit,
      offset: pagination.offset,
    });

    pagination.generateMeta(count, rows.length);
    return [rows.map((el) => AuditLogsDomain.create(el.toJSON())), pagination];
  }
  findById(_id: string): Promise<AuditLogsDomain> {
    throw new Error("Method not implemented.");
  }
  update(_id: string, _props: AuditLogsDomain): Promise<AuditLogsDomain> {
    throw new Error("Method not implemented.");
  }
  delete(_id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  store = async (props: AuditLogsDomain, option?: BaseQueryOption): Promise<AuditLogsDomain> => {
    const data = await AuditLogsPersistence.create(props, { transaction: option?.transaction });
    return AuditLogsDomain.create(data.toJSON());
  }
}
