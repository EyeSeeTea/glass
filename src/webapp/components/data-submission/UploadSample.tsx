import React, { useCallback, useRef, useState } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import styled from "styled-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import BackupIcon from "@material-ui/icons/Backup";
import HelpIcon from "@material-ui/icons/Help";
import CloseIcon from "@material-ui/icons/Close";
import { FileRejection } from "react-dropzone";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { RemoveContainer, StyledRemoveButton } from "./UploadFiles";
import { useAppContext } from "../../contexts/app-context";
import { uploadFile } from "../../../utils/uploadFile";

export const UploadSample: React.FC = () => {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [sampleFile, setSampleFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const sampleFileUploadRef = useRef<DropzoneRef>(null);

    const openFileUploadDialog = useCallback(async () => {
        sampleFileUploadRef.current?.openDialog();
    }, [sampleFileUploadRef]);

    const removeFiles = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setSampleFile(null);
    };

    const sampleFileUpload = useCallback(
        async (files: File[], rejections: FileRejection[]) => {
            if (rejections.length > 0) {
                snackbar.error(i18n.t("Multiple uploads not allowed, please select one file"));
            } else {
                const uploadedSample = files[0];
                if (uploadedSample) {
                    setIsLoading(true);
                    setSampleFile(uploadedSample);
                    try {
                        const existingDocuments = await compositionRoot.glassDocuments.getAll().toPromise();
                        const document = await uploadFile(api, uploadedSample);
                        await compositionRoot.glassDocuments.save([...existingDocuments, document]).toPromise();
                        const existingSubmissions = await compositionRoot.glassSubmissions.getAll().toPromise();
                        const submission = {
                            id: "",
                            batchId: "Dataset 1",
                            call: "",
                            countryCode: "",
                            fileId: document.id,
                            fileName: uploadedSample.name,
                            fileType: "SAMPLE",
                            inputLineNb: 0,
                            outputLineNb: 0,
                            module: "",
                            period: "",
                            specimens: [],
                            status: "uploaded",
                            submissionDate: new Date().toISOString(),
                        };
                        await compositionRoot.glassSubmissions.save([...existingSubmissions, submission]).toPromise();
                    } catch {
                        snackbar.error(i18n.t("Error in file upload"));
                        setSampleFile(null);
                    }
                    setIsLoading(false);
                } else {
                    snackbar.error(i18n.t("Error in file upload"));
                }
            }
        },
        [api, snackbar]
    );

    return (
        <ContentWrapper className="ris-file">
            <span className="label">
                SAMPLE File <small>(not required)</small> <HelpIcon />
            </span>
            {/* Allow only one file upload per dataset */}
            <Dropzone ref={sampleFileUploadRef} onDrop={sampleFileUpload} maxFiles={1}>
                <Button
                    variant="contained"
                    color="primary"
                    className="choose-file-button"
                    endIcon={<BackupIcon />}
                    onClick={openFileUploadDialog}
                    disabled={sampleFile === null ? false : true}
                >
                    {i18n.t("Select file")}
                </Button>
                {isLoading && <CircularProgress size={25} />}
            </Dropzone>
            {sampleFile && (
                <RemoveContainer>
                    {sampleFile?.name} - {sampleFile?.type}
                    <StyledRemoveButton onClick={removeFiles}>
                        <CloseIcon />
                    </StyledRemoveButton>
                </RemoveContainer>
            )}
        </ContentWrapper>
    );
};

const ContentWrapper = styled.div``;
