import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../CompositionRoot";
import { Instance } from "../../../data/entities/Instance";
import { D2Api } from "../../../types/d2-api";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Router } from "../Router";
import "./App.css";
import { AppConfig } from "./AppConfig";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

export interface AppProps {
    api: D2Api;
    d2: D2;
    instance: Instance;
}

export const App: React.FC<AppProps> = React.memo(function App({ api, d2, instance }) {
    // const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    const location = useLocation();
    
    useEffect(() => {
        async function setup() {
            const compositionRoot = getCompositionRoot(instance);
            const { data: currentUser } = await compositionRoot.instance.getCurrentUser().runAsync();
            
            if (!currentUser) throw new Error("User not logged in");

            const params = new URLSearchParams(location.search);
            let currentModule = null;
            if (params.get("module")) currentModule = params.get("module");
            let currentOrgUnit = null;
            if (params.get("orgUnit")) currentOrgUnit = params.get("orgUnit");

            await compositionRoot.glassModules.validate().runAsync();
            
            // const isShareButtonVisible = _(appConfig).get("appearance.showShareButton") || false;

            setAppContext({ api, currentUser, currentModule, currentOrgUnit, compositionRoot });
            // setShowShareButton(isShareButtonVisible);
            initFeedbackTool(d2, appConfig);
            setLoading(false);
        }
        setup();
    }, [d2, api, instance, location]);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <SnackbarProvider>
                    {/* <HeaderBar appName="Skeleton App" /> */}

                    <div id="app" className="content">
                        <AppContext.Provider value={appContext}>
                            <Router />
                        </AppContext.Provider>
                    </div>

                    {/* <Share visible={showShareButton} /> */}
                </SnackbarProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
});

type D2 = object;

function initFeedbackTool(d2: D2, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");

    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        window.$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
}
