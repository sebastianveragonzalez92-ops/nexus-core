import React from 'react';
import CertificateViewer from '../components/certificates/CertificateViewer';

export default function Certificates() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <CertificateViewer />
      </div>
    </div>
  );
}