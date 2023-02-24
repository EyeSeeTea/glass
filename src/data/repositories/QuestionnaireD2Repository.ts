import i18n from "@eyeseetea/d2-ui-components/locales";
import { getId, Id } from "../../domain/entities/Base";
import { Future, FutureData } from "../../domain/entities/Future";
import { GlassModule } from "../../domain/entities/GlassModule";
import {
    Questionnaire,
    QuestionnaireQuestion,
    QuestionnaireSection,
    QuestionnaireSelector,
    QuestionnaireSimple,
} from "../../domain/entities/Questionnaire";
import { QuestionnaireRepository } from "../../domain/repositories/QuestionnaireRepository";
import { D2Api, DataValueSetsDataValue, DataValueSetsPostRequest } from "../../types/d2-api";
import { assertUnreachable } from "../../types/utils";
import { apiToFuture } from "../../utils/futures";
import { DataElement } from "../dhis2/DataElement";
import { DataFormD2Source } from "../dhis2/DataFormD2Source";

export class QuestionnaireD2Repository implements QuestionnaireRepository {
    constructor(private api: D2Api) {}

    getMany(module: GlassModule, options: { orgUnitId: Id; year: number }): FutureData<QuestionnaireSimple[]> {
        const dataSetIds = module.questionnaires.map(getId);
        const configByDataSetId = _.keyBy(module.questionnaires, getId);

        const dataSets$ = apiToFuture(
            this.api.metadata.get({
                dataSets: {
                    fields: { id: true, displayName: true, displayDescription: true },
                    filter: { id: { in: dataSetIds } },
                },
            })
        ).map(res => res.dataSets);

        const data = {
            dataSets: dataSets$,
            dataSetsInfo: this.getDataSetsInfo(dataSetIds, options),
        };

        return Future.joinObj(data).map(({ dataSets, dataSetsInfo }) => {
            return dataSets.map((dataSet): QuestionnaireSimple => {
                const dataSetInfo = dataSetsInfo.find(info => info.dataSet === dataSet.id);

                return {
                    id: dataSet.id,
                    name: dataSet.displayName,
                    orgUnit: { id: options.orgUnitId },
                    year: options.year,
                    description: dataSet.displayDescription,
                    isCompleted: dataSetInfo?.completed || false,
                    isMandatory: configByDataSetId[dataSet.id]?.mandatory || false,
                };
            });
        });
    }

    get(module: GlassModule, selector: QuestionnaireSelector): FutureData<Questionnaire> {
        const dataFormRepository = new DataFormD2Source(this.api);
        const config = module.questionnaires.find(q => q.id === selector.id);
        const dataForm$ = dataFormRepository.get({ id: selector.id });

        const dataValues$ = apiToFuture(
            this.api.dataValues.getSet({
                dataSet: [selector.id],
                orgUnit: [selector.orgUnitId],
                period: [selector.year.toString()],
            })
        ).map(res => res.dataValues);

        const data = {
            dataForm: dataForm$,
            dataValues: dataValues$,
            dataSetInfo: this.getDataSetsInfo([selector.id], selector).map(_.first),
        };

        return Future.joinObj(data).map(({ dataForm, dataValues, dataSetInfo }): Questionnaire => {
            const dataValuesByDataElementId = _.groupBy(dataValues, dv => dv.dataElement);

            const sections = dataForm.sections.map((section): QuestionnaireSection => {
                const questions = section.dataElements.map(dataElement => {
                    const dataValues = dataValuesByDataElementId[dataElement.id] || [];
                    return this.getQuestion(dataElement, dataValues);
                });

                return { title: section.name, questions: _.compact(questions) };
            });

            return {
                id: selector.id,
                name: dataForm.name,
                description: dataForm.description,
                orgUnit: { id: selector.orgUnitId },
                year: selector.year,
                sections: sections,
                isCompleted: dataSetInfo?.completed || false,
                isMandatory: config?.mandatory || false,
            };
        });
    }

