import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { PatientRow } from './PatientRow';
import { Pagination } from './Pagination';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export interface Patient {
  patient_id: string;
  fetch_status?: string | null;
  last_log: string | null;
  status?: string; // Appended by frontend state
}

export function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const limit = 50;

  // Initialize WebSockets
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('patient_status_update', (data: { patientId: string, status: string, log: string }) => {
      setPatients((prev) => 
        prev.map(p => {
          // If we receive an update for a patient, mutate its status and log
          if (String(p.patient_id) === String(data.patientId)) {
            return { ...p, status: data.status, last_log: data.log };
          }
          return p;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Page Data
  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await axios.get(`${API_URL}/patients?page=${page}&limit=${limit}`);
        
        const loadedPatients = response.data.patients.map((p: any) => {
          let status = p.fetch_status || 'Pending';
          return { ...p, status };
        });

        setPatients(loadedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    }
    fetchPatients();
  }, [page]);

  const handleProcessBatch = async () => {
    if (patients.length === 0) return;
    setIsProcessing(true);
    try {
      const patientIds = patients.map(p => p.patient_id);
      await axios.post(`${API_URL}/process-batch`, { patients: patientIds });
      
      // Setting status locally ahead of time for immediate feedback
      setPatients(prev => prev.map(p => 
        p.status === 'Pending' ? { ...p, status: 'Queued', last_log: 'Added to queue' } : p
      ));
    } catch (err) {
      console.error('Failed to trigger batch processing', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card">
      <div className="header" style={{ padding: '1.5rem', marginBottom: 0, borderBottom: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Patient Synchronization</h2>
          <p className="page-info" style={{ marginTop: '0.25rem' }}>Page {page} • 50 records per page</p>
        </div>
        <button 
          className="btn-primary p-1" 
          onClick={handleProcessBatch}
          disabled={isProcessing || patients.every(p => p.status === 'Success')}
        >
          {isProcessing ? 'Processing Batch...' : 'Upload files'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Status</th>
              <th>Last Log Message</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map(p => (
                <PatientRow key={p.patient_id} patient={p} />
              ))
            ) : (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading or No data available...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={page} 
        onNext={() => setPage(p => p + 1)} 
        onPrev={() => setPage(p => Math.max(1, p - 1))} 
        hasNextPage={patients.length === limit} // simplistic approach
      />
    </div>
  );
}
