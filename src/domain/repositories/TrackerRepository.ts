import { TrackerPostRequest, TrackerPostResponse } from "../../data/repositories/TrackerDefaultRepository";
import { FutureData } from "../entities/Future";
import { ImportStrategy } from "../entities/data-entry/DataValuesSaveSummary";

export interface TrackerRepository {
    import(req: TrackerPostRequest, action: ImportStrategy): FutureData<TrackerPostResponse>;
    getAMRIProgramMetadata(AMRIProgramID: string, AMRDataProgramStageId: string): FutureData<any>;
}
