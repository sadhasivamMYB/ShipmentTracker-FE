import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form'; // Wait, I will use react-hook-form
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  CircularProgress 
} from '@mui/material';
import { login } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

import { useLoginMutation } from '../services/appApi';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('user@company.com');
  const [password, setPassword] = useState('password123');
  const [loginApi, { isLoading: loading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await loginApi({ email, password }).unwrap();
      const { user, token } = response;
      
      dispatch(login({ user, token }));
      toast.success(`Successfully logged in as ${user.role}`);
      
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to login');
    }
  };


  return (
    <Box className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-6">
        <CardContent>
          <Box className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl mb-4 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-2xl">ERP</span>
            </div>
            <Typography variant="h5" fontWeight="bold" className="text-gray-900">
              Welcome back
            </Typography>
            <Typography variant="body2" className="text-gray-500 mt-1">
              Please enter your details to sign in.
            </Typography>
          </Box>


          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField 
              label="Email" 
              variant="outlined" 
              fullWidth 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField 
              label="Password" 
              type="password" 
              variant="outlined" 
              fullWidth 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Box className="flex justify-between items-center -mt-2">
              <FormControlLabel 
                control={<Checkbox defaultChecked color="primary" />} 
                label={<Typography variant="body2" className="text-gray-600">Remember me</Typography>} 
              />
              <Typography variant="body2" color="primary" className="cursor-pointer hover:underline">
                Forgot password?
              </Typography>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large" 
              fullWidth
              disabled={loading}
              className="mt-4 py-3"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
