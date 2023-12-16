import React, { useEffect, Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { UploadsTable } from "./UploadsTable";
import { GlassUploadsState } from "../../hooks/useGlassUploads";
import { ContentLoader } from "../content-loader/ContentLoader";
import { UploadsDataItem } from "../../entities/uploads";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { Button, CircularProgress, Typography } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import { useStatusDataSubmission } from "../../hooks/useStatusDataSubmission";
import { useCurrentModuleContext } from "../../contexts/current-module-context";
import { useCurrentOrgUnitContext } from "../../contexts/current-orgUnit-context";
import { isEditModeStatus } from "../../../utils/editModeStatus";
import { useGlassUploadsByModuleOUPeriod } from "../../hooks/useGlassUploadsByModuleOUPeriod";
import { useCurrentPeriodContext } from "../../contexts/current-period-context";
import { useGlassCaptureAccess } from "../../hooks/useGlassCaptureAccess";
import { moduleProperties } from "../../../domain/utils/ModuleProperties";
import { useAppContext } from "../../contexts/app-context";
import { useCurrentDataSubmissionId } from "../../hooks/useCurrentDataSubmissionId";
import { useCurrentUserGroupsAccess } from "../../hooks/useCurrentUserGroupsAccess";
import { DataSubmissionStatusTypes } from "../../../domain/entities/GlassDataSubmission";
import { useQuestionnaires } from "./Questionnaires";

export const getCompletedUploads = (upload: GlassUploadsState) => {
    if (upload.kind === "loaded") {
        return upload.data.filter((row: UploadsDataItem) => row.status.toLowerCase() === "completed");
    }
};

function getNotCompletedUploads(upload: GlassUploadsState) {
    if (upload.kind === "loaded") {
        return upload.data.filter((row: UploadsDataItem) => row.status.toLowerCase() !== "completed");
    }
}

interface ListOfDatasetsProps {
    setRefetchStatus: Dispatch<SetStateAction<DataSubmissionStatusTypes | undefined>>;
}

export const ListOfDatasets: React.FC<ListOfDatasetsProps> = ({ setRefetchStatus }) => {
    const { compositionRoot } = useAppContext();
    const { currentPeriod } = useCurrentPeriodContext();
    const {
        currentModuleAccess: { moduleId, moduleName },
    } = useCurrentModuleContext();
    const { currentOrgUnitAccess } = useCurrentOrgUnitContext();
    const currentDataSubmissionStatus = useStatusDataSubmission(
        { id: moduleId, name: moduleName },
        currentOrgUnitAccess.orgUnitId,
        currentPeriod
    );
    const [questionnaires] = useQuestionnaires();
    const { uploads, refreshUploads } = useGlassUploadsByModuleOUPeriod(currentPeriod.toString());
    const hasCurrentUserCaptureAccess = useGlassCaptureAccess();

    const completeUploads = getCompletedUploads(uploads);
    const incompleteUploads = getNotCompletedUploads(uploads);

    const dataSubmissionId = useCurrentDataSubmissionId(
        moduleId,
        moduleName,
        currentOrgUnitAccess.orgUnitId,
        currentPeriod
    );
    const { captureAccessGroup } = useCurrentUserGroupsAccess();
    useEffect(() => {
        if (
            completeUploads?.length === 0 &&
            (moduleProperties.get(moduleName)?.completeStatusChange === "DATASET" ||
                moduleProperties.get(moduleName)?.completeStatusChange === "QUESTIONNAIRE_AND_DATASET")
        ) {
            compositionRoot.glassDataSubmission.setStatus(dataSubmissionId, "NOT_COMPLETED").run(
                () => {
                    //Triggerring relaod of status in parent
                    setRefetchStatus("NOT_COMPLETED");
                },
                () => {}
            );
        }
    }, [
        completeUploads,
        captureAccessGroup,
        compositionRoot.notifications,
        compositionRoot.glassDataSubmission,
        moduleName,
        currentOrgUnitAccess,
        currentPeriod,
        dataSubmissionId,
        setRefetchStatus,
        questionnaires,
    ]);

    return (
        <ContentLoader content={uploads}>
            <ContentWrapper>
                {completeUploads && completeUploads.length > 0 && (
                    <UploadsTable
                        title={i18n.t("Correct Uploads")}
                        items={completeUploads}
                        refreshUploads={refreshUploads}
                    />
                )}
                {currentDataSubmissionStatus.kind === "loaded" ? (
                    <div className={completeUploads && completeUploads.length > 0 ? "rightAligned" : "centered"}>
                        <StyledEmptyMessage
                            style={{
                                display:
                                    completeUploads &&
                                    completeUploads.length === 0 &&
                                    incompleteUploads &&
                                    incompleteUploads.length === 0
                                        ? "block"
                                        : "none",
                            }}
                        >
                            {i18n.t("No datasets uploaded to this submission.")}
                        </StyledEmptyMessage>
                        {moduleProperties.get(moduleName)?.isSingleFileTypePerSubmission &&
                        completeUploads &&
                        completeUploads.length > 0 ? (
                            <Typography>
                                {i18n.t(`You can upload only one successful file for ${moduleName}.`)}
                            </Typography>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                component={NavLink}
                                to={`/upload`}
                                exact={true}
                                disabled={
                                    !(
                                        hasCurrentUserCaptureAccess &&
                                        currentDataSubmissionStatus.kind === "loaded" &&
                                        isEditModeStatus(currentDataSubmissionStatus.data.title)
                                    )
                                }
                            >
                                {i18n.t("Add New Datasets")}
                            </Button>
                        )}
                        {moduleProperties.get(moduleName)?.isbatchReq && (
                            <StyledTypography>
                                {i18n.t("You can add up to 6 datasets to this submission with different BATCH IDS.")}
                            </StyledTypography>
                        )}
                    </div>
                ) : (
                    <div>
                        <CircularProgress size={20} />
                    </div>
                )}
                {incompleteUploads && incompleteUploads.length > 0 && (
                    <UploadsTable
                        title={i18n.t("Uploads with errors, or discarded")}
                        items={incompleteUploads}
                        refreshUploads={refreshUploads}
                    />
                )}
            </ContentWrapper>
        </ContentLoader>
    );
};

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 40px;
    overflow-x: auto;

    .centered {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .rightAligned {
        display: flex;
        flex-direction: column;
        align-items: baseline;
    }
`;
const StyledTypography = styled(Typography)`
    width: 217px;
    height: 40px;
    font-family: "Roboto";
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 166%;
    letter-spacing: 0.4px;
    color: rgba(0, 0, 0, 0.6);
`;
const StyledEmptyMessage = styled(Typography)`
    width: 297px;
    height: 24px;
    left: 310px;
    top: 122px;
    font-family: "Roboto";
    font-style: normal;
    font-weight: 300;
    font-size: 16px;
    line-height: 150%;
    letter-spacing: 0.15px;
    color: #000000;
    padding: 20px;
`;
