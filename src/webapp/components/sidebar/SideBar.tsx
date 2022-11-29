import React from "react";
import styled from "styled-components";
import { Box, Button, CircularProgress, Typography } from "@material-ui/core";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import StarIcon from "@material-ui/icons/Star";
import { CustomCard } from "../custom-card/CustomCard";
import { glassColors } from "../../pages/app/themes/dhis2.theme";
import SidebarNav from "../sidebar-nav/SidebarNav";
import { useAppContext } from "../../contexts/app-context";
import { useSidebarMenus } from "../../hooks/useSidebarMenus";
import i18n from "../../../locales";

export const SideBar: React.FC = () => {
    const { compositionRoot } = useAppContext();

    const menusResult = useSidebarMenus(compositionRoot);

    switch (menusResult.kind) {
        case "loading":
            return <CircularProgress />;
        case "error":
            return <Typography variant="h6">{menusResult.message}</Typography>;
        case "loaded":
            return (
                <CustomCard minHeight="630px" padding="0 0 100px 0" data-test="test2">
                    <TitleContainer>
                        <StarIcon />
                        <Box width={40} />
                        <Typography>{i18n.t("HOME")}</Typography>
                    </TitleContainer>

                    <SidebarNav menus={menusResult.data} />

                    <div style={{ flexGrow: 1 }} />

                </CustomCard>
            );
    }
};



const ButtonContainer = styled.div`
    display: flex;
    flex-direction: column;
    aleg-itrems: center;
`;

const StyledButton = styled(Button)`
    margin: 16px;
    background: transparent;
    text-transform: none;
`;

const TitleContainer = styled.div`
    background: ${glassColors.lightSecondary};
    color: white;
    border-radius: 10px;
    padding: 14px 10px;
    margin: 16px;
    display: flex;
    flex-direction: row;
`;
