import { Breadcrumbs, Button } from "@material-ui/core";
import React, { useState } from "react";
import styled from "styled-components";
import { glassColors, palette } from "../app/themes/dhis2.theme";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { NavLink } from "react-router-dom";
import { CustomCard } from "../../components/custom-card/CustomCard";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { CurrentDataSubmissionContent } from "../../components/current-data-submission/CurrentDataSubmissionContent";
import { useStatusDataSubmission } from "../../hooks/useStatusDataSubmission";
import { ContentLoader } from "../../components/content-loader/ContentLoader";
import { useCurrentOrgUnitContext } from "../../contexts/current-orgUnit-context";
import { useCurrentModuleContext } from "../../contexts/current-module-context";
import { DataSubmissionStatusTypes } from "../../../domain/entities/GlassDataSubmission";
import { useCurrentPeriodContext } from "../../contexts/current-period-context";

interface CurrentDataSubmissionPageContentProps {
    moduleId: string;
    moduleName: string;
}

export const CurrentDataSubmissionPage: React.FC = React.memo(() => {
    const { currentModuleAccess } = useCurrentModuleContext();

    return (
        <CurrentDataSubmissionPageContent
            moduleId={currentModuleAccess.moduleId}
            moduleName={currentModuleAccess.moduleName}
        />
    );
});

export const CurrentDataSubmissionPageContent: React.FC<CurrentDataSubmissionPageContentProps> = React.memo(
    ({ moduleId, moduleName }) => {
        const { currentPeriod } = useCurrentPeriodContext();

        const { currentOrgUnitAccess } = useCurrentOrgUnitContext();

        const [refetchStatus, setRefetchStatus] = useState<DataSubmissionStatusTypes>();
        const currentDataSubmissionStatus = useStatusDataSubmission(
            moduleId,
            currentOrgUnitAccess.orgUnitId,
            currentPeriod,
            refetchStatus
        );

        return (
            <ContentLoader content={currentDataSubmissionStatus}>
                {currentDataSubmissionStatus.kind === "loaded" && (
                    <ContentWrapper>
                        <PreContent>
                            {/* // TODO: replace this with a global reusable StyledBreadCrumbs component */}
                            <StyledBreadCrumbs aria-label="breadcrumb" separator="">
                                <Button component={NavLink} to={`/current-data-submission`} exact={true}>
                                    <span>{moduleName}</span>
                                </Button>
                                <ChevronRightIcon />
                                <Button component={NavLink} to={`/current-data-submission`} exact={true}>
                                    <span>{i18n.t(`${currentPeriod} Data Submission`)}</span>
                                </Button>
                            </StyledBreadCrumbs>

                            <div className="info">
                                <span>{i18n.t("Yearly data upload")}</span>
                                <PageTitle statusColor={currentDataSubmissionStatus.data.colour}>
                                    <div className="status">{i18n.t(currentDataSubmissionStatus.data.title)}</div>
                                </PageTitle>
                            </div>
                        </PreContent>

                        <>
                            <CustomCard padding="40px 60px 50px">
                                <CurrentDataSubmissionContent
                                    moduleName={moduleName}
                                    currentDataSubmissionStatus={currentDataSubmissionStatus.data}
                                    setRefetchStatus={setRefetchStatus}
                                />
                            </CustomCard>
                        </>
                    </ContentWrapper>
                )}
            </ContentLoader>
        );
    }
);

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const PreContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    .info {
        display: flex;
        font-size: 14px;
        span {
            opacity: 0.5;
            color: #666;
            padding: 5px;
        }
    }
`;

const PageTitle = styled.div<{ statusColor: string }>`
    display: flex;
    flex-direction: row;
    gap: 20px;
    padding-right: 5px;
    align-items: center;
    h3 {
        margin: 0;
    }
    .status {
        display: inline-block;
        border-radius: 5px;
        padding: 3px 15px;
        background-color: ${props => (props.statusColor ? props.statusColor : glassColors.mainPrimary)};
        color: white;
        text-transform: uppercase;
        font-weight: bold;
        font-size: 12px;
    }
`;

const StyledBreadCrumbs = styled(Breadcrumbs)`
    color: ${glassColors.mainPrimary};
    font-weight: 400;
    text-transform: uppercase;
    li {
        display: flex;
        align-items: center;
        p {
            padding: 6px 8px;
        }
        .MuiButton-root {
            span {
                color: ${glassColors.mainPrimary};
                font-size: 15px;
            }
        }
    }
    .MuiBreadcrumbs-separator {
        display: none;
    }
    svg {
        color: ${palette.text.secondary};
    }
`;
