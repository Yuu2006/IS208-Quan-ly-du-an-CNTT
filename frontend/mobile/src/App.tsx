import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { getBatches } from './api';
import { Batch, Certificate, batches as sampleBatches } from './data';
import { PhoneFrame, RequireRole } from './shared/ui';
import { Landing, Login, Scanner, Trace } from './pages/PublicPages';
import { SettingsPage } from './pages/SettingsPage';
import { CustomerHome, ScanHistory } from './roles/inspector/InspectorPages';
import { BatchDetail, BatchForm, BatchList, FarmDashboard } from './roles/farm/FarmPages';
import { DriverDashboard, TransportCheckpointUpdate } from './roles/transporter/TransporterPages';
import { StoreDashboard, StoreIssueDetail, StoreIssueHistory, StoreIssueReport, StoreReceiptDetail, StoreReceiptHistory, StoreReceiveDetail } from './roles/store/StorePages';

function AppContent() {
  const { user } = useAuth();
  const [farmBatches, setFarmBatches] = useState<Batch[]>(sampleBatches);
  const [apiBatches, setApiBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'farm' && user.role !== 'inspector')) {
      setApiBatches([]);
      setFarmBatches(sampleBatches);
      return;
    }

    let active = true;

    getBatches()
      .then((items) => {
        if (active) {
          setApiBatches(items);
          setFarmBatches(items);
        }
      })
      .catch(() => {
        if (active) {
          setApiBatches([]);
          setFarmBatches(sampleBatches);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.id, user?.role]);

  function createBatch(batch: Batch) {
    setFarmBatches((items) => [batch, ...items]);
  }

  function updateBatch(batch: Batch) {
    setFarmBatches((items) => items.map((item) => item.id === batch.id ? batch : item));
  }

  function deleteBatch(id: string) {
    setFarmBatches((items) => items.filter((item) => item.id !== id));
  }

  function updateCertificates(batchId: string, certifications: Certificate[]) {
    setFarmBatches((items) => items.map((item) => item.id === batchId ? { ...item, certifications } : item));
  }

  return (
    <PhoneFrame>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/trace/:id" element={<Trace />} />
          <Route path="/inspector" element={<RequireRole role="inspector"><CustomerHome batches={apiBatches} /></RequireRole>} />
          <Route path="/inspector/history" element={<RequireRole role="inspector"><ScanHistory batches={apiBatches} /></RequireRole>} />
          <Route path="/customer" element={<Navigate to="/inspector" replace />} />
          <Route path="/customer/history" element={<Navigate to="/inspector/history" replace />} />
          <Route path="/farm" element={<RequireRole role="farm"><FarmDashboard batches={farmBatches} /></RequireRole>} />
          <Route path="/farm/batches" element={<RequireRole role="farm"><BatchList batches={farmBatches} /></RequireRole>} />
          <Route path="/farm/batches/create" element={<RequireRole role="farm"><BatchForm batches={farmBatches} onSave={createBatch} /></RequireRole>} />
          <Route path="/farm/batches/:id" element={<RequireRole role="farm"><BatchDetail batches={farmBatches} onDelete={deleteBatch} onCertificatesChange={updateCertificates} onTransportAssigned={updateBatch} /></RequireRole>} />
          <Route path="/farm/batches/:id/edit" element={<RequireRole role="farm"><BatchForm batches={farmBatches} onSave={updateBatch} /></RequireRole>} />
          <Route path="/transporter" element={<RequireRole role="transporter"><DriverDashboard /></RequireRole>} />
          <Route path="/transporter/checkpoint" element={<RequireRole role="transporter"><TransportCheckpointUpdate /></RequireRole>} />
          <Route path="/transporter/update" element={<RequireRole role="transporter"><TransportCheckpointUpdate /></RequireRole>} />
          <Route path="/transporter/incident" element={<Navigate to="/transporter/checkpoint" replace />} />
          <Route path="/transporter/history" element={<Navigate to="/transporter" replace />} />
          <Route path="/driver" element={<Navigate to="/transporter" replace />} />
          <Route path="/driver/checkin" element={<Navigate to="/transporter/checkpoint" replace />} />
          <Route path="/driver/temperature" element={<Navigate to="/transporter/update" replace />} />
          <Route path="/driver/trip-edit" element={<Navigate to="/transporter/update" replace />} />
          <Route path="/store" element={<RequireRole role="store"><StoreDashboard /></RequireRole>} />
          <Route path="/store/report" element={<RequireRole role="store"><StoreIssueReport /></RequireRole>} />
          <Route path="/store/report/:id" element={<RequireRole role="store"><StoreIssueReport /></RequireRole>} />
          <Route path="/store/receive/:id" element={<RequireRole role="store"><StoreReceiveDetail /></RequireRole>} />
          <Route path="/store/receipts" element={<RequireRole role="store"><StoreReceiptHistory /></RequireRole>} />
          <Route path="/store/receipts/:id" element={<RequireRole role="store"><StoreReceiptDetail /></RequireRole>} />
          <Route path="/store/issues" element={<RequireRole role="store"><StoreIssueHistory /></RequireRole>} />
          <Route path="/store/issues/:id" element={<RequireRole role="store"><StoreIssueDetail /></RequireRole>} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PhoneFrame>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
