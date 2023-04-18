import React from "react";
import { GlassState } from "./State";
import { useAppContext } from "../contexts/app-context";

export type AnalyticsRunTimeState = GlassState<Date>;

export function useGetLastSuccessfulAnalyticsRunTime() {
    const { compositionRoot } = useAppContext();
    const [lastSuccessfulAnalyticsRunTime, setLastSuccessfulAnalyticsRunTime] = React.useState<AnalyticsRunTimeState>({
        kind: "loading",
    });

    React.useEffect(() => {
        compositionRoot.systemSettings.lastAnalyticsRunTime().run(
            runTime => {
                setLastSuccessfulAnalyticsRunTime({ kind: "loaded", data: runTime });
            },
            errMessage => {
                setLastSuccessfulAnalyticsRunTime({ kind: "error", message: errMessage });
            }
        );
    }, [compositionRoot]);

    return lastSuccessfulAnalyticsRunTime;
}