    setCompletion(selector: QuestionnaireSelector, value: boolean): FutureData<void> {
        return apiToFuture(
            this.api.post<{ status: "SUCCESS" | "WARNING" | "ERROR" }>(
                "/completeDataSetRegistrations",
                {},
                {
                    completeDataSetRegistrations: [
                        {
                            dataSet: selector.id,
                            period: selector.year.toString(),
                            organisationUnit: selector.orgUnitId,
                            completed: value,
                        },
                    ],
                }
            )
        ).flatMap(res =>
            res.status === "SUCCESS"
                ? Future.success(undefined)
                : Future.error(i18n.t("Error saving registration status"))
        );
    }

    saveResponse(questionnaire: QuestionnaireSelector, question: QuestionnaireQuestion): FutureData<void> {
        const dataValues = this.getDataValuesForQuestion(questionnaire, question);
        return this.postDataValues(dataValues);
    }

    private getQuestion(dataElement: DataElement, dataValues: DataValueSetsDataValue[]): QuestionnaireQuestion | null {
        const dataValue = _.first(dataValues);

        const selectedCocId = _(dataValues)
            .map(dv => (dv.value === "true" ? dv.categoryOptionCombo : null))
            .compact()
            .first();

        const isDefault = dataElement.disaggregation.length && dataElement.disaggregation[0]?.name === "default";

        switch (dataElement.type) {
            case "BOOLEAN": {
                if (!isDefault) {
                    const value = dataElement.disaggregation.find(dis => dis.id === selectedCocId);

                    return {
                        id: dataElement.id,
                        text: dataElement.name,
                        type: "select",
                        value: value,
                        options: dataElement.disaggregation,
                    };
                } else {
                    return {
                        id: dataElement.id,
                        text: dataElement.name,
                        type: "boolean",
                        value: Boolean(selectedCocId),
                    };
                }
            }
            case "NUMBER":
                return {
                    id: dataElement.id,
                    text: dataElement.name,
                    type: "number",
                    value: dataValue?.value || "",
                };

            case "TEXT":
                return {
                    id: dataElement.id,
                    text: dataElement.name,
                    multiline: dataElement.multiline,
                    type: "text",
                    value: dataValue?.value || "",
                };

            default:
                console.error("Unsupported data element", dataElement);
                return null;
        }
    }

    private getDataValuesForQuestion(
        questionnaire: QuestionnaireSelector,
        question: QuestionnaireQuestion
    ): D2DataValue[] {
        const { type } = question;
        const { orgUnitId, year } = questionnaire;

        const base = {
            orgUnit: orgUnitId,
            dataElement: question.id,
            period: year.toString(),
        };

        switch (type) {
            case "select":
                return question.options.map((option): D2DataValue => {
                    const isSelected = question.value?.id === option.id;
                    return {
                        ...base,
                        value: isSelected ? "true" : "",
                        deleted: !isSelected,
                        categoryOptionCombo: option.id,
                    };
                });
            case "boolean":
                return [
                    {
                        ...base,
                        value: question.value ? "true" : "",
                        deleted: !question.value,
                    },
                ];
            case "number":
            case "text":
                return [
                    {
                        ...base,
                        value: question.value,
                        deleted: !question.value,
                    },
                ];

            default:
                assertUnreachable(type);
        }
    }

    private postDataValues(d2DataValues: D2DataValue[]): FutureData<void> {
        return apiToFuture(this.api.dataValues.postSet({}, { dataValues: d2DataValues })).flatMap(res =>
            res.status === "SUCCESS" ? Future.success(undefined) : Future.error(res.description)
        );
    }

    private getDataSetsInfo(
        ids: Id[],
        options: { orgUnitId: Id; year: number }
    ): FutureData<CompleteDataSetRegistration[]> {
        return apiToFuture(
            this.api.get<CompleteDataSetRegistrationsResponse>("/completeDataSetRegistrations", {
                dataSet: ids,
                orgUnit: options.orgUnitId,
                period: options.year.toString(),
            })
        ).map(res => res.completeDataSetRegistrations);
    }
}

type D2ApiDataValue = DataValueSetsPostRequest["dataValues"][number];

interface D2DataValue extends D2ApiDataValue {
    deleted?: boolean;
}

interface CompleteDataSetRegistration {
    period: string;
    dataSet: Id;
    organisationUnit: Id;
    attributeOptionCombo: Id;
    date: string;
    storedBy: string;
    completed: boolean;
}

interface CompleteDataSetRegistrationsResponse {
    completeDataSetRegistrations: CompleteDataSetRegistration[];
}
