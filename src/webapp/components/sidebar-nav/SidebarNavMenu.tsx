/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { ListItem, Button, colors, Theme, Typography } from "@material-ui/core";
import clsx from "clsx";
import { MenuLeaf } from "./SidebarNav";
import { glassColors } from "../../pages/app/themes/dhis2.theme";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { useGlassModuleContext } from "../../contexts/glass-module-context";

interface SidebarNavProps {
    className?: string;
    groupName?: string;
    menu: MenuLeaf;
}

const SidebarNavMenu: React.FC<SidebarNavProps> = ({ menu, className, groupName }) => {
    const classes = useStyles(menu.level);
    const location = useLocation();

    const { module, setModule } = useGlassModuleContext();

    /* 
        TODO: determine through context which call is "current call" as of date and only highlight "Current call" if so, 
        otherwise highlight "uploads history menu"
    */
    const isCurrentPage = (menuPath: string) => {
        return (
            (menu.title === "Upload History" && location.pathname.includes("data-submission") && groupName === module) ||
            (menuPath.includes(location.pathname) && groupName === module)
        );
    };

    return (
        <ListItem className={clsx(classes.root, className)} disableGutters style={{ paddingLeft: menu.level * 8 }}>
            <Button
                className={classes.button}
                component={NavLink}
                to={menu.path}
                exact={true}
                data-is-page-current={isCurrentPage(menu.path)}
                onClick={() => setModule(groupName || "")}
            >
                <div className={classes.icon}>{menu.icon}</div>
                <Typography variant="body1" style={{ color: glassColors.greyBlack }}>
                    {i18n.t(menu.title)}
                </Typography>
            </Button>
        </ListItem>
    );
};

export default SidebarNavMenu;

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(0),
    },
    button: {
        color: colors.pink[800],
        padding: "10px 8px",
        justifyContent: "flex-start",
        textTransform: "none",
        letterSpacing: 0,
        width: "100%",
    },
    icon: {
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        marginRight: theme.spacing(1),
    },
    active: {
        color: theme.palette.primary.main,
        "& $icon": {
            color: theme.palette.primary.main,
        },
    },
}));
