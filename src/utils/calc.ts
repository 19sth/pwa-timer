import { Session } from "../redux/sliceTimer";

export const calculateCompletedMinutes = (sessions: Session[]): number => {
    const totalMilliseconds = sessions.reduce((total, session) => {
        // Skip sessions without duration
        if (!session.endTime) return total;
        
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        const duration = end - start;

        return total + duration;
    }, 0);
    
    // Convert milliseconds to minutes and round down
    return Math.floor(totalMilliseconds / 60000);
};