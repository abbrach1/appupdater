import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { Box, Button, Container, Typography, Alert, CircularProgress, MenuItem, Select, InputLabel, FormControl, ToggleButton, ToggleButtonGroup, TextField, Tabs, Tab, Paper } from '@mui/material';
import LogoutButton from './LogoutButton';
import AdminUserEditor from './AdminUserEditor';

export default function AdminUpload() {
  const [tab, setTab] = useState(0);
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [uploadType, setUploadType] = useState('file');
  const [userId, setUserId] = useState('');
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setFetchingUsers(true);
      setFetchError('');
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        setUserList(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setUserList([]);
        setFetchError('Could not fetch users: ' + err.message);
      }
      setFetchingUsers(false);
    }
    fetchUsers();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!userId) {
      setError('Please choose a user.');
      return;
    }
    if (uploadType === 'file' && !file) {
      setError('Please select a file.');
      return;
    }
    if (uploadType === 'link' && !link) {
      setError('Please provide a link.');
      return;
    }
    setLoading(true);
    try {
      let fileRecord = {
        userId,
        uploadedAt: Timestamp.now()
      };
      if (uploadType === 'file') {
        const storagePath = `user_files/${userId}/${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        fileRecord = { ...fileRecord, name: file.name, storagePath, type: 'file' };
      } else if (uploadType === 'link') {
        fileRecord = { ...fileRecord, name: link, url: link, type: 'link' };
      }
      await addDoc(collection(db, 'files'), fileRecord);
      setSuccess('File uploaded successfully!');
      setFile(null);
      setLink('');
      setUserId('');
    } catch (err) {
      setError('Upload failed: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <LogoutButton />
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Upload File/Link" />
          <Tab label="Edit Users" />
        </Tabs>
      </Paper>
      {tab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">Admin File Upload</Typography>
          {fetchError && <Alert severity="error" sx={{ mt: 2 }}>{fetchError}</Alert>}
          <Box component="form" onSubmit={handleUpload} sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>User</InputLabel>
              <Select value={userId} label="User" onChange={e => setUserId(e.target.value)} disabled={fetchingUsers}>
                {userList.map(user => (
                  <MenuItem key={user.id} value={user.id}>{user.email || user.id}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <ToggleButtonGroup
              color="primary"
              value={uploadType}
              exclusive
              onChange={(_, val) => val && setUploadType(val)}
              sx={{ mt: 2, mb: 2 }}
              fullWidth
            >
              <ToggleButton value="file">Upload File</ToggleButton>
              <ToggleButton value="link">Link</ToggleButton>
            </ToggleButtonGroup>
            {uploadType === 'file' && (
              <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
                {file ? file.name : 'Select File'}
                <input type="file" hidden onChange={e => setFile(e.target.files[0])} />
              </Button>
            )}
            {uploadType === 'link' && (
              <TextField
                margin="normal"
                required
                fullWidth
                label="Paste Link Here"
                value={link}
                onChange={e => setLink(e.target.value)}
              />
            )}
            {loading && <CircularProgress sx={{ mt: 2 }} />}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>Upload</Button>
          </Box>
        </Box>
      )}
      {tab === 1 && <AdminUserEditor />}
    </Container>
  );
}
