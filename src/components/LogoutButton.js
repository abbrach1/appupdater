import React from 'react';
import { useAuth } from './AuthProvider';
import { Button, Box } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <Box sx={{ textAlign: 'right', mb: 2 }}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={async () => {
          await signOut(auth);
          navigate('/login');
        }}
      >
        Logout
      </Button>
    </Box>
  );
}
