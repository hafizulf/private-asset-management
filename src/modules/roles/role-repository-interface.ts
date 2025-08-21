import BaseRepository from "../common/interfaces/base-repository-interface";
import { IRole, Role } from "./role-domain";
import { TPropsCreateRole } from "./role-dto";

export interface IRoleRepository extends Omit<BaseRepository<Role, IRole>, "store"> {
  store(props: TPropsCreateRole): Promise<Role>;
}
