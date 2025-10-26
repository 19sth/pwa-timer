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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const timer = useSelector((state: RootState) => 
        state.timer.timers.find((t: Timer) => t.id === parseInt(id || '0', 10))
    );

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (timer) {
            dispatch(deleteTimer(timer.id));
            setIsDeleteDialogOpen(false);
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
            navItems: [
                {
                    icon: "Add",
                    link: "#",
                    onClick: () => setIsDialogOpen(true)
                },
                {
                    icon: "Delete",
                    link: "#",
                    onClick: handleDelete,
                }
            ],
            title: timer?.name || "Timer Details"
        }));
    }, [dispatch, timer]);

    if (!timer) {
        return <div className="p-4 text-center text-gray-500">Timer not found</div>;
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <div>
                    <h2 className="text-xl font-bold mb-2">{timer.name}</h2>
                    <p className="text-gray-600">Goal: {timer.goalMinutes} minutes</p>
                    <p className="text-sm text-gray-400">
                        Created: {new Date(timer.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Sessions</h3>
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
                        <div className="space-y-4">
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => handleAddSession(true)}
                            >
                                Start Session Now
                            </Button>
                            
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-sm text-gray-500">or start with specific time</span>
                                </div>
                            </div>

                            <TextField
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
                            
                            <div className="flex justify-end gap-2 mt-4">
                                <Button onClick={() => {
                                    setIsDialogOpen(false);
                                    setStartTime('');
                                }}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => handleAddSession()} 
                                    color="primary" 
                                    variant="contained"
                                    disabled={!startTime}
                                >
                                    Start with Time
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* End Session Dialog */}
                <Dialog open={isEndSessionDialogOpen} onClose={() => setIsEndSessionDialogOpen(false)}>
                    <DialogTitle>End Session</DialogTitle>
                    <DialogContent>
                        <div className="space-y-4">
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={() => {
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
                                }}
                            >
                                End Session Now
                            </Button>
                            
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-sm text-gray-500">or end with specific time</span>
                                </div>
                            </div>

                            <TextField
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
                            
                            <div className="flex justify-end gap-2 mt-4">
                                <Button onClick={() => {
                                    setIsEndSessionDialogOpen(false);
                                    setEndTime('');
                                }}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => {
                                        if (selectedSessionIndex !== null && timer && endTime) {
                                            const session = timer.sessions[selectedSessionIndex];
                                            const startTime = new Date(session.startTime);
                                            
                                            // Parse the time string (HH:mm)
                                            const [hours, minutes] = endTime.split(':').map(num => parseInt(num, 10));
                                            const endDateTime = new Date();
                                            endDateTime.setHours(hours, minutes, 0, 0);
                                            
                                            // If the end time is earlier than start time, assume it's for the next day
                                            if (endDateTime < startTime) {
                                                endDateTime.setDate(endDateTime.getDate() + 1);
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
                                    }} 
                                    color="primary" 
                                    variant="contained"
                                    disabled={!endTime}
                                >
                                    End with Time
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        Are you sure you want to delete this timer? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmDelete} color="error" variant="contained">
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}