import { BaseQueryOption } from "../dto/common-dto";
import { TStandardPaginateOption } from "../dto/pagination-dto";
import { Pagination } from "../pagination";

export default interface BaseRepository<T, I> {
  findAll(): Promise<T[]>;
  findAllWithPagination(
    paginateOption: TStandardPaginateOption,
    pagination: Pagination
  ): Promise<[T[], Pagination]>;
  store(props: I, option?: BaseQueryOption): Promise<T>;
  findById(id: string): Promise<T>;
  update(id: string, props: I): Promise<T>;
  delete(id: string): Promise<boolean>;
}
