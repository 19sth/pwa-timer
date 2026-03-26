import { Session } from "../redux/sliceTimer";

export const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    return parts.join(' ');
};

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