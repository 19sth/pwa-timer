import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePageState } from '../redux/slicePage';
import { RootState } from '../redux/store';
import { Timer } from '../redux/sliceTimer';

export default function Main() {
    const dispatch = useDispatch();
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
                            className="bg-white rounded-lg shadow p-4 flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{timer.name}</h3>
                                <p className="text-gray-600">{timer.goalMinutes} minutes</p>
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