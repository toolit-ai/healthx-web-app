import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import RunSetup from '@/pages/RunSetup'
import DataAndDQ from '@/pages/DataAndDQ'
import DocumentsAndRules from '@/pages/DocumentsAndRules'
import ReviewGates from '@/pages/ReviewGates'
import BLEDAFindings from '@/pages/BLEDAFindings'
import AskDocuments from '@/pages/AskDocuments'
import Reports from '@/pages/Reports'
import StatusChat from '@/pages/StatusChat'

export default function App() {
  return (
    <BrowserRouter basename="/healthx-web-app">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/run-setup" element={<RunSetup />} />
          <Route path="/data-dq" element={<DataAndDQ />} />
          <Route path="/documents-rules" element={<DocumentsAndRules />} />
          <Route path="/review-gates" element={<ReviewGates />} />
          <Route path="/findings" element={<BLEDAFindings />} />
          <Route path="/ask-documents" element={<AskDocuments />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/status" element={<StatusChat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
