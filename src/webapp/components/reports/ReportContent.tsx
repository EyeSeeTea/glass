import { LinearProgress } from "@material-ui/core";
import React from "react";
import { useAppContext } from "../../contexts/app-context";

export const ReportContent: React.FC = () => {
    const { api } = useAppContext();
    const baseUrl = api.baseUrl;
    const [state, setState] = React.useState<State>({ type: "loading", height: 10000 });
    const iframeRef: React.RefObject<HTMLIFrameElement> = React.createRef();
    const dashboardUrlBase = `${baseUrl}/dhis-web-dashboard`;
    const dashboardUrl = dashboardUrlBase + `/#/sLldHZZgnFx`;

    React.useEffect(() => {
        const iframe = iframeRef.current;

        if (iframe !== null) {
            iframe.addEventListener("load", async () => {
                await setDashboardStyling(iframe);
                setState(prevState => ({ ...prevState, type: "loaded" }));
                openExternalLinksInNewTab(iframe);
            });

            const intervalId = autoResizeIframeByContent(iframe, height =>
                setState(prevState => ({ ...prevState, height }))
            );
            return () => window.clearInterval(intervalId);
        }
    }, [iframeRef]);

    const isLoading = state.type === "loading";
    const title = "TITLE";

    return (
        <React.Fragment>
            {isLoading && (
                <div style={styles.progress}>
                    <LinearProgress />
                </div>
            )}

            <div style={isLoading ? styles.wrapperHidden : styles.wrapperVisible}>
                <iframe
                    ref={iframeRef}
                    id="iframe"
                    title={title}
                    src={dashboardUrl}
                    height={state.height}
                    style={styles.iframe}
                />
            </div>
        </React.Fragment>
    );
};
interface State {
    type: "loading" | "loaded";
    height: number;
}

const styles = {
    iframe: { width: "100%", border: 0, overflow: "hidden" },
    wrapperVisible: {},
    wrapperHidden: { visibility: "hidden" },
    subtitle: { marginBottom: 10, marginLeft: 15 },
    progress: { marginTop: 20 },
    warning: {
        color: "#555",
        fontStyle: "italic",
        fontSize: "0.85em",
        display: "block",
        padding: "0px 15px",
    },
};

type IntervalId = number;

function openExternalLinksInNewTab(iframe: HTMLIFrameElement) {
    const iwindow = iframe.contentWindow;
    if (!iwindow) return;

    const intervalId = iwindow.setInterval(() => {
        const links = iframe.contentDocument?.querySelectorAll(".dashboard-item-header a");
        if (!links || links.length === 0) return;
        links.forEach(link => {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        });
        iwindow.clearInterval(intervalId);
    }, 1000);
}

function autoResizeIframeByContent(iframe: HTMLIFrameElement, setHeight: (height: number) => void): IntervalId {
    const resize = () => {
        // Get the first element that has the real height of the full dashboard (and not the forced large value).
        const document = iframe?.contentWindow?.document;
        const height = document?.querySelector(".dashboard-scroll-container > div")?.scrollHeight;

        if (height && height > 0) setHeight(height);
    };
    return window.setInterval(resize, 1000);
}

function waitforElementToLoad(iframeDocument: HTMLDocument, selector: string) {
    return new Promise(resolve => {
        const check = () => {
            if (iframeDocument.querySelector(selector)) {
                resolve(undefined);
            } else {
                setTimeout(check, 1000);
            }
        };
        check();
    });
}

async function setDashboardStyling(iframe: HTMLIFrameElement) {
    if (!iframe.contentWindow) return;
    const iframeDocument = iframe.contentWindow.document;

    await waitforElementToLoad(iframeDocument, ".app-wrapper,.dashboard-scroll-container");
    const iFrameRoot = iframeDocument.querySelector<HTMLElement>("#root");
    const iFrameWrapper = iframeDocument.querySelector<HTMLElement>(".app-wrapper");
    const pageContainer = iframeDocument.querySelector<HTMLElement>(".page-container-top-margin");

    if (iFrameWrapper?.children[0]) (iFrameWrapper.children[0] as HTMLElement).style.display = "none";
    if (iFrameWrapper?.children[1]) (iFrameWrapper.children[1] as HTMLElement).style.display = "none";

    // 2.36
    iframeDocument.querySelectorAll("header").forEach(el => el.remove());
    iframeDocument.querySelectorAll("[data-test='dashboards-bar']").forEach(el => el.remove());

    // Hide top bar actions
    /*
    iframeDocument
        .querySelectorAll<HTMLElement>(".dashboard-scroll-container > div > div[class*='ViewTitleBar_container']")
        .forEach(el => (el.style.display = "none"));
    */

    const title = iframeDocument.querySelector<HTMLElement>("[data-test='view-dashboard-title']");
    title?.remove();

    if (pageContainer) pageContainer.style.marginTop = "0px";
    if (iFrameRoot) iFrameRoot.style.marginTop = "0px";
}
