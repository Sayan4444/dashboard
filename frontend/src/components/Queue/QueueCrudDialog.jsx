import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, DialogActions, Button, IconButton, Typography, Stack, Paper, TextField, Snackbar, Alert } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFormattedYaml } from './helper';

export default function QueueCrudDialog({ openDialog, setOpenDialog, selectedQueueName, selectedQueueYaml: yamlContent, setSelectedQueueYaml: setYamlContent }) {

    const [fileName, setFileName] = useState(null);
    const [yamlContentFormatted, setYamlContentFormatted] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errorSnackbar, setErrorSnackbar] = useState(false);


    useEffect(() => {
        const formattedYaml = getFormattedYaml(yamlContent)
        setYamlContentFormatted(formattedYaml);
    }, [yamlContent]);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFileName(null);
        // setYamlContent(null);
        setIsEditing(false);
    }

    const handleFileUpload = (file) => {
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                setYamlContent(content);
                setYamlContentFormatted(getFormattedYaml(content));
            };
            reader.readAsText(file);
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    }

    const handleDragLeave = () => {
        setDragging(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    }

    const handleEditToggle = () => {
        setIsEditing(true);
    }

    const handleSave = () => {
        setYamlContentFormatted(getFormattedYaml(yamlContent));
        setIsEditing(false);
    }

    const handleRemoveFile = () => {
        setFileName(null);
        setYamlContent(null);
        setIsEditing(false);
    }

    const handleApply = () => {
        if (!yamlContent || yamlContent.trim() === "") {
            setErrorSnackbar(true);
            return;
        }
        setOpenSnackbar(true);
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
                                <Typography variant="body2" fontWeight="bold">File: {fileName}</Typography>
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
            <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                    Queue added successfully!
                </Alert>
            </Snackbar>
            <Snackbar open={errorSnackbar} autoHideDuration={3000} onClose={() => setErrorSnackbar(false)}>
                <Alert onClose={() => setErrorSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                    YAML content cannot be empty!
                </Alert>
            </Snackbar>
        </Dialog>
    );
}


// export default function QueueCrudDialog({ openDialog, setOpenDialog, selectedQueueName, selectedQueueYaml }) {
//     const handleCloseDialog = () => {
//         setOpenDialog(false);
//     }
//     console.log("sayan", selectedQueueName);

//     return (
//         <Dialog
//             open={openDialog}
//             onClose={handleCloseDialog}
//             maxWidth={false}
//             fullWidth
//             PaperProps={{
//                 sx: {
//                     width: "80%",
//                     maxWidth: "800px",
//                     maxHeight: "90vh",
//                     m: 2,
//                     bgcolor: "background.paper",
//                 },
//             }}
//         >
//             <DialogTitle>Queue YAML - {selectedQueueName}</DialogTitle>
//             <DialogContent>
//                 <Box
//                     sx={{
//                         mt: 2,
//                         mb: 2,
//                         fontFamily: "monospace",
//                         fontSize: "1.2rem",
//                         whiteSpace: "pre-wrap",
//                         overflow: "auto",
//                         maxHeight: "calc(90vh - 150px)",
//                         bgcolor: "grey.50",
//                         p: 2,
//                         borderRadius: 1,
//                         "& .yaml-key": {
//                             fontWeight: 700,
//                             color: "#000",
//                         },
//                     }}
//                 >
//                     <pre dangerouslySetInnerHTML={{ __html: selectedQueueYaml }} />
//                 </Box>
//             </DialogContent>
//             <DialogActions>
//                 <Box
//                     sx={{
//                         display: "flex",
//                         justifyContent: "flex-end",
//                         mt: 2,
//                         width: "100%",
//                         px: 2,
//                         pb: 2,
//                     }}
//                 >
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         onClick={handleCloseDialog}
//                         sx={{
//                             minWidth: "100px",
//                             "&:hover": {
//                                 bgcolor: "primary.dark",
//                             },
//                         }}
//                     >
//                         Close
//                     </Button>
//                 </Box>
//             </DialogActions>
//         </Dialog>
//     )
// }

