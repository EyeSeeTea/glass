import React, { Dispatch, SetStateAction } from "react";
import { Button, CircularProgress, DialogActions, DialogContent, Typography } from "@material-ui/core";
import styled from "styled-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { NavLink, useLocation } from "react-router-dom";
import { StatusCTAs } from "./StatusDetails";
import { useGlassCaptureAccess } from "../../../hooks/useGlassCaptureAccess";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../../contexts/app-context";
import { useCurrentDataSubmissionId } from "../../../hooks/useCurrentDataSubmissionId";
import { useCurrentOrgUnitContext } from "../../../contexts/current-orgUnit-context";
import { useCurrentModuleContext } from "../../../contexts/current-module-context";
import { DataSubmissionStatusTypes } from "../../../../domain/entities/GlassDataSubmission";

export interface CtaButtonsProps {
    ctas: StatusCTAs[];
    setRefetchStatus: Dispatch<SetStateAction<DataSubmissionStatusTypes | undefined>>;
}

export const CtaButtons: React.FC<CtaButtonsProps> = ({ ctas, setRefetchStatus }) => {
    const { compositionRoot } = useAppContext();
    const hasCurrentUserCaptureAccess = useGlassCaptureAccess();
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const { currentOrgUnitAccess } = useCurrentOrgUnitContext();
    const { currentModuleAccess } = useCurrentModuleContext();
    const location = useLocation();
    const queryParameters = new URLSearchParams(location.search);
    const periodFromUrl = parseInt(queryParameters.get("period") || "");
    const year = periodFromUrl || new Date().getFullYear() - 1;

    const dataSubmissionId = useCurrentDataSubmissionId(
        compositionRoot,
        currentModuleAccess.moduleId,
        currentOrgUnitAccess.orgUnitId,
        year
    );

    const showConfirmationDialog = () => {
        setOpen(true);
    };
    const hideConfirmationDialog = () => {
        setOpen(false);
    };
    const updateDataSubmissionStatus = () => {
        setIsLoading(true);
        compositionRoot.glassDataSubmission.setStatus(dataSubmissionId, "PENDING_APPROVAL").run(
            () => {
                //Triggerring relaod of status in parent
                setRefetchStatus("PENDING_APPROVAL");
                setIsLoading(false);
                setOpen(false);
            },
            () => {
                setIsLoading(false);
                setOpen(false);
            }
        );
    };

    const getCTAButton = (cta: StatusCTAs) => {
        // TODO : Button click event handlers to be added as corresponding feature developed.
        switch (cta) {
            case "Display full status history":
                return (
                    <StyledDisplayHistoryContainer key={0}>
                        <StyledDisplayHistoryButton color="primary">
                            {i18n.t("Display full status history >")}
                        </StyledDisplayHistoryButton>
                    </StyledDisplayHistoryContainer>
                );
            case "Go to questionnaire":
                return (
                    <Button variant="contained" color="primary" key={1}>
                        {i18n.t("Go to questionnaires")}
                    </Button>
                );
            case "Send to WHO for revision":
                return (
                    <Button variant="contained" color="primary" key={2} onClick={showConfirmationDialog}>
                        {i18n.t("Send to WHO for revision")}
                    </Button>
                );
            case "Upload dataset":
                return (
                    <Button
                        key={3}
                        variant="contained"
                        color="primary"
                        component={NavLink}
                        to={`/upload`}
                        exact={true}
                        disabled={!hasCurrentUserCaptureAccess}
                    >
                        {i18n.t("Upload dataset")}
                    </Button>
                );
        }
    };

    return (
        <ContentWrapper>
            <ConfirmationDialog
                isOpen={open}
                title={i18n.t("Confirm submission")}
                onSave={updateDataSubmissionStatus}
                onCancel={hideConfirmationDialog}
                saveText={i18n.t("Ok")}
                cancelText={i18n.t("Cancel")}
                fullWidth={true}
                disableEnforceFocus
            >
                <DialogContent>
                    <Typography>
                        Please review that the submission package contains all the datasets that you want to include.
                        After you submit this package, you won’t be able to edit it anymore wihout WHO permissions
                    </Typography>
                </DialogContent>
                <DialogActions>{isLoading && <CircularProgress size={25} />}</DialogActions>
            </ConfirmationDialog>
            <>
                {ctas.map(cta => {
                    return getCTAButton(cta);
                })}
            </>
        </ContentWrapper>
    );
};

const ContentWrapper = styled.div`
    display: flex;
    margin: 40px auto 0;
    justify-content: center;
    gap: 10%;
    > div {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
`;

const StyledDisplayHistoryButton = styled(Button)`
    text-transform: none;
    padding: 0;
`;

const StyledDisplayHistoryContainer = styled.div`
    width: 100%;
    align-items: baseline;
`;
