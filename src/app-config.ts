export const appConfig: AppConfig = {
    appKey: "glass",
    appearance: {
        showShareButton: true,
    },
    feedback: {
        token: ["03242fc6b0c5a48582", "2e6b8d3e8337b5a0b95fe2"],
        createIssue: false,
        sendToDhis2UserGroups: [],
        issues: {
            repository: "EyeSeeTea/glass-dev",
            title: "[User feedback] {title}",
            body: "## dhis2\n\nUsername: {username}\n\n{body}",
        },
        snapshots: {
            repository: "EyeSeeTeaBotTest/snapshots",
            branch: "master",
        },
        clickUp: {
            title: "[Bug Report] {title}",
            listId: "134510862",
        },
        feedbackOptions: {},
    },
};

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback?: {
        token: string[];
        createIssue: boolean;
        sendToDhis2UserGroups: string[];
        issues: {
            repository: string;
            title: string;
            body: string;
        };
        snapshots: {
            repository: string;
            branch: string;
        };
        clickUp: {
            title: string;
            listId: string;
        };
        feedbackOptions: object;
    };
}
