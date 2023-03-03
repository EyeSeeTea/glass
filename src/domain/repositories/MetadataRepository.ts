import { FutureData } from "../entities/Future";
import { CategoryCombo } from "../entities/metadata/CategoryCombo";
import { DataSet } from "../entities/metadata/DataSet";
import { CodedRef } from "../entities/Ref";

export interface MetadataRepository {
    getOrgUnitsByCode(orgUnitCodes: string[]): FutureData<CodedRef[]>;
    getDataSet(id: string): FutureData<DataSet>;
    getCategoryCombination(id: string): FutureData<CategoryCombo>;
}
