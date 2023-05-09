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
import { useCurrentDataSubmissionId } from "../../hooks/useCurrentDataSubmissionId";
import { useCurrentModuleContext } from "../../contexts/current-module-context";
import { useCurrentOrgUnitContext } from "../../contexts/current-orgUnit-context";
import { useCallbackEffect } from "../../hooks/use-callback-effect";
import { useCurrentPeriodContext } from "../../contexts/current-period-context";
interface UploadPrimaryFileProps {
    primaryFile: File | null;
    setPrimaryFile: React.Dispatch<React.SetStateAction<File | null>>;
    validate: (val: boolean) => void;
    batchId: string;
}

const getFileType = (module: string) => {
    if (module === "AMR") {
        return "RIS";
    } else if (module === "EGASP") return "EGASP";
    else return module;
};

export const UploadPrimaryFile: React.FC<UploadPrimaryFileProps> = ({
    primaryFile,
    setPrimaryFile,
    validate,
    batchId,
}) => {
    const { compositionRoot } = useAppContext();

    const {
        currentModuleAccess: { moduleId, moduleName },
    } = useCurrentModuleContext();

    const {
        currentOrgUnitAccess: { orgUnitId, orgUnitCode },
    } = useCurrentOrgUnitContext();

    const { currentPeriod } = useCurrentPeriodContext();
    const snackbar = useSnackbar();

    const [isLoading, setIsLoading] = useState(false);
    const primaryFileUploadRef = useRef<DropzoneRef>(null);

    const dataSubmissionId = useCurrentDataSubmissionId(compositionRoot, moduleId, orgUnitId, currentPeriod);

    const openFileUploadDialog = useCallback(async () => {
        primaryFileUploadRef.current?.openDialog();
    }, [primaryFileUploadRef]);

    useEffect(() => {
        if (primaryFile) {
            validate(true);
        } else {
            validate(false);
        }
    }, [primaryFile, validate]);

    const removeFiles = useCallback(
        (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            event.preventDefault();
            setIsLoading(true);
            const primaryUploadId = localStorage.getItem("primaryUploadId");
            if (primaryUploadId) {
                return compositionRoot.glassDocuments.deleteByUploadId(primaryUploadId).run(
                    () => {
                        localStorage.removeItem("primaryUploadId");
                        setPrimaryFile(null);
                        setIsLoading(false);
                    },
                    errorMessage => {
                        snackbar.error(errorMessage);
                        setPrimaryFile(null);
                        setIsLoading(false);
                    }
                );
            } else {
                setPrimaryFile(null);
                setIsLoading(false);
            }
        },
        [compositionRoot.glassDocuments, snackbar, setPrimaryFile]
    );

    const removeFilesEffect = useCallbackEffect(removeFiles);

    const primaryFileUpload = useCallback(
        (files: File[], rejections: FileRejection[]) => {
            if (rejections.length > 0) {
                snackbar.error(i18n.t("Multiple uploads not allowed, please select one file"));
            } else {
                const uploadedPrimaryFile = files[0];
                if (uploadedPrimaryFile) {
                    setIsLoading(true);

                    return compositionRoot.fileSubmission.validatePrimaryFile(uploadedPrimaryFile, moduleName).run(
                        primaryFileData => {
                            if (primaryFileData.isValid) {
                                setPrimaryFile(uploadedPrimaryFile);
                                const data = {
                                    batchId,
                                    fileType: getFileType(moduleName),
                                    dataSubmission: dataSubmissionId,
                                    moduleId,
                                    moduleName,
                                    period: currentPeriod.toString(),
                                    orgUnitId: orgUnitId,
                                    orgUnitCode: orgUnitCode,
                                    records: primaryFileData.records,
                                    specimens: primaryFileData.specimens,
                                };
                                return compositionRoot.glassDocuments.upload({ file: uploadedPrimaryFile, data }).run(
                                    uploadId => {
                                        localStorage.setItem("primaryUploadId", uploadId);
                                        setIsLoading(false);
                                    },
                                    () => {
                                        snackbar.error(i18n.t("Error in file upload"));
                                        setIsLoading(false);
                                    }
                                );
                            } else {
                                snackbar.error(i18n.t("Incorrect File Format. Please retry with a valid file"));
                                setIsLoading(false);
                            }
                        },
                        _error => {
                            snackbar.error(i18n.t("Error in file upload"));
                            setIsLoading(false);
                        }
                    );
                }
            }
        },
        [
            batchId,
            compositionRoot.fileSubmission,
            compositionRoot.glassDocuments,
            currentPeriod,
            dataSubmissionId,
            moduleId,
            moduleName,
            orgUnitCode,
            orgUnitId,
            setPrimaryFile,
            snackbar,
        ]
    );

    const primaryFileUploadEffect = useCallbackEffect(primaryFileUpload);

    return (
        <ContentWrapper className="ris-file">
            <span className="label">{i18n.t("Choose RIS File")}</span>
            {/* Allow only one file upload per dataset */}
            <Dropzone ref={primaryFileUploadRef} onDrop={primaryFileUploadEffect} maxFiles={1}>
                <Button
                    variant="contained"
                    color="primary"
                    className="choose-file-button"
                    endIcon={<BackupIcon />}
                    onClick={openFileUploadDialog}
                    disabled={primaryFile === null ? false : true}
                >
                    {i18n.t("Select file")}
                </Button>
                {isLoading && <CircularProgress size={25} />}
            </Dropzone>
            {primaryFile && (
                <RemoveContainer>
                    {primaryFile?.name} - {primaryFile?.type}
                    <StyledRemoveButton onClick={removeFilesEffect}>
                        <CloseIcon />
                    </StyledRemoveButton>
                </RemoveContainer>
            )}
        </ContentWrapper>
    );
};

const ContentWrapper = styled.div``;
