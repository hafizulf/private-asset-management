import { injectable } from "inversify";
import { TStandardPaginateOption } from "../common/dto/pagination-dto";
import { Pagination } from "../common/pagination";
import { ICommodityRepository } from "./commodity-repository-interface";
import { CommodityDomain, ICommodity } from "./commodity-domain";
import { Commodity as CommodityPersistence } from "@/modules/common/sequelize";
import { AppError, HttpCode } from "@/exceptions/app-error";
import { CommodityErrMessage } from "@/exceptions/error-message-constants";
import { Op } from "sequelize";

@injectable()
export class CommodityRepository implements ICommodityRepository {
  findAll = async (): Promise<CommodityDomain[]> => {
    const data = await CommodityPersistence.findAll();
    return data.map((el) => CommodityDomain.create(el.toJSON()));
  }

  findAllWithPagination = async (
    paginateOption: TStandardPaginateOption, 
    pagination: Pagination
  ): Promise<[CommodityDomain[], Pagination]> => {
    const search = paginateOption.search;
    const orderBy = paginateOption.orderBy ? paginateOption.orderBy : "name";
    const sort = paginateOption.sort ? paginateOption.sort : "DESC";
    const { rows, count } = await CommodityPersistence.findAndCountAll({
      where: {
        ...(search && {
          [Op.or]: [
            {
              name: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        }),
      },
      order: [[orderBy, sort]],
      limit: pagination.limit,
      offset: pagination.offset,
    });

    pagination.generateMeta(count, rows.length);
    return [rows.map((el) => CommodityDomain.create(el.toJSON())), pagination];
  }

  findAllActive = async (): Promise<CommodityDomain[]> => {
    const data = await CommodityPersistence.findAll({
      where: {
        isActive: true
      }
    });
    return data.map((el) => CommodityDomain.create(el.toJSON()));
  }

  store = async (props: ICommodity): Promise<CommodityDomain> => {
    const isExist = await CommodityPersistence.findOne({
      where: {
        name: props.name,
      }
    })

    if(isExist) {
      throw new AppError({
        statusCode: HttpCode.CONFLICT,
        description: CommodityErrMessage.ALREADY_EXISTS,
      })
    }

    const createdCommodity = await CommodityPersistence.create(props);
    return CommodityDomain.create(createdCommodity.toJSON());
  }

  findById = async (id: string): Promise<CommodityDomain> => {
    const data = await CommodityPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: CommodityErrMessage.NOT_FOUND,
      })
    }
    return CommodityDomain.create(data.toJSON());
  }

  update = async (id: string, props: ICommodity): Promise<CommodityDomain> => {
    const data = await CommodityPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: CommodityErrMessage.NOT_FOUND,
      })
    }
    const updatedCommodity = await data.update(props);
    return CommodityDomain.create(updatedCommodity.toJSON());
  }

  delete = async (id: string): Promise<boolean> => {
    const data = await CommodityPersistence.findByPk(id);
    if(!data) {
      throw new AppError({
        statusCode: HttpCode.NOT_FOUND,
        description: CommodityErrMessage.NOT_FOUND,
      })
    }

    await data.destroy();
    return true;
  }
}