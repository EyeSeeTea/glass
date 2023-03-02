import { UseCase } from "../../../CompositionRoot";
import { Future, FutureData } from "../../entities/Future";
import { DataValuesSaveSummary } from "../../entities/data-entry/DataValuesSaveSummary";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { DataValuesRepository } from "../../repositories/data-entry/DataValuesRepository";
import { AMR_SPECIMEN_GENDER_AGE_ORIGIN_CC_ID, getCategoryOptionComboByDataElement } from "./utils/utils";
import { SampleData } from "../../entities/data-entry/external/SampleData";
import { SampleDataRepository } from "../../repositories/SampleDataRepository";

const AMR_AMR_DS_Input_files_Sample_DS_ID = "OcAB7oaC072";

export class ImportSampleFileUseCase implements UseCase {
    constructor(
        private sampleDataRepository: SampleDataRepository,
        private metadataRepository: MetadataRepository,
        private dataValuesRepository: DataValuesRepository
    ) {}

    public execute(inputFile: File): FutureData<DataValuesSaveSummary> {
        return this.sampleDataRepository
            .get(inputFile)
            .flatMap(risDataItems => {
                return Future.joinObj({
                    risDataItems: Future.success(risDataItems),
                    dataSet: this.metadataRepository.getDataSet(AMR_AMR_DS_Input_files_Sample_DS_ID),
                    dataElement_CC: this.metadataRepository.getCategoryCombination(
                        AMR_SPECIMEN_GENDER_AGE_ORIGIN_CC_ID
                    ),
                    orgUnits: this.metadataRepository.getOrgUnitsByCode([
                        ...new Set(risDataItems.map(item => item.COUNTRY)),
                    ]),
                });
            })
            .flatMap(({ risDataItems, dataSet, dataElement_CC, orgUnits }) => {
                const dataValues = risDataItems
                    .map(risData => {
                        return dataSet.dataElements.map(dataElement => {
                            const categoryOptionCombo = getCategoryOptionComboByDataElement(
                                dataElement,
                                dataElement_CC,
                                risData
                            );
                            const value = risData[dataElement.code as keyof SampleData]?.toString() || "";

                            const dataValue = {
                                orgUnit: orgUnits.find(ou => ou.code === risData.COUNTRY)?.id || "",
                                period: risData.YEAR.toString(),

                                dataElement: dataElement.id,
                                categoryOptionCombo: categoryOptionCombo,
                                value,
                            };

                            return dataValue;
                        });
                    })
                    .flat();

                /* eslint-disable no-console */
                console.log({ sampleFileDataValues: dataValues });

                return this.dataValuesRepository.save(dataValues);
            });
    }
}
