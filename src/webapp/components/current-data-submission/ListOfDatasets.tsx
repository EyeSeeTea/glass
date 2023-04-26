import React from "react";
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
import { isEditModeStatus } from "../../utils/editModeStatus";
import { useGlassUploadsByModuleOUPeriod } from "../../hooks/useGlassUploadsByModuleOUPeriod";
import { useCurrentPeriodContext } from "../../contexts/current-period-context";
import { useGlassCaptureAccess } from "../../hooks/useGlassCaptureAccess";

function getCompletedUploads(upload: GlassUploadsState) {
    if (upload.kind === "loaded") {
        return upload.data.filter((row: UploadsDataItem) => row.status.toLowerCase() === "completed");
    }
}

function getNotCompletedUploads(upload: GlassUploadsState) {
    if (upload.kind === "loaded") {
        return upload.data.filter((row: UploadsDataItem) => row.status.toLowerCase() !== "completed");
    }
}

export const ListOfDatasets: React.FC = () => {
    const { currentPeriod } = useCurrentPeriodContext();

    const { currentModuleAccess } = useCurrentModuleContext();
    const { currentOrgUnitAccess } = useCurrentOrgUnitContext();
    const currentDataSubmissionStatus = useStatusDataSubmission(
        currentModuleAccess.moduleId,
        currentOrgUnitAccess.orgUnitId,
        currentPeriod
    );
    const { uploads, refreshUploads } = useGlassUploadsByModuleOUPeriod(currentPeriod.toString());
    const hasCurrentUserCaptureAccess = useGlassCaptureAccess();

    const completeUploads = getCompletedUploads(uploads);
    const incompleteUploads = getNotCompletedUploads(uploads);

    return (
        <ContentLoader content={uploads}>
            <ContentWrapper>
                <UploadsTable
                    title={i18n.t("Correct Uploads")}
                    items={completeUploads}
                    refreshUploads={refreshUploads}
                />
                {currentDataSubmissionStatus.kind === "loaded" ? (
                    <div className={completeUploads && completeUploads.length > 0 ? "rightAligned" : "centered"}>
                        <StyledEmptyMessage
                            style={{ display: completeUploads && completeUploads.length === 0 ? "block" : "none" }}
                        >
                            {i18n.t("No datasets uploaded to this submission.")}
                        </StyledEmptyMessage>
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
                        <StyledTypography
                            style={{ display: completeUploads && completeUploads.length > 0 ? "block" : "none" }}
                        >
                            {i18n.t("You can add up to 6 datasets to this submission with different BATCH IDS.")}
                        </StyledTypography>
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
