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
  const [page, setPage] = useState<number | null>(null); // Start with null to fetch initial page
  const [isProcessing, setIsProcessing] = useState(false);
  const limit = 50;

  // Initial load: determine the fresh batch page
  useEffect(() => {
    async function fetchInitialPage() {
      try {
        const response = await axios.get(`${API_URL}/last-batch?limit=${limit}`);
        setPage(response.data.next_page || 1);
      } catch (error) {
        console.error('Error fetching starting page:', error);
        setPage(1); // Fallback
      }
    }
    fetchInitialPage();
  }, []);

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

    socket.on('batch_complete', () => {
      // Automatically move to the next page after a small delay
      setTimeout(() => {
        setPage(prev => (prev !== null ? prev + 1 : 1));
      }, 3000); // 3-second delay to allow user to see the success logs
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Page Data
  useEffect(() => {
    if (page === null) return; // Wait for initial page detection

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
      const patientList =[]
      for(let p of patients) {
        if(p.status == "Pending"){
          patientList.push(p);
        }
      }
      await axios.post(`${API_URL}/process-batch`, { patients: patientList });
      
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
    <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden transition-all text-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="mb-2 sm:mb-0">
          {/* <h2 className="text-base font-bold text-slate-800 leading-tight">Patient Synchronization</h2> */}
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 px-1.5 rounded mr-1">Pg {page || '...'}</span>
            {limit} per page
          </p>
        </div>
        <button 
          className="btn-primary group" 
          onClick={handleProcessBatch}
          disabled={isProcessing || patients.every(p => p.status === 'Success')}
        >
          {isProcessing ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Upload
            </span>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200">
              <th className="px-3 py-1.5 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Patient ID</th>
              <th className="px-3 py-1.5 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Status</th>
              <th className="px-3 py-1.5 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider w-[60%]">Log Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {patients.length > 0 ? (
              patients.map(p => (
                <PatientRow key={p.patient_id} patient={p} />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-3 py-6 text-center text-slate-400 font-medium bg-slate-50/30 text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    <span>No data available</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination 
        currentPage={page || 1} 
        onNext={() => setPage(p => p + 1)} 
        onPrev={() => setPage(p => Math.max(1, p - 1))} 
        hasNextPage={patients.length === limit}
      />
    </div>
  );
}
