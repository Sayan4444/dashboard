import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, DialogActions, Button, IconButton, Typography, Stack, Paper, TextField, Snackbar, Alert } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFormattedYaml } from './helper';
import { toastError, toastSuccess } from "../toast"
import axios from 'axios';


export default function QueueCrudDialog({ openDialog, setOpenDialog, selectedQueueName, selectedQueueYaml: yamlContent, setSelectedQueueYaml: setYamlContent, handleRefresh }) {

    const [file, setFile] = useState(null);
    const [yamlContentFormatted, setYamlContentFormatted] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [dragging, setDragging] = useState(false);


    useEffect(() => {
        const formattedYaml = getFormattedYaml(yamlContent)
        setYamlContentFormatted(formattedYaml);
    }, [yamlContent]);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFile(null);
        // setYamlContent(null);
        setIsEditing(false);
    }

    const handleFileUpload = (fileUploaded) => {
        if (fileUploaded) {
            setFile(fileUploaded);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                setYamlContent(content);
                setYamlContentFormatted(getFormattedYaml(content));
            };
            reader.readAsText(fileUploaded);
        }
    }

    const handleEditToggle = () => {
        setIsEditing(true);
    }

    const handleSave = () => {
        setYamlContentFormatted(getFormattedYaml(yamlContent));
        setIsEditing(false);
    }

    const handleRemoveFile = async () => {
        try {
            await axios.delete(`/api/queues/${selectedQueueName}`);
            toastSuccess("Queue deleted successfully!");
        } catch (error) {
            toastSuccess(error.message);
        }
        await handleRefresh();
        handleCloseDialog();
    }

    const handleApply = async () => {
        try {
            if (!file) {
                toastError("No file selected");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.status === 200) {
                toastSuccess("File uploaded successfully!");
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            toastError(error.message);
        }
    }

    const paperStyles = useMemo(() => ({
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        borderRadius: '8px',
        textAlign: 'center',
        border: dragging ? '2px dashed #3f51b5' : '2px dashed #ccc',
        backgroundColor: dragging ? '#f0f0f0' : 'transparent'
    }), [dragging]);
    return (
        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    width: "80%",
                    maxWidth: "600px",
                    maxHeight: "90vh",
                    m: 2,
                    bgcolor: "background.paper",
                    borderRadius: "12px",
                    p: 2,
                },
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Queue YAML - {selectedQueueName}
                <IconButton onClick={handleCloseDialog} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} alignItems="center" width="100%">
                    {(
                        <Paper elevation={2} sx={{ p: 2, width: "100%", borderRadius: '8px', position: 'relative' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight="bold">File: {file?.name}</Typography>
                                {!isEditing && <Button variant="contained"
                                    color="error" onClick={handleRemoveFile}>Delete
                                </Button>}
                                {isEditing && <Button
                                    variant="contained"
                                    component="label"
                                    color="secondary"
                                    sx={{ mt: 1, minWidth: "50px" }}
                                >
                                    Upload YAML
                                    <input
                                        type="file"
                                        accept=".yaml, .yml"
                                        hidden
                                        onChange={(e) => handleFileUpload(e.target.files[0])}
                                    />
                                </Button>}
                            </Stack>
                            {isEditing ? (
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={6}
                                    variant="outlined"
                                    value={yamlContent}
                                    onChange={(e) => setYamlContent(e.target.value)}
                                    sx={{ mt: 1 }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        mt: 2,
                                        mb: 2,
                                        fontFamily: "monospace",
                                        fontSize: "1.2rem",
                                        whiteSpace: "pre-wrap",
                                        overflow: "auto",
                                        bgcolor: "grey.50",
                                        p: 2,
                                        borderRadius: 1,
                                        "& .yaml-key": {
                                            fontWeight: 700,
                                            color: "#000",
                                        },
                                    }}
                                >
                                    <pre dangerouslySetInnerHTML={{ __html: yamlContentFormatted }} />
                                </Box>
                            )}
                        </Paper>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                {isEditing ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        sx={{ minWidth: "100px" }}
                        startIcon={<SaveIcon />}
                    >
                        Save
                    </Button>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleEditToggle}
                            sx={{ minWidth: "100px" }}
                            startIcon={<EditIcon />}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleApply}
                            sx={{ minWidth: "100px" }}
                        >
                            Apply Update
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCloseDialog}
                            sx={{ minWidth: "100px" }}
                        >
                            Close
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}