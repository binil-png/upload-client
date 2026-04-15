import React from 'react';
import type { Patient } from './Dashboard';

interface PatientRowProps {
  patient: Patient;
}

export function PatientRow({ patient }: PatientRowProps) {
  // Safe default
  const statusStr = patient.status || 'Pending';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Uploading': return 'bg-blue-100 text-blue-700 border border-blue-200 animate-pulse-fast';
      case 'Queued': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Success': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Error': return 'bg-red-100 text-red-700 border border-red-200';
      case 'Pending':
      default: return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="data-cell font-medium text-slate-700">{patient.patient_id}</td>
      <td className="data-cell">
        <span className={`status-badge ${getStatusColor(statusStr)}`}>
          {statusStr === 'Uploading' && (
            <svg className="animate-spin -ml-0.5 mr-1 h-2.5 w-2.5 inline text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {statusStr === 'Success' && (
            <svg className="w-2.5 h-2.5 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          )}
          {statusStr}
        </span>
      </td>
      <td className="data-cell">
        <div 
          className={`flex items-center tracking-tight leading-tight ${
            statusStr === 'Error' ? 'text-red-600' : 'text-slate-500'
          }`} 
          title={patient.last_log || 'N/A'}
        >
          <span className="truncate max-w-[200px] sm:max-w-[300px]">
             {patient.last_log || '—'}
          </span>
        </div>
      </td>
    </tr>
  );
}
