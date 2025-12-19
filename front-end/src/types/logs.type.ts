export interface LogData { // from system_logs table
    content: string;
    created_at: string | null;
    type: string;
}