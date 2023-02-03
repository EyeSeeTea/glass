import React from "react";
import styled from "styled-components";
import { glassColors } from "../../pages/app/themes/dhis2.theme";
import ErrorIcon from "@material-ui/icons/Error";
import { CallStatusTypes } from "../../../domain/entities/GlassCallStatus";
import i18n from "@eyeseetea/d2-ui-components/locales";

export interface StatusCapsuleProps {
    status: CallStatusTypes;
}

export const StatusCapsule: React.FC<StatusCapsuleProps> = ({ status }) => {
    switch (status) {
        case "COMPLETE":
        case "APPROVED":
            return <Approved>{status}</Approved>;
        case "NOT_COMPLETED":
        case "PENDING_APPROVAL":
        case "PENDING_UPDATE_APPROVAL":
        case "REJECTED":
            return (
                <Warning>
                    <ErrorIcon /> {status}
                </Warning>
            );
        default:
            return <span>{i18n.t("status")}</span>;
    }
};

const Approved = styled.div`
    color: ${glassColors.green};
    text-transform: capitalize;
`;

const Warning = styled.div`
    color: ${glassColors.red};
    text-transform: capitalize;
    display: inline-flex;
    align-items: center;
    gap: 10px;
`;
