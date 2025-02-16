import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, DialogActions, Button, IconButton, Typography, Stack, Paper, TextField, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFormattedYaml } from './helper';
import axios from 'axios';
import { toastSuccess, toastError } from '../toast';

export default function QueueAddDialog({ openDialogAddQueue, setOpenDialogAddQueue, namespaces, handleRefresh }) {
  const [file, setFile] = useState(null);
  const [yamlContent, setYamlContent] = useState(null);
  const [yamlContentFormatted, setYamlContentFormatted] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selectedNamespace, setSelectedNamespace] = useState('');

  const handleCloseDialog = () => {
    setOpenDialogAddQueue(false);
    setFile(null);
    setYamlContent(null);
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
    const fileDropped = e.dataTransfer.files[0];
    handleFileUpload(fileDropped);
  }

  const handleEditToggle = () => {
    setIsEditing(true);
  }

  const handleSave = () => {
    const updatedFile = new File([yamlContent], file.name, { type: file.type });
    setFile(updatedFile);
    setYamlContentFormatted(getFormattedYaml(yamlContent));
    setIsEditing(false);
  }

  const handleRemoveFile = () => {
    setFile(null);
    setYamlContent(null);
    setIsEditing(false);
  }


  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post('/api/queues', formData);
      toastSuccess("Queue created successfully!");
      await handleRefresh();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving YAML:", error.message);
      toastError("Error saving YAML");
    }
  };

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
      open={openDialogAddQueue}
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
        Add Queue
        <IconButton onClick={handleCloseDialog} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} alignItems="center" width="100%">
          {!file ? (
            <Paper
              elevation={3}
              sx={paperStyles}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
              <Typography variant="body1" color="textSecondary">
                Drag & Drop your YAML file here or click below
              </Typography>
              <Button
                variant="contained"
                component="label"
                color="secondary"
                sx={{ mt: 1, minWidth: "200px" }}
              >
                Upload YAML
                <input
                  type="file"
                  accept=".yaml, .yml"
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </Button>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 2, width: "100%", borderRadius: '8px', position: 'relative' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight="bold">File: {file?.name}</Typography>
                <IconButton size="small" onClick={handleRemoveFile}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Stack>
              {/* Add namespace dropdown here */}
              {/* {namespaces.length > 0 && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="namespace-select-label">Namespace</InputLabel>
                  <Select
                    labelId="namespace-select-label"
                    value={selectedNamespace}
                    label="Namespace"
                    onChange={(e) => setSelectedNamespace(e.target.value)}
                  >
                    {namespaces.map((namespace) => (
                      <MenuItem key={namespace} value={namespace}>
                        {namespace}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )} */}

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
            {file && (
              <><Button
                variant="contained"
                color="info"
                onClick={handleEditToggle}
                sx={{ minWidth: "100px" }}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleCreate}
                  sx={{ minWidth: "100px" }}
                >
                  Create
                </Button>
              </>)}
            <Button
              variant="contained"
              color="warning"
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