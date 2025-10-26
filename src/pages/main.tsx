import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updatePageState } from '../redux/slicePage';
import { RootState } from '../redux/store';
import { Timer, Session } from '../redux/sliceTimer';

const calculateCompletedMinutes = (sessions: Session[]): number => {
    const totalMilliseconds = sessions.reduce((total, session) => {
        // Skip sessions without duration
        if (!session.duration) return total;
        
        // Ensure duration is treated as a number
        const duration = typeof session.duration === 'string' 
            ? parseInt(session.duration, 10) 
            : session.duration;
            
        return total + duration;
    }, 0);
    
    // Convert milliseconds to minutes and round down
    return Math.floor(totalMilliseconds / 60000);
};

export default function Main() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const timers = useSelector((state: RootState) => state.timer.timers);

    useEffect(()=>{
        dispatch(updatePageState({
            navItems: [
                {icon: "Add", link: "./create"},
                {icon: "Info", link: "./about"},
                {icon: "ImportExport", link: "./importexport"}
            ],
            title: "My Timers"
        }));
    }, [dispatch]);

    return (
        <div className="p-4">
            {timers.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                    No timers created yet. Click the + button to create one!
                </div>
            ) : (
                <div className="space-y-4">
                    {timers.map((timer: Timer) => (
                        <div 
                            key={timer.id} 
                            className="bg-white rounded-lg shadow p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                            onClick={() => navigate(`timer/${timer.id}`)}
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{timer.name}</h3>
                                <p className="text-gray-600">
                                    {(() => {
                                        const completed = calculateCompletedMinutes(timer.sessions);
                                        console.log('Timer:', timer.name, 'Sessions:', timer.sessions);
                                        return `${completed}/${timer.goalMinutes} minutes`;
                                    })()}
                                </p>
                            </div>
                            <p className="text-sm text-gray-400">
                                {new Date(timer.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}