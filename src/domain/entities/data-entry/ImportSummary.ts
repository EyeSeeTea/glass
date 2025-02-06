import { Id } from "../Ref";

export type ImportSummary = {
    status: "SUCCESS" | "ERROR" | "WARNING";
    importCount: {
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
        total: number;
    };
    nonBlockingErrors: ConsistencyError[];
    blockingErrors: ConsistencyError[];
    importTime?: Date;
};

export type ImportSummaryErrors = {
    nonBlockingErrors: ConsistencyError[];
    blockingErrors: ConsistencyError[];
};

export type ConsistencyError = {
    error: string;
    count: number;
    lines?: number[];
};

export type BlockingError = {
    type: "blocking";
    error: ConsistencyError;
};

export type NonBlockingError = {
    type: "non-blocking";
    error: ConsistencyError;
};

export type ImportSummaryWithEventIdList = { importSummary: ImportSummary; eventIdList: Id[] };

export type MergedImportSummaryWithEventIdList = {
    allImportSummaries: ImportSummary[];
    mergedEventIdList: Id[];
};
