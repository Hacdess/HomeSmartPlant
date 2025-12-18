import { AlertCircle } from 'lucide-react';
import type { LogData } from '../../types/logs.type';

interface LogEntry {
  logId: string;
  userId: string;
  type: string;
  message: string;
  timestamp: string;
  formattedDateTime: string;
  typeDisplay: string;
  relativeTime?: string;
}

interface LogTableProps {
  logs: Array<LogData & {
    formattedDateTime: string;
    typeDisplay: string;
    relativeTime: string;
  }>;
}

export default function LogTable({ logs }: LogTableProps) {
  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'success':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'info':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-600 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-400" />
        <h3 className="text-slate-100 text-xl font-semibold">
          ESP Log - Warning & Notifications
        </h3>
      </div>
        {/* Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
            {/* Table Head */}
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-300 font-medium">No.</th>
              <th className="text-left py-3 px-4 text-slate-300 font-medium">ID</th>
              <th className="text-left py-3 px-4 text-slate-300 font-medium">Date Time</th>
              <th className="text-left py-3 px-4 text-slate-300 font-medium">Content</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  No logs available
                </td>
              </tr>
            ) : (
              logs.map((log, index)=> (
                <tr
                  key={log.logId}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                > 
                  {/* Index */}
                  <td className="py-3 px-4 text-slate-400">{index + 1}</td>
                  {/* Log ID */}
                  <td className="py-3 px-4 text-slate-400">{log.logId}</td>
                  {/* Date Time */}
                  <td className="py-3 px-4 text-slate-400">
                    <div>{log.formattedDateTime}</div>
                    <div className="text-xs text-slate-500">{log.relativeTime}</div>
                  </td>
                  {/* Type & Content */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeClass(
                          log.type
                        )}`}
                      >
                        {log.typeDisplay}
                      </span>
                      <span className="text-slate-300">{log.message}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}