import styled from "styled-components";
import { CustomCard } from "../custom-card/CustomCard";
import { ContentLoader } from "../content-loader/ContentLoader";
import { TableContentWrapper } from "../data-file-history/DataFileTable";
import i18n from "@eyeseetea/d2-ui-components/locales";
import { StyledTableBody } from "../data-file-history/DataFileTableBody";
import { useSignals } from "../../hooks/useSignals";
import {
    Backdrop,
    Button,
    DialogContent,
    Paper,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { Signal, SignalStatusTypes } from "../../../domain/entities/Signal";
import { DeleteOutline } from "@material-ui/icons";
import { useState } from "react";
import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import { useAppContext } from "../../contexts/app-context";
import { useCurrentOrgUnitContext } from "../../contexts/current-orgUnit-context";
import { StyledLoaderContainer } from "../upload/ConsistencyChecks";
import { CircularProgress } from "material-ui";

export const SignalTableContent: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const { signals, refreshSignals } = useSignals();
    const history = useHistory();
    const [open, setOpen] = useState(false);
    const [signalToDelete, setSignalToDelete] = useState<Signal>();
    const [loading, setLoading] = useState<boolean>(false);
    const { currentOrgUnitAccess } = useCurrentOrgUnitContext();
    const snackbar = useSnackbar();

    const handleSignalClick = (signalId: string, eventId: string, status: SignalStatusTypes) => {
        const readOnlySignal = status === "DRAFT" ? false : true;
        history.push({
            pathname: `/signal/${eventId}`,
            state: { readOnly: readOnlySignal, signalId: signalId, signalEvtId: eventId },
        });
    };

    const showConfirmationDialog = (signal: Signal) => {
        setSignalToDelete(signal);
        setOpen(true);
    };
    const hideConfirmationDialog = () => {
        setOpen(false);
    };

    const deleteSignal = () => {
        hideConfirmationDialog();
        if (signalToDelete) {
            setLoading(true);
            compositionRoot.signals
                .delete(
                    signalToDelete.id,
                    signalToDelete.eventId,
                    signalToDelete.status,
                    currentOrgUnitAccess.orgUnitId
                )
                .run(
                    () => {
                        setLoading(false);
                        refreshSignals({});
                        snackbar.info("Signal deleted successfully.");
                    },
                    () => {
                        setLoading(false);
                        snackbar.error("Error deleting signal");
                    }
                );
        }
    };

    return (
        <ContentLoader content={signals}>
            <ContentWrapper>
                <Backdrop open={loading} style={{ color: "#fff", zIndex: 1 }}>
                    <StyledLoaderContainer>
                        <CircularProgress color="#fff" size={50} />
                    </StyledLoaderContainer>
                </Backdrop>
                <ConfirmationDialog
                    isOpen={open}
                    title="Delete Confirmation"
                    onSave={deleteSignal}
                    onCancel={hideConfirmationDialog}
                    saveText={i18n.t("Ok")}
                    cancelText={i18n.t("Cancel")}
                    fullWidth={true}
                    disableEnforceFocus
                >
                    <DialogContent>
                        <Typography>Are you sure you want to delete this Signal?</Typography>
                    </DialogContent>
                </ConfirmationDialog>
                <CustomCard padding="20px 30px 20px">
                    {signals.kind === "loaded" && (
                        <TableContentWrapper>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <Typography variant="caption">{i18n.t("Date")}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{i18n.t("Country")}</Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="caption">
                                                    {i18n.t("Level of Confidentiality")}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="caption">{i18n.t("Status")}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{i18n.t("Delete")}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    {signals && signals.data.length ? (
                                        <StyledTableBody>
                                            {signals.data.map(signal => (
                                                <TableRow key={signal.id}>
                                                    <TableCell
                                                        onClick={() =>
                                                            handleSignalClick(signal.id, signal.eventId, signal.status)
                                                        }
                                                    >
                                                        {signal.creationDate.split("T")?.at(0) || ""}
                                                    </TableCell>
                                                    <TableCell
                                                        onClick={() =>
                                                            handleSignalClick(signal.id, signal.eventId, signal.status)
                                                        }
                                                    >
                                                        {signal.orgUnit.name}
                                                    </TableCell>
                                                    <TableCell
                                                        onClick={() =>
                                                            handleSignalClick(signal.id, signal.eventId, signal.status)
                                                        }
                                                    >
                                                        {signal.levelOfConfidentiality}
                                                    </TableCell>
                                                    <TableCell
                                                        onClick={() =>
                                                            handleSignalClick(signal.id, signal.eventId, signal.status)
                                                        }
                                                    >
                                                        {signal.status}
                                                    </TableCell>

                                                    <TableCell style={{ opacity: 0.5 }}>
                                                        <Button onClick={() => showConfirmationDialog(signal)}>
                                                            <DeleteOutline />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </StyledTableBody>
                                    ) : (
                                        <StyledTableBody>
                                            <TableRow>
                                                <TableCell>No data found...</TableCell>
                                            </TableRow>
                                        </StyledTableBody>
                                    )}
                                </Table>
                            </TableContainer>
                        </TableContentWrapper>
                    )}
                </CustomCard>
            </ContentWrapper>
        </ContentLoader>
    );
};

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 40px;
    p.intro {
        text-align: left;
        max-width: 730px;
        margin: 0 auto;
        font-weight: 300px;
        line-height: 1.4;
    }
`;
