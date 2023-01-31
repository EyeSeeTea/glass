import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { GlassModuleContextProvider } from "../contexts/GlassModuleProvider";
import { CallsHistoryPage } from "./calls-history/CallsHistoryPage";
import { CountryInformationPage } from "./country-information/CountryInformationPage";
import { CurrentCallPage } from "./current-call/CurrentCallPage";
import { DataSubmissionPage } from "./data-submission/DataSubmissionPage";
import { LandingPage } from "./landing/LandingPage";
import { UploadHistoryPage } from "./upload-history/UploadHistoryPage";

export const Router: React.FC = React.memo(() => {
    return (
        <HashRouter>
            <Switch>
                
                <GlassModuleContextProvider>
                    <Route
                        path="/current-call/:module"
                        render={({ match }) => <CurrentCallPage moduleName={match.params.module} />}
                    />
                    <Route
                        path="/data-submission/:module"
                        render={({ match }) => <DataSubmissionPage moduleName={match.params.module} />}
                    />
                    <Route path="/calls-history/:module/:orgUnit" component={CallsHistoryPage} />

                    <Route
                        path="/upload-history/:module"
                        render={({ match }) => <UploadHistoryPage moduleName={match.params.module} />}
                    />
                    <Route
                        path="/country-information/:module"
                        render={({ match }) => <CountryInformationPage moduleName={match.params.module} />}
                    />
                </GlassModuleContextProvider>
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
});
