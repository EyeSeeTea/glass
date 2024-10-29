import { Future, FutureData } from "../../../entities/Future";
import { ImportSummary } from "../../../entities/data-entry/ImportSummary";
import { MetadataRepository } from "../../../repositories/MetadataRepository";
import { DataValuesRepository } from "../../../repositories/data-entry/DataValuesRepository";
import {
    AMR_SPECIMEN_GENDER_AGE_ORIGIN_CC_ID,
    getCategoryOptionComboByDataElement,
    getCategoryOptionComboByOptionCodes,
} from "../utils/getCategoryOptionCombo";
import { includeBlockingErrors } from "../utils/includeBlockingErrors";
import { mapDataValuesToImportSummary } from "../utils/mapDhis2Summary";
import { SampleDataRepository } from "../../../repositories/data-entry/SampleDataRepository";
import { SampleData } from "../../../entities/data-entry/amr-external/SampleData";
import { UseCase } from "../../../../CompositionRoot";
import { AMR_AMR_DS_Input_files_Sample_DS_ID, AMR_BATCHID_CC_ID } from "./ImportSampleFile";

// NOTICE: code adapted for node environment from ImportSampleFile.ts (only DELETE)
export class DeleteSampleDatasetUseCase implements UseCase {
    constructor(
        private options: {
            sampleDataRepository: SampleDataRepository;
            metadataRepository: MetadataRepository;
            dataValuesRepository: DataValuesRepository;
        }
    ) {}

    public execute(arrayBuffer: ArrayBuffer): FutureData<ImportSummary> {
        return this.options.sampleDataRepository
            .getFromArayBuffer(arrayBuffer)
            .flatMap(risDataItems => {
                return Future.joinObj({
                    risDataItems: Future.success(risDataItems),
                    dataSet: this.options.metadataRepository.getDataSet(AMR_AMR_DS_Input_files_Sample_DS_ID),
                    dataSet_CC: this.options.metadataRepository.getCategoryCombination(AMR_BATCHID_CC_ID),
                    dataElement_CC: this.options.metadataRepository.getCategoryCombination(
                        AMR_SPECIMEN_GENDER_AGE_ORIGIN_CC_ID
                    ),
                    orgUnits: this.options.metadataRepository.getOrgUnitsByCode([
                        ...new Set(risDataItems.map(item => item.COUNTRY)),
                    ]),
                });
            })
            .flatMap(({ risDataItems, dataSet, dataSet_CC, dataElement_CC, orgUnits }) => {
                const blockingCategoryOptionErrors: { error: string; line: number }[] = [];

                const dataValues = risDataItems
                    .map((risData, index) => {
                        return dataSet.dataElements.map(dataElement => {
                            const dataSetCategoryOptionValues = dataSet_CC.categories.map(category =>
                                risData[category.code as keyof SampleData].toString()
                            );

                            const { categoryOptionComboId: attributeOptionCombo, error: aocBlockingError } =
                                getCategoryOptionComboByOptionCodes(dataSet_CC, dataSetCategoryOptionValues);

                            if (aocBlockingError !== "")
                                blockingCategoryOptionErrors.push({ error: aocBlockingError, line: index + 1 });

                            const { categoryOptionComboId: categoryOptionCombo, error: ccoBlockingError } =
                                getCategoryOptionComboByDataElement(dataElement, dataElement_CC, risData);

                            if (ccoBlockingError !== "")
                                blockingCategoryOptionErrors.push({ error: ccoBlockingError, line: index + 1 });

                            const value = risData[dataElement.code as keyof SampleData]?.toString() || "";

                            const dataValue = {
                                orgUnit: orgUnits.find(ou => ou.code === risData.COUNTRY)?.id || "",
                                period: risData.YEAR.toString(),
                                attributeOptionCombo,
                                dataElement: dataElement.id,
                                categoryOptionCombo: categoryOptionCombo,
                                value,
                            };

                            return dataValue;
                        });
                    })
                    .flat();

                return this.options.dataValuesRepository.save(dataValues, "DELETE", false).map(saveSummary => {
                    const importSummary = mapDataValuesToImportSummary(saveSummary, "DELETE");

                    const summaryWithConsistencyBlokingErrors = includeBlockingErrors(importSummary, []);

                    return summaryWithConsistencyBlokingErrors;
                });
            });
    }
}
