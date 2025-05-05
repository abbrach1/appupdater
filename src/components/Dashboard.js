import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useAuth } from './AuthProvider';
import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress, Container } from '@mui/material';
import LogoutButton from './LogoutButton';

export default function Dashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      const q = query(collection(db, 'files'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fileData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const url = await getDownloadURL(ref(storage, data.storagePath));
        return { ...data, url };
      }));
      setFiles(fileData);
      setLoading(false);
    }
    if (user) fetchFiles();
  }, [user]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <LogoutButton />
      <Typography variant="h4" gutterBottom>My Files</Typography>
      {loading ? <CircularProgress /> : (
        <List>
          {files.length === 0 && <Typography>No files uploaded for you yet.</Typography>}
          {files.map((file, idx) => (
            <ListItem key={idx} divider>
              <ListItemText primary={file.name} secondary={file.uploadedAt?.toDate?.().toLocaleString?.() || ''} />
              <Button href={file.url} target="_blank" rel="noopener" variant="contained">Download</Button>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
