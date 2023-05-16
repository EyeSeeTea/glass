import React, { useCallback, useState } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import styled from "styled-components";
import { glassColors } from "../../pages/app/themes/dhis2.theme";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { ImportSummary } from "../../../domain/entities/data-entry/ImportSummary";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import { moduleProperties } from "../../../domain/utils/ModuleProperties";
import { useCurrentModuleContext } from "../../contexts/current-module-context";

interface ReviewDataSummaryProps {
    changeStep: (step: number) => void;
    primaryFileImportSummary: ImportSummary | undefined;
    secondaryFileImportSummary?: ImportSummary | undefined;
}

const COMPLETED_STATUS = "COMPLETED";

export const ReviewDataSummary: React.FC<ReviewDataSummaryProps> = ({
    changeStep,
    primaryFileImportSummary,
    secondaryFileImportSummary,
}) => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const { currentModuleAccess } = useCurrentModuleContext();

    const [fileType, setFileType] = useState<string>("primary");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const changeType = (fileType: string) => {
        setFileType(fileType);
    };

    const goToFinalStep = useCallback(() => {
        const primaryUploadId = localStorage.getItem("primaryUploadId");
        const secondaryUploadId = localStorage.getItem("secondaryUploadId");
        setIsLoading(true);
        if (primaryUploadId) {
            return compositionRoot.glassUploads.setStatus({ id: primaryUploadId, status: COMPLETED_STATUS }).run(
                () => {
                    if (!secondaryUploadId) {
                        changeStep(4);
                        setIsLoading(false);
                    } else {
                        return compositionRoot.glassUploads
                            .setStatus({ id: secondaryUploadId, status: COMPLETED_STATUS })
                            .run(
                                () => {
                                    changeStep(4);
                                    setIsLoading(false);
                                },
                                errorMessage => {
                                    snackbar.error(i18n.t(errorMessage));
                                    setIsLoading(false);
                                }
                            );
                    }
                },
                errorMessage => {
                    snackbar.error(i18n.t(errorMessage));
                    setIsLoading(false);
                }
            );
        }
    }, [changeStep, compositionRoot.glassUploads, snackbar]);

    const goToFinalStepEffect = useCallbackEffect(goToFinalStep);

    return (
        <ContentWrapper>
            {moduleProperties.get(currentModuleAccess.moduleName)?.isSecondaryFileApplicable && (
                <div className="toggles">
                    <Button onClick={() => changeType("primary")} className={fileType === "primary" ? "current" : ""}>
                        {i18n.t(`${moduleProperties.get(currentModuleAccess.moduleName)?.primaryFileType} File`)}
                    </Button>
                    <Button
                        onClick={() => changeType("secondary")}
                        className={fileType === "secondary" ? "current" : ""}
                    >
                        {i18n.t(`${moduleProperties.get(currentModuleAccess.moduleName)?.secondaryFileType} File`)}
                    </Button>
                </div>
            )}
            <Section className="summary">
                <h3>{i18n.t("Summary")}</h3>
                <SectionCard className="wrong">
                    <ul>
                        <li>
                            <b>{i18n.t("imported: ", { nsSeparator: false })}</b>{" "}
                            {fileType === "primary"
                                ? primaryFileImportSummary?.importCount.imported
                                : secondaryFileImportSummary?.importCount.imported}
                        </li>
                        <li>
                            <b>{i18n.t("updated: ", { nsSeparator: false })}</b>{" "}
                            {fileType === "primary"
                                ? primaryFileImportSummary?.importCount.updated
                                : secondaryFileImportSummary?.importCount.updated}
                        </li>
                        <li>
                            <b>{i18n.t("deleted: ", { nsSeparator: false })}</b>{" "}
                            {fileType === "primary"
                                ? primaryFileImportSummary?.importCount.deleted
                                : secondaryFileImportSummary?.importCount.deleted}
                            {}
                        </li>
                        <li>
                            <b>{i18n.t("ignored: ", { nsSeparator: false })}</b>{" "}
                            {fileType === "primary"
                                ? primaryFileImportSummary?.importCount.ignored
                                : secondaryFileImportSummary?.importCount.ignored}
                        </li>
                    </ul>
                </SectionCard>
            </Section>
            <div className="bottom">
                {isLoading ? (
                    <CircularProgress size={25} />
                ) : (
                    <Button
                        variant="contained"
                        color={"primary"}
                        endIcon={<ChevronRightIcon />}
                        onClick={goToFinalStepEffect}
                        disableElevation
                    >
                        {i18n.t("Continue")}
                    </Button>
                )}
            </div>
        </ContentWrapper>
    );
};

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 40px;
    .toggles {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        width: 100%;
        max-width: 550px;
        margin: 0 auto;
        button {
            color: ${glassColors.greyDisabled};
            padding: 10px 20px;
            border-radius: 0;
            border: none;
            flex: 1;
            border-bottom: 2px solid ${glassColors.greyLight};
            &.current {
                color: ${glassColors.mainPrimary};
                border-bottom: 4px solid ${glassColors.mainPrimary};
            }
        }
    }
    .bottom {
        display: flex;
        align-items: baseline;
        justify-content: flex-end;
        margin: 0 auto 30px auto;
        align-items: flex-end;
        width: 100%;
    }
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    h3 {
        margin: 0;
        font-size: 21px;
        font-weight: 500;
    }
    &.charts {
        img {
            display: block;
            width: 100%;
        }
    }
`;
const SectionCard = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
    padding: 20px;
    box-shadow: rgb(0 0 0 / 12%) 0px 1px 6px, rgb(0 0 0 / 12%) 0px 1px 4px;
    ul {
        margin: 0;
        padding: 0;
        display: flex;
        gap: 20px;
        list-style-type: none;
        li {
            display: inline-block;
        }
    }
`;
