import TYPES from "@/types";
import { inject, injectable } from "inversify";
import { IAnnouncementRepository } from "./announcement-repository-interface";
import { IAnnouncement } from "./announcement-domain";
import { DateRange } from "../common/dto/date-range.dto";

@injectable()
export class AnnouncementService {
  constructor(
    @inject(TYPES.IAnnouncementRepository) private _repository: IAnnouncementRepository,
  ) {}

  public async store(props: IAnnouncement): Promise<IAnnouncement> {
    const storedData = (await this._repository.store(props)).unmarshal();

    // broadcast announcement event
    // this._socketIO.broadcastMessage(`${ANNOUNCEMENT_NSP}`, "latest_announcements", JSON.stringify(storedData));

    return storedData;
  }

  public async findAll(dateRange?: DateRange): Promise<IAnnouncement[]> {
    const data = await this._repository.findAll(dateRange);
    return data.map((el) => el.unmarshal());
  }

  public async findById(id: string): Promise<IAnnouncement> {
    return (await this._repository.findById(id)).unmarshal();
  }
}
