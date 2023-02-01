import React, { useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import { List, ListItem, Theme, Collapse, Button, colors } from "@material-ui/core";
import clsx from "clsx";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import { MenuGroup } from "./SidebarNav";
import SidebarNavMenu from "./SidebarNavMenu";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import FolderIcon from "@material-ui/icons/Folder";
import i18n from "@eyeseetea/d2-ui-components/locales";

interface SidebarNavProps {
    className?: string;
    groupName: string;
    currentNaVitem: string[];
    changeCurrentNavItem: (val: string[]) => void;
    menu: MenuGroup;
}

const SidebarNavMenuGroup: React.FC<SidebarNavProps> = ({
    menu,
    groupName,
    className,
    currentNaVitem,
    changeCurrentNavItem,
}) => {
    // TODO: get current module from page context and remove location parsing below
    const location = useLocation();
    const urlModuleName = location.pathname.split("/")[2];

    const isCurrentModule = useCallback((val: string) => {
        if (val === urlModuleName) {
            return true;
        } else {
            return false;
        }
    }, [urlModuleName]);

    const isCurrentNavItem = (val: string[]) => {
        if (isCurrentModule(groupName)) {
            return true;
        }
        if (currentNaVitem && val[0] === groupName) {
            return true;
        } else {
            return false;
        }
    };

    const classes = useStyles(menu.level);
    const [expanded, setExapanded] = React.useState(isCurrentNavItem(currentNaVitem));

    const toggleExpanded = () => {
        setExapanded(!expanded);
    };

    useEffect(() => {
        if (isCurrentModule(menu.title)) {
            setExapanded(true);
        }
        return () => {
            // Cleanup
        };
    }, [menu, isCurrentModule]);

    return (
        <React.Fragment>
            <ListItem
                className={clsx(classes.root, className)}
                onClick={toggleExpanded}
                disableGutters
                style={{ paddingLeft: menu.level * 8 }}
            >
                <Button className={classes.button} fullWidth={true}>
                    <div className={classes.icon}>
                        <FolderIcon htmlColor={menu.moduleColor} />
                    </div>
                    <span className={classes.title}>{i18n.t(menu.title)}</span>
                    <div className={classes.expand}>{expanded ? <ExpandLess /> : <ExpandMore />}</div>
                </Button>
            </ListItem>

            <ModuleWrap moduleColor={menu.moduleColor}>
                <Collapse in={expanded} timeout="auto" unmountOnExit key={menu.title}>
                    <List component="div" disablePadding data-group-name={groupName}>
                        {menu.children &&
                            menu.children.map(child =>
                                child.kind === "MenuGroup" ? (
                                    <SidebarNavMenuGroup
                                        menu={child}
                                        key={child.title}
                                        groupName={groupName}
                                        currentNaVitem={currentNaVitem}
                                        changeCurrentNavItem={changeCurrentNavItem}
                                    />
                                ) : (
                                    <SidebarNavMenu
                                        currentNaVitem={currentNaVitem}
                                        changeCurrentNavItem={changeCurrentNavItem}
                                        menu={child}
                                        key={child.title}
                                        groupName={groupName}
                                    />
                                )
                            )}
                    </List>
                </Collapse>
            </ModuleWrap>
        </React.Fragment>
    );
};

export default SidebarNavMenuGroup;

const useStyles = makeStyles((theme: Theme) => ({
    root: { padding: theme.spacing(0) },
    button: {
        color: colors.blueGrey[800],
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
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
    },
    title: {
        textAlign: "start",
        flexGrow: 1,
        marginLeft: "10px",
    },
    expand: {
        marginRight: theme.spacing(4),
    },
}));

const ModuleWrap = styled.div<{ moduleColor: string }>`
    a[data-is-page-current="true"] {
        background: ${props => props.moduleColor};
        * {
            color: white !important;
        }
    }
`;
