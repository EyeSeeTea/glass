import React from "react";
import { Grid, Typography } from "@material-ui/core";
import { LandingNews } from "./LandingNews";
import styled from "styled-components";
import { OpenDataSubmissions } from "./OpenDataSubmissions";
import { YourNotifications } from "./notifications/YourNotifications";
import { glassColors } from "../../pages/app/themes/dhis2.theme";
import { CustomCard } from "../custom-card/CustomCard";
import { CircularProgress } from "material-ui";
import { useSideBarModulesContext } from "../../contexts/sidebar-modules-context";

export const LandingContent: React.FC = () => {
    const { accessibleModules, isLoading } = useSideBarModulesContext();

    return (
        <StyledGrid container spacing={4} alignItems="flex-start">
            {isLoading && <CircularProgress />}

            {!isLoading && (
                <>
                    {accessibleModules.length === 0 ? (
                        <Grid item xs={6}>
                            <CustomCard>
                                <TitleContainer />
                                <NotEnrolledText>
                                    You are not enrolled to any of the modules in GLASS. Please contact your Admin for
                                    access.
                                </NotEnrolledText>
                            </CustomCard>
                        </Grid>
                    ) : (
                        <OpenDataSubmissions />
                    )}
                </>
            )}

            <YourNotifications />
            <LandingNews />
        </StyledGrid>
    );
};

const StyledGrid = styled(Grid)`
    height: 100%;
    .section-title {
        font-weight: 600;
        margin: 0;
    }
`;
const TitleContainer = styled.div`
    background: ${glassColors.mainPrimary};
    color: white;
    border-radius: 20px 20px 0px 0px;
    padding: 34px 34px;
`;

const NotEnrolledText = styled(Typography)`
    padding: 25px;
`;
