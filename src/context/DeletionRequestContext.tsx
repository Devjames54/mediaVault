import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DeletionRequest {
  id: string;
  mediaId: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

interface DeletionRequestContextType {
  requests: DeletionRequest[];
  addRequest: (mediaId: string, reason: string) => void;
  resolveRequest: (id: string) => void;
  deleteRequest: (id: string) => void;
}

const DeletionRequestContext = createContext<DeletionRequestContextType | undefined>(undefined);

export function DeletionRequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<DeletionRequest[]>(() => {
    const saved = localStorage.getItem('deletion_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('deletion_requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = (mediaId: string, reason: string) => {
    const newRequest: DeletionRequest = {
      id: Math.random().toString(36).substr(2, 9),
      mediaId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const resolveRequest = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'resolved' } : req));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <DeletionRequestContext.Provider value={{ requests, addRequest, resolveRequest, deleteRequest }}>
      {children}
    </DeletionRequestContext.Provider>
  );
}

export function useDeletionRequests() {
  const context = useContext(DeletionRequestContext);
  if (context === undefined) {
    throw new Error('useDeletionRequests must be used within a DeletionRequestProvider');
  }
  return context;
}
