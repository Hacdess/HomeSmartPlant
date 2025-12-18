export interface LogData { // from system_logs table
    logId: string;  
    userId: string;
    type: string;
    message: string;
    timestamp: string;
}