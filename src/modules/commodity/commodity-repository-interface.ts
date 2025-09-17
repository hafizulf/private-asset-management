import BaseRepository from "../common/interfaces/base-repository-interface";
import { CommodityDomain, ICommodity } from "./commodity-domain";

export interface ICommodityRepository 
  extends BaseRepository<CommodityDomain, ICommodity> {
    findAllActive(): Promise<CommodityDomain[]>;
  }