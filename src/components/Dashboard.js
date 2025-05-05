import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useAuth } from './AuthProvider';
import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress, Container } from '@mui/material';
import LogoutButton from './LogoutButton';

function forceDownload(url, filename) {
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(() => {
      // fallback: open in new tab if download fails
      window.open(url, '_blank');
    });
}

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
        if (data.type === 'file' && data.storagePath) {
          try {
            const url = await getDownloadURL(ref(storage, data.storagePath));
            return { ...data, url };
          } catch (e) {
            return { ...data, url: '', error: 'File not found in storage.' };
          }
        } else if (data.type === 'link' && data.url) {
          return { ...data, url: data.url };
        } else {
          return { ...data, url: '', error: 'Unknown file type.' };
        }
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
              <ListItemText primary={file.name} secondary={file.uploadedAt?.toDate?.().toLocaleString?.() || file.error || ''} />
              {file.url ? (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <Button variant="contained">Download</Button>
                </a>
              ) : (
                <Typography color="error" variant="body2">{file.error || 'Unavailable'}</Typography>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
}
