import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useAuth } from './AuthProvider';
import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress, Container, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import LogoutButton from './LogoutButton';

const problematicTypes = ['apk', 'exe', 'zip', 'rar', 'bin', 'tar', 'gz', 'dmg'];

function getFileExtension(filename = '') {
  return filename.split('.').pop().toLowerCase();
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

export default function Dashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAndroidDialog, setShowAndroidDialog] = useState(false);
  const [androidDownloadUrl, setAndroidDownloadUrl] = useState('');

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

  const getTooltip = (filename) => {
    const ext = getFileExtension(filename);
    if (problematicTypes.includes(ext)) {
      return 'On Android, this file type may not download automatically. If you see a blank page, long-press and choose "Download link" or try a different browser.';
    }
    return '';
  };

  const handleDownload = (url, name) => {
    if (isAndroid()) {
      setAndroidDownloadUrl(url);
      setShowAndroidDialog(true);
    } else {
      // Use forceDownload for desktop/other platforms
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.setAttribute('download', name || 'download');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(() => {
          window.open(url, '_blank');
        });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <LogoutButton />
      <Typography variant="h4" gutterBottom>My Files</Typography>
      {loading ? <CircularProgress /> : (
        <List>
          {files.length === 0 && <Typography>No files uploaded for you yet.</Typography>}
          {files.map((file, idx) => {
            const tooltip = getTooltip(file.name);
            return (
              <ListItem key={idx} divider>
                <ListItemText primary={file.name} secondary={file.uploadedAt?.toDate?.().toLocaleString?.() || file.error || ''} />
                {file.url ? (
                  <Tooltip title={tooltip || (isAndroid() ? "If the file doesn't download, long-press and choose 'Download link'." : "") } arrow>
                    <Button variant="contained" onClick={() => handleDownload(file.url, file.name)}>
                      Download
                    </Button>
                  </Tooltip>
                ) : (
                  <Typography color="error" variant="body2">{file.error || 'Unavailable'}</Typography>
                )}
              </ListItem>
            );
          })}
        </List>
      )}
      <Dialog open={showAndroidDialog} onClose={() => setShowAndroidDialog(false)}>
        <DialogTitle>Download on Android</DialogTitle>
        <DialogContent>
          <Typography>
            Android browsers may not download certain file types automatically. To save this file:
            <ol>
              <li>Tap the button below to open the file in a new tab.</li>
              <li>Long-press the file in the new tab and select <b>Download link</b> or <b>Save link as...</b></li>
              <li>Choose your desired location to save the file.</li>
            </ol>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAndroidDialog(false)}>Cancel</Button>
          <a href={androidDownloadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Button variant="contained" onClick={() => setShowAndroidDialog(false)}>
              Open File in New Tab
            </Button>
          </a>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
