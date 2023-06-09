import { Future, FutureData } from "../../domain/entities/Future";
import { SystemInfoRepository } from "../../domain/repositories/SystemInfoRepository";
import { D2Api } from "@eyeseetea/d2-api/2.34";
import { apiToFuture } from "../../utils/futures";

export class SystemInfoDefaultRepository implements SystemInfoRepository {
    constructor(private api: D2Api) {}

    getLastAnalyticsRunTime(): FutureData<Date> {
        return apiToFuture(
            this.api.request<{ lastAnalyticsTableSuccess: Date; lastAnalyticsTablePartitionSuccess: Date }>({
                url: `/system/info?fields=lastAnalyticsTablePartitionSuccess,lastAnalyticsTableSuccess`,
                method: "get",
            })
        ).flatMap(response => {
            //If continious analytics is turned on, return it.
            if (new Date(response.lastAnalyticsTablePartitionSuccess) > new Date(response.lastAnalyticsTableSuccess)) {
                return Future.success(response.lastAnalyticsTablePartitionSuccess);
            }
            //Else, return the lastAnalyticsTableSuccess time
            else {
                return Future.success(response.lastAnalyticsTableSuccess);
            }
        });
    }
}
