import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Box, Button, Container, Typography, Alert, CircularProgress, MenuItem, Select, InputLabel, FormControl, TextField, Paper, Tabs, Tab } from '@mui/material';
import LogoutButton from './LogoutButton';

export default function AdminUserEditor() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError('');
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const userArr = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userArr);
      } catch (err) {
        setError('Could not fetch users: ' + err.message);
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null);
      return;
    }
    setSelectedUser(users.find(u => u.id === selectedUserId) || null);
  }, [selectedUserId, users]);

  const handleChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await updateDoc(doc(db, 'users', selectedUser.id), {
        email: selectedUser.email,
        displayName: selectedUser.displayName || '',
        // add more fields as needed
      });
      setSuccess('User updated successfully!');
    } catch (err) {
      setError('Failed to update user: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <LogoutButton />
      <Typography variant="h5" gutterBottom>Edit User Info</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <FormControl fullWidth margin="normal">
        <InputLabel>User</InputLabel>
        <Select
          value={selectedUserId}
          label="User"
          onChange={e => setSelectedUserId(e.target.value)}
        >
          {users.map(user => (
            <MenuItem key={user.id} value={user.id}>{user.email || user.id}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {selectedUser && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <form onSubmit={handleSave}>
            <TextField
              label="Email"
              name="email"
              value={selectedUser.email || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Display Name"
              name="displayName"
              value={selectedUser.displayName || ''}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            {/* Add more fields as needed */}
            <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ mt: 2 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </form>
        </Paper>
      )}
    </Container>
  );
}
