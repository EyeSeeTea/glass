export interface UploadsDataItem {
    id: string;
    batchId: string;
    countryCode: string;
    fileType: string;
    fileId: string;
    fileName: string;
    inputLineNb: number;
    outputLineNb: number;
    period: string;
    specimens: string[];
    status: string;
    uploadDate: string;
    dataSubmission: string;
    module: string;
    records?: number; // TODO: Delete when no items in DataStore with records (becomes rows)
    rows?: number;
    correspondingRisUploadId: string;
    eventListFileId?: string;
}
