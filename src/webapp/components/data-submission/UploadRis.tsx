import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@material-ui/core";
import styled from "styled-components";
import i18n from "@eyeseetea/d2-ui-components/locales";
import BackupIcon from "@material-ui/icons/Backup";
import CloseIcon from '@material-ui/icons/Close';

interface UploadRisProps  {
    handleValidate: (val: boolean) => void;
}
export const UploadRis: React.FC<UploadRisProps> = ({ handleValidate}) => {
    const [fileList, setFileList] = useState<FileList | null>(null);

    useEffect(() => {
        if (fileList && fileList?.length) {
            handleValidate(true);
        } else {
            handleValidate(false);
        }
    }, [fileList, handleValidate])
    
    const inputRef = useRef<HTMLInputElement>(null);

    const files = fileList ? [...fileList] : [];

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFileList(e.target.files);
    };

    const handleChooseFile = () => {
        if (inputRef.current != null) {
            inputRef.current.click();
        }
    };

    const handleRemoveFiles = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        setFileList(null);
    }

    const handleUploadFile = () => {
        if (!fileList) {
            return;
        }
        // Create new FormData object and append files
        const data = new FormData();
        files.forEach((file, i) => {
            data.append(`file-${i}`, file, file.name);
        });

        // TEST: Uploading the files using the fetch API to mock bin server
        fetch('https://httpbin.org/post', {
            method: 'POST',
            body: data,
        })
            .then((res) => res.json())
            // eslint-disable-next-line no-console
            .then((data) => console.log(data))
            .catch((err) => console.error(err));
    };

    return (
        <ContentWrapper className="ris-file">
            <span className="label">Choose RIS File</span>
            {(fileList && fileList?.length) ?
                <Button variant="contained"
                    color="primary"
                    className="choose-file-button"
                    endIcon={<BackupIcon />}
                    onClick={handleUploadFile}
                >
                    {i18n.t("Upload file")}
                </Button>
                :
                <Button variant="contained"
                    color="primary"
                    className="choose-file-button"
                    endIcon={<BackupIcon />}
                    onClick={handleChooseFile}
                >
                    {i18n.t("Select file")}
                </Button>
            }


            <input ref={inputRef} type="file" onChange={handleFileChange} multiple />

            <ul className="uploaded-list">
                {files.map((file, i) => (
                    <li key={i}>
                        {file.name} - {file.type}
                        <button 
                            className="remove-files" 
                            onClick={handleRemoveFiles}>
                            <CloseIcon />
                        </button>
                    </li>
                ))}
            </ul>
        </ContentWrapper>
    );
};

const ContentWrapper = styled.div`

`;