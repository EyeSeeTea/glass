import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import styled from "styled-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import BackupIcon from "@material-ui/icons/Backup";
import CloseIcon from "@material-ui/icons/Close";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { Dropzone, DropzoneRef } from "../dropzone/Dropzone";
import { FileRejection } from "react-dropzone";
import { RemoveContainer, StyledRemoveButton } from "./UploadFiles";
import { useAppContext } from "../../contexts/app-context";
import { uploadFile } from "../../../utils/uploadFile";
interface UploadRisProps {
    validate: (val: boolean) => void;
}
export const UploadRis: React.FC<UploadRisProps> = ({ validate }) => {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [risFile, setRisFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const risFileUploadRef = useRef<DropzoneRef>(null);

    const openFileUploadDialog = useCallback(async () => {
        risFileUploadRef.current?.openDialog();
    }, [risFileUploadRef]);

    useEffect(() => {
        if (risFile) {
            validate(true);
        } else {
            validate(false);
        }
    }, [risFile, validate]);

    const removeFiles = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setRisFile(null);
    };

    const risFileUpload = useCallback(
        async (files: File[], rejections: FileRejection[]) => {
            if (rejections.length > 0) {
                snackbar.error(i18n.t("Multiple uploads not allowed, please select one file"));
            } else {
                const uploadedRisFile = files[0];
                if (uploadedRisFile) {
                    setIsLoading(true);
                    setRisFile(uploadedRisFile);
                    try {
                        const existingDocuments = await compositionRoot.glassDocuments.getAll().toPromise();
                        const document = await uploadFile(api, uploadedRisFile);
                        await compositionRoot.glassDocuments.save([...existingDocuments, document]).toPromise();
                        const existingSubmissions = await compositionRoot.glassSubmissions.getAll().toPromise();
                        const submission = {
                            id: "",
                            batchId: "Dataset 1",
                            call: "",
                            countryCode: "",
                            fileId: document.id,
                            fileName: uploadedRisFile.name,
                            fileType: "RIS",
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
                        setRisFile(null);
                    }
                    setIsLoading(false);
                } else {
                    snackbar.error(i18n.t("Error in file upload"));
                }
            }
        },
        [api, compositionRoot.glassDocuments, compositionRoot.glassSubmissions, snackbar]
    );

    return (
        <ContentWrapper className="ris-file">
            <span className="label">Choose RIS File</span>
            {/* Allow only one file upload per dataset */}
            <Dropzone ref={risFileUploadRef} onDrop={risFileUpload} maxFiles={1}>
                <Button
                    variant="contained"
                    color="primary"
                    className="choose-file-button"
                    endIcon={<BackupIcon />}
                    onClick={openFileUploadDialog}
                    disabled={risFile === null ? false : true}
                >
                    {i18n.t("Select file")}
                </Button>
                {isLoading && <CircularProgress size={25} />}
            </Dropzone>
            {risFile && (
                <RemoveContainer>
                    {risFile?.name} - {risFile?.type}
                    <StyledRemoveButton onClick={removeFiles}>
                        <CloseIcon />
                    </StyledRemoveButton>
                </RemoveContainer>
            )}
        </ContentWrapper>
    );
};

const ContentWrapper = styled.div``;
