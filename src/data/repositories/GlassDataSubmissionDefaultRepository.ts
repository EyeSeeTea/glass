import { Future, FutureData } from "../../domain/entities/Future";
import { DataSubmissionStatusTypes, GlassDataSubmission } from "../../domain/entities/GlassDataSubmission";
import { GlassModule } from "../../domain/entities/GlassModule";
import { GlassDataSubmissionsRepository } from "../../domain/repositories/GlassDataSubmissionRepository";
import { DataStoreClient } from "../data-store/DataStoreClient";
import { DataStoreKeys } from "../data-store/DataStoreKeys";

const DISALLOWED_OPEN_DATA_SUBMISSIONS_MODULES = ["EGASP"];

export class GlassDataSubmissionsDefaultRepository implements GlassDataSubmissionsRepository {
    constructor(private dataStoreClient: DataStoreClient) {}

    getSpecificDataSubmission(module: string, orgUnit: string, period: string): FutureData<GlassDataSubmission[]> {
        return this.dataStoreClient.getObjectsFilteredByProps<GlassDataSubmission>(
            DataStoreKeys.DATA_SUBMISSIONS,
            new Map<keyof GlassDataSubmission, unknown>([
                ["module", module],
                ["orgUnit", orgUnit],
                ["period", period],
            ])
        );
    }

    getDataSubmissionsByModuleAndOU(module: string, orgUnit: string): FutureData<GlassDataSubmission[]> {
        return this.dataStoreClient.getObjectsFilteredByProps<GlassDataSubmission>(
            DataStoreKeys.DATA_SUBMISSIONS,
            new Map<keyof GlassDataSubmission, unknown>([
                ["module", module],
                ["orgUnit", orgUnit],
            ])
        );
    }

    getOpenDataSubmissionsByOU(orgUnit: string, period: string): FutureData<GlassDataSubmission[]> {
        return Future.joinObj({
            dataSubmissions: this.dataStoreClient.getObjectsFilteredByProps<GlassDataSubmission>(
                DataStoreKeys.DATA_SUBMISSIONS,
                new Map<keyof GlassDataSubmission, unknown>([
                    ["period", period],
                    ["orgUnit", orgUnit],
                ])
            ),
            modules: this.dataStoreClient.listCollection<GlassModule>(DataStoreKeys.MODULES),
        }).flatMap(({ dataSubmissions, modules }) => {
            const disallowedModulesIds = modules
                .filter(module => DISALLOWED_OPEN_DATA_SUBMISSIONS_MODULES.includes(module.name))
                .map(module => module.id);
            const filteredDataSubmissions = dataSubmissions.filter(
                ({ module }) => !disallowedModulesIds.includes(module)
            );

            return Future.success(filteredDataSubmissions);
        });
    }

    save(dataSubmission: GlassDataSubmission): FutureData<void> {
        return this.dataStoreClient.listCollection(DataStoreKeys.DATA_SUBMISSIONS).flatMap(dataSubmissions => {
            const newDataSubmissions = [...dataSubmissions, dataSubmission];
            return this.dataStoreClient.saveObject(DataStoreKeys.DATA_SUBMISSIONS, newDataSubmissions);
        });
    }

    saveMultiple(dataSubmissions: GlassDataSubmission[]): FutureData<void> {
        return this.dataStoreClient.listCollection(DataStoreKeys.DATA_SUBMISSIONS).flatMap(existingDataSubmissions => {
            //Adding an extra check, to ensure duplicate data submissions are never created.
            //Every data submission should have a unique combination of module, orgUnit and period.
            const newDataSubmissions = dataSubmissions
                .map(ds => {
                    const typedSubmissions = existingDataSubmissions as GlassDataSubmission[];
                    const alreadyExists = typedSubmissions.find(
                        d => d.module === ds.module && d.orgUnit === ds.orgUnit && d.period === ds.period
                    );
                    if (alreadyExists) return null;
                    else return ds;
                })
                .filter(n => n);

            return this.dataStoreClient.saveObject(DataStoreKeys.DATA_SUBMISSIONS, [
                ...existingDataSubmissions,
                ...newDataSubmissions,
            ]);
        });
    }

    setStatus(id: string, status: DataSubmissionStatusTypes): FutureData<void> {
        return this.dataStoreClient
            .listCollection<GlassDataSubmission>(DataStoreKeys.DATA_SUBMISSIONS)
            .flatMap(dataSubmissions => {
                const dataSubmission = dataSubmissions?.find(ds => ds.id === id);
                if (dataSubmission) {
                    dataSubmission.statusHistory.push({
                        from: dataSubmission.status,
                        to: status,
                        changedAt: new Date().toISOString(),
                    });
                    dataSubmission.status = status;
                    return this.dataStoreClient.saveObject(DataStoreKeys.DATA_SUBMISSIONS, dataSubmissions);
                } else {
                    return Future.error("Data Submission does not exist");
                }
            });
    }
}
