import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { updatePageState } from '../redux/slicePage';
import { RootState } from '../redux/store';
import { Timer } from '../redux/sliceTimer';

export default function TimerDetail() {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const timer = useSelector((state: RootState) => 
        state.timer.timers.find((t: Timer) => t.id === parseInt(id || '0', 10))
    );

    useEffect(() => {
        dispatch(updatePageState({
            navItems: [
                { icon: "ArrowBack", link: "./" }
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
                <h2 className="text-xl font-bold mb-2">{timer.name}</h2>
                <p className="text-gray-600">Goal: {timer.goalMinutes} minutes</p>
                <p className="text-sm text-gray-400">
                    Created: {new Date(timer.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Sessions</h3>
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
            </div>
        </div>
    );
}