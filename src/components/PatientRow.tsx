import React from 'react';
import type { Patient } from './Dashboard';

interface PatientRowProps {
  patient: Patient;
}

export function PatientRow({ patient }: PatientRowProps) {
  // Safe default
  const statusStr = patient.status || 'Pending';

  return (
    <tr>
      <td style={{ fontWeight: 500 }}>{patient.patient_id}</td>
      <td>
        <span className={`status-badge status-${statusStr}`}>
          {statusStr}
        </span>
      </td>
      <td>
        <div className="log-message" title={patient.last_log || 'N/A'}>
          {patient.last_log || '-'}
        </div>
      </td>
    </tr>
  );
}
