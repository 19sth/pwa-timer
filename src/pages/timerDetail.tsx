import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageState } from '../redux/slicePage';
import { RootState } from '../redux/store';
import { Timer, deleteTimer, addSession } from '../redux/sliceTimer';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

export default function TimerDetail() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sessionDuration, setSessionDuration] = useState('');
    
    const timer = useSelector((state: RootState) => 
        state.timer.timers.find((t: Timer) => t.id === parseInt(id || '0', 10))
    );

    const handleDelete = () => {
        if (timer) {
            dispatch(deleteTimer(timer.id));
            navigate('/');
        }
    };

    const handleAddSession = () => {
        if (timer && sessionDuration) {
            dispatch(addSession({
                timerId: timer.id,
                session: {
                    duration: parseInt(sessionDuration, 10),
                    date: new Date().toISOString()
                }
            }));
            setSessionDuration('');
            setIsDialogOpen(false);
        }
    };

    useEffect(() => {
        dispatch(updatePageState({
            navItems: [],
            title: timer?.name || "Timer Details"
        }));
    }, [dispatch, timer]);

    if (!timer) {
        return <div className="p-4 text-center text-gray-500">Timer not found</div>;
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-2">{timer.name}</h2>
                        <p className="text-gray-600">Goal: {timer.goalMinutes} minutes</p>
                        <p className="text-sm text-gray-400">
                            Created: {new Date(timer.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDelete}
                        className="mt-2"
                    >
                        Delete Timer
                    </Button>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Sessions</h3>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        Add Session
                    </Button>
                </div>
                {timer.sessions && timer.sessions.length > 0 ? (
                    <div className="space-y-3">
                        {timer.sessions.map((session, index) => (
                            <div key={index} className="bg-white rounded-lg shadow p-3">
                                <p className="text-gray-600">
                                    Duration: {session.duration} minutes
                                </p>
                                <p className="text-sm text-gray-400">
                                    {new Date(session.date).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No sessions recorded yet</p>
                )}

                <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                    <DialogTitle>Add New Session</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Duration (minutes)"
                            type="number"
                            fullWidth
                            value={sessionDuration}
                            onChange={(e) => setSessionDuration(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSession} color="primary">
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}