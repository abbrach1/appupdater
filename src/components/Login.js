import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert, Link as MuiLink } from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (isSignup) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        // Create user in Firestore with displayName
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          displayName: name,
          createdAt: new Date()
        });
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 2 }}>APP UPDATER LOGIN</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {isSignup && (
            <TextField margin="normal" required fullWidth label="Name" autoFocus value={name} onChange={e => setName(e.target.value)} />
          )}
          <TextField margin="normal" required fullWidth label="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>{isSignup ? 'Sign Up' : 'Sign In'}</Button>
          <MuiLink component="button" variant="body2" onClick={() => setIsSignup(!isSignup)} sx={{ mt: 1 }}>
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </MuiLink>
        </Box>
      </Box>
    </Container>
  );
}
