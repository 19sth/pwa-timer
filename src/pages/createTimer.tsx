import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addTimer } from '../redux/sliceTimer';

const CreateTimer: React.FC = () => {
  const dispatch = useDispatch();
  const [timerName, setTimerName] = useState('');
  const [goalMinutes, setGoalMinutes] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!timerName.trim() || !goalMinutes) {
      return;
    }

    const timer = {
      id: Date.now(),
      name: timerName.trim(),
      goalMinutes: parseInt(goalMinutes, 10),
      createdAt: new Date().toISOString()
    };

    // Dispatch action to add timer to Redux store
    dispatch(addTimer(timer));

    // Reset form
    setTimerName('');
    setGoalMinutes('');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create Timer
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="timerName"
            label="Timer Name"
            name="timerName"
            autoFocus
            value={timerName}
            onChange={(e) => setTimerName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="goalMinutes"
            label="Goal (minutes)"
            name="goalMinutes"
            type="number"
            value={goalMinutes}
            onChange={(e) => setGoalMinutes(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Create Timer
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateTimer;