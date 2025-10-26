import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageState } from '../redux/slicePage';
import { RootState } from '../redux/store';
import { Timer, deleteTimer, addSession, endSession } from '../redux/sliceTimer';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

export default function TimerDetail() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [selectedSessionIndex, setSelectedSessionIndex] = useState<number | null>(null);
    const [endTime, setEndTime] = useState('');
    const [isEndSessionDialogOpen, setIsEndSessionDialogOpen] = useState(false);
    
    const timer = useSelector((state: RootState) => 
        state.timer.timers.find((t: Timer) => t.id === parseInt(id || '0', 10))
    );

    const handleDelete = () => {
        if (timer) {
            dispatch(deleteTimer(timer.id));
            navigate('/');
        }
    };

    const handleAddSession = (startNow: boolean = false) => {
        if (!timer) return;
        
        const now = new Date();
        let sessionStartTime: Date;
        
        if (startNow) {
            sessionStartTime = now;
        } else {
            if (!startTime) return;
            
            // Parse the time string (HH:mm) and combine with today's date
            const [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));
            sessionStartTime = new Date();
            sessionStartTime.setHours(hours, minutes, 0, 0);
            
            // If the time is earlier than now, assume it's for tomorrow
            if (sessionStartTime < now) {
                sessionStartTime.setDate(sessionStartTime.getDate() + 1);
            }
        }

        dispatch(addSession({
            timerId: timer.id,
            session: {
                startTime: sessionStartTime.toISOString(),
                date: new Date().toISOString()
            }
        }));
        
        setStartTime('');
        setIsDialogOpen(false);
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
                            <div 
                                key={index} 
                                className="bg-white rounded-lg shadow p-3 cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                    if (!session.duration) {
                                        setSelectedSessionIndex(index);
                                        setIsEndSessionDialogOpen(true);
                                    }
                                }}
                            >
                                <p className="text-gray-600">
                                    Started: {new Date(session.startTime).toLocaleString()}
                                </p>
                                {session.duration && (
                                    <p className="text-gray-600">
                                        Duration: {session.duration} minutes
                                    </p>
                                )}
                                {!session.duration && (
                                    <p className="text-green-600">
                                        Session in progress
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No sessions recorded yet</p>
                )}

                <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                    <DialogTitle>Start New Session</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Start Time"
                            type="time"
                            fullWidth
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => handleAddSession()} color="primary">
                            Start at Selected Time
                        </Button>
                        <Button onClick={() => handleAddSession(true)} color="primary" variant="contained">
                            Start Now
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* End Session Dialog */}
                <Dialog open={isEndSessionDialogOpen} onClose={() => setIsEndSessionDialogOpen(false)}>
                    <DialogTitle>End Session</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="End Time"
                            type="time"
                            fullWidth
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setIsEndSessionDialogOpen(false);
                            setEndTime('');
                        }}>Cancel</Button>
                        <Button onClick={() => {
                            if (selectedSessionIndex !== null && timer) {
                                const session = timer.sessions[selectedSessionIndex];
                                const startTime = new Date(session.startTime);
                                let endDateTime;
                                
                                if (endTime) {
                                    // Parse the time string (HH:mm)
                                    const [hours, minutes] = endTime.split(':').map(num => parseInt(num, 10));
                                    endDateTime = new Date();
                                    endDateTime.setHours(hours, minutes, 0, 0);
                                    
                                    // If the end time is earlier than start time, assume it's for the next day
                                    if (endDateTime < startTime) {
                                        endDateTime.setDate(endDateTime.getDate() + 1);
                                    }
                                } else {
                                    // End now
                                    endDateTime = new Date();
                                }
                                
                                // Calculate duration in minutes
                                const duration = Math.round((endDateTime.getTime() - startTime.getTime()) / (1000 * 60));
                                
                                dispatch(endSession({
                                    timerId: timer.id,
                                    sessionIndex: selectedSessionIndex,
                                    duration
                                }));
                                
                                setIsEndSessionDialogOpen(false);
                                setSelectedSessionIndex(null);
                                setEndTime('');
                            }
                        }} color="primary" variant="contained">
                            End Session
                        </Button>
                        <Button onClick={() => {
                            if (selectedSessionIndex !== null && timer) {
                                const session = timer.sessions[selectedSessionIndex];
                                const startTime = new Date(session.startTime);
                                const endDateTime = new Date(); // End now
                                const duration = Math.round((endDateTime.getTime() - startTime.getTime()) / (1000 * 60));
                                
                                dispatch(endSession({
                                    timerId: timer.id,
                                    sessionIndex: selectedSessionIndex,
                                    duration
                                }));
                                
                                setIsEndSessionDialogOpen(false);
                                setSelectedSessionIndex(null);
                                setEndTime('');
                            }
                        }} color="secondary">
                            End Now
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}