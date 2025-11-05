import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageState } from '../redux/slicePage';
import { RootState } from '../redux/store';
import { Timer, deleteTimer, addSession, endSession, clearSessions } from '../redux/sliceTimer';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { calculateCompletedMinutes } from '../utils/calc';

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
    const [isClearSessionsDialogOpen, setIsClearSessionsDialogOpen] = useState(false);
    
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
            
            // Parse the time string (HH:mm) and combine with today's date only
            const [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));
            sessionStartTime = new Date();
            sessionStartTime.setHours(hours, minutes, 0, 0);
            
            // Always use today's date - do not allow future dates
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

    const handleClearSessions = () => {
        setIsClearSessionsDialogOpen(true);
    };

    const handleConfirmClearSessions = () => {
        if (timer) {
            dispatch(clearSessions(timer.id));
            setIsClearSessionsDialogOpen(false);
        }
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
                    icon: "Refresh",
                    link: "#",
                    onClick: handleClearSessions,
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
                    <p className="text-gray-600">
                        Completed: {timer.sessions.reduce((total, session) => {
                            if (session.endTime) {
                                const start = new Date(session.startTime).getTime();
                                const end = new Date(session.endTime).getTime();
                                const duration = end - start;
                                return total + Math.floor(duration / 60000);
                            }
                            return total;
                        }, 0)} minutes
                    </p>
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
                                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => {
                                    if (!session.endTime) {
                                        setSelectedSessionIndex(index);
                                        setIsEndSessionDialogOpen(true);
                                    }
                                }}
                            >
                                <div className="flex flex-col">
                                    {/* Timeline visualization */}
                                    <div className="flex items-center mb-2">
                                        {/* Start dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`${!session.endTime ? 'w-5 h-5 animate-pulse' : 'w-4 h-4 border-2 border-gray-400'} rounded-full`} style={!session.endTime ? {backgroundColor: '#65a30d'} : {}}></div>
                                            <div className="text-xs text-gray-600 mt-1 font-mono">
                                                {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                                            </div>
                                        </div>
                                        
                                        {/* Horizontal connecting line */}
                                        {session.endTime && (
                                            <>
                                                <div className="h-0.5 flex-1 mx-2 self-start mt-2" style={{background: 'linear-gradient(to right, #9ca3af, #65a30d)'}}></div>
                                                {/* End dot */}
                                                <div className="flex flex-col items-center">
                                                    <div className="w-5 h-5 rounded-full" style={{backgroundColor: '#65a30d'}}></div>
                                                    <div className="text-xs text-gray-600 mt-1 font-mono">
                                                        {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        
                                        {/* Animated horizontal line for in-progress sessions */}
                                        {!session.endTime && (
                                            <>
                                                <div className="h-0.5 flex-1 mx-2 self-start mt-2 animate-pulse" style={{background: 'linear-gradient(to right, #65a30d, #9ca3af)'}}></div>
                                                {/* End dot for in-progress (gray) */}
                                                <div className="flex flex-col items-center">
                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                                                    <div className="text-xs text-gray-400 mt-1 font-mono">
                                                        --:--
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Duration below timeline */}
                                    <div className="text-center -mt-5">
                                        {session.endTime ? (
                                            <p className="text-sm text-gray-600">
                                                {calculateCompletedMinutes([session])} minutes
                                            </p>
                                        ) : (
                                            <p className="text-sm animate-pulse" style={{color: '#65a30d'}}>
                                                {Math.floor((new Date().getTime() - new Date(session.startTime).getTime()) / 60000)} minutes
                                            </p>
                                        )}
                                    </div>
                                    
                                    {/* Session info */}
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-600 text-center mt-1">
                                            {new Date(session.startTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
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

                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Select time for today ({new Date().toLocaleDateString()})
                                </p>
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
                            </div>
                            
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
                                            endTime: endDateTime.toISOString()
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

                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    Select end time for the same day as session start
                                </p>
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
                            </div>
                            
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
                                            
                                            // Parse the time string (HH:mm) and use the same date as start time
                                            const [hours, minutes] = endTime.split(':').map(num => parseInt(num, 10));
                                            const endDateTime = new Date(startTime);
                                            endDateTime.setHours(hours, minutes, 0, 0);
                                            
                                            // Always use the same date as the start time - no date changes allowed
                                            
                                            // Calculate duration in minutes
                                            const duration = Math.round((endDateTime.getTime() - startTime.getTime()) / (1000 * 60));
                                            
                                            dispatch(endSession({
                                                timerId: timer.id,
                                                sessionIndex: selectedSessionIndex,
                                                endTime: endDateTime.toISOString()
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

                {/* Clear Sessions Confirmation Dialog */}
                <Dialog open={isClearSessionsDialogOpen} onClose={() => setIsClearSessionsDialogOpen(false)}>
                    <DialogTitle>Clear All Sessions</DialogTitle>
                    <DialogContent>
                        Are you sure you want to clear all sessions for this timer? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsClearSessionsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleConfirmClearSessions} color="error" variant="contained">
                            Clear All Sessions
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}