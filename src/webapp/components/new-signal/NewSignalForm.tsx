import React, { useEffect, useState } from "react";
import { Backdrop, Button, CircularProgress, makeStyles } from "@material-ui/core";
// @ts-ignore
import { DataTable, TableHead, DataTableRow, DataTableColumnHeader, TableBody, DataTableCell } from "@dhis2/ui";
import { useStyles } from "../questionnaire/QuestionnaireForm";
import { useAppContext } from "../../contexts/app-context";
import { Question, Questionnaire } from "../../../domain/entities/Questionnaire";
import { PageHeader } from "../page-header/PageHeader";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { QuestionWidget } from "../questionnaire/QuestionInput";
import { useCurrentOrgUnitContext } from "../../contexts/current-orgUnit-context";
import { StyledLoaderContainer } from "../upload/ConsistencyChecks";
import { useCurrentUserGroupsAccess } from "../../hooks/useCurrentUserGroupsAccess";
import i18n from "@eyeseetea/d2-ui-components/locales";
import styled from "styled-components";
import { useCurrentModuleContext } from "../../contexts/current-module-context";

export const NewSignalForm: React.FC<{ hideForm: () => void }> = props => {
    const { compositionRoot } = useAppContext();
    const { currentModuleAccess } = useCurrentModuleContext();
    const [questionnaire, setQuestionnaire] = useState<Questionnaire>();
    const [loading, setLoading] = useState<boolean>(false);
    const { currentOrgUnitAccess } = useCurrentOrgUnitContext();
    const { readAccessGroup, confidentialAccessGroup } = useCurrentUserGroupsAccess();

    const classes = useStyles();
    const formClasses = useFormStyles();
    const snackbar = useSnackbar();

    useEffect(() => {
        setLoading(true);
        return compositionRoot.captureForm.getForm().run(
            questionnaireForm => {
                setQuestionnaire(questionnaireForm);
                setLoading(false);
            },
            err => {
                snackbar.error(err);
                setLoading(false);
            }
        );
    }, [compositionRoot, snackbar]);

    const saveQuestionnaire = () => {
        setLoading(true);

        if (questionnaire && readAccessGroup.kind === "loaded" && confidentialAccessGroup.kind === "loaded") {
            const readAccessGroups = readAccessGroup.data.map(aag => {
                return aag.id;
            });
            const confidentialAccessGroups = confidentialAccessGroup.data.map(cag => {
                return cag.id;
            });

            compositionRoot.captureForm
                .importData(
                    questionnaire,
                    {
                        id: currentOrgUnitAccess.orgUnitId,
                        name: currentOrgUnitAccess.orgUnitName,
                        path: currentOrgUnitAccess.orgUnitPath,
                    },
                    { id: currentModuleAccess.moduleId, name: currentModuleAccess.moduleName },
                    "Save",
                    readAccessGroups,
                    confidentialAccessGroups
                )
                .run(
                    () => {
                        snackbar.info("Submission Success!");
                        setLoading(false);
                        props.hideForm();
                    },
                    () => {
                        snackbar.error("Submission Failed!");
                        setLoading(false);
                        props.hideForm();
                    }
                );
        }
    };

    const publishQuestionnaire = () => {
        setLoading(true);

        if (questionnaire && readAccessGroup.kind === "loaded" && confidentialAccessGroup.kind === "loaded") {
            const readAccessGroups = readAccessGroup.data.map(aag => {
                return aag.id;
            });
            const confidentialAccessGroups = confidentialAccessGroup.data.map(cag => {
                return cag.id;
            });

            compositionRoot.captureForm
                .importData(
                    questionnaire,
                    {
                        id: currentOrgUnitAccess.orgUnitId,
                        name: currentOrgUnitAccess.orgUnitName,
                        path: currentOrgUnitAccess.orgUnitPath,
                    },
                    { id: currentModuleAccess.moduleId, name: currentModuleAccess.moduleName },
                    "Publish",
                    readAccessGroups,
                    confidentialAccessGroups
                )
                .run(
                    () => {
                        snackbar.info("Submission Success!");
                        setLoading(false);
                        props.hideForm();
                    },
                    () => {
                        snackbar.error("Submission Failed!");
                        setLoading(false);
                        props.hideForm();
                    }
                );
        }
    };

    const updateQuestion = (question: Question) => {
        setQuestionnaire(questionnaire => {
            const sectionToBeUpdated = questionnaire?.sections.filter(sec =>
                sec.questions.find(q => q.id === question?.id)
            );
            if (sectionToBeUpdated) {
                const questionToBeUpdated = sectionToBeUpdated[0]?.questions.filter(q => q.id === question.id);
                if (questionToBeUpdated && questionToBeUpdated[0]) questionToBeUpdated[0].value = question.value;
            }
            return questionnaire;
        });
    };

    return (
        <div>
            <Backdrop open={loading} style={{ color: "#fff", zIndex: 1 }}>
                <StyledLoaderContainer>
                    <CircularProgress color="inherit" size={50} />
                    {/* <Typography variant="h6">{i18n.t("Importing data and applying validation rules")}</Typography>
                    <Typography variant="h5">
                        {i18n.t("This might take several minutes, do not refresh the page or press back.")}
                    </Typography> */}
                </StyledLoaderContainer>
            </Backdrop>
            <PageHeader title={questionnaire?.name || ""} />

            {questionnaire?.sections.map(section => {
                if (!section.isVisible) return null;

                return (
                    <div key={section.title} className={classes.wrapper}>
                        <DataTable>
                            <TableHead>
                                <DataTableRow>
                                    <DataTableColumnHeader colSpan="2">
                                        <span className={classes.header}>{section.title}</span>
                                    </DataTableColumnHeader>
                                </DataTableRow>
                            </TableHead>

                            <TableBody>
                                {section.questions.map(question => (
                                    <DataTableRow key={question.id}>
                                        <DataTableCell width="60%">
                                            <span>{question.text}</span>
                                        </DataTableCell>

                                        <DataTableCell>
                                            <div className={formClasses.valueWrapper}>
                                                <div className={formClasses.valueInput}>
                                                    <QuestionWidget
                                                        onChange={updateQuestion}
                                                        question={question}
                                                        disabled={false}
                                                    />
                                                </div>
                                            </div>
                                        </DataTableCell>
                                    </DataTableRow>
                                ))}
                            </TableBody>
                        </DataTable>
                    </div>
                );
            })}

            <PageFooter>
                <Button style={{ marginRight: "10px" }} variant="outlined" color="primary" onClick={saveQuestionnaire}>
                    {i18n.t("Save Draft")}
                </Button>

                <Button variant="contained" color="primary" onClick={publishQuestionnaire}>
                    {i18n.t("Publish")}
                </Button>
            </PageFooter>
        </div>
    );
};

const useFormStyles = makeStyles({
    valueInput: { flexGrow: 1 },
    valueWrapper: { display: "flex" },
});
const PageFooter = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 20px;
`;
