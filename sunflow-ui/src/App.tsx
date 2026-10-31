import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/DashboardLayout'
import OverviewPage from './pages/OverviewPage'
import LeadsPage from './pages/LeadsPage'
import EnquiriesPage from './pages/EnquiriesPage'
import SurveysPage from './pages/SurveysPage'
import ComingSoonPage from './pages/ComingSoonPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/enquiries" element={<EnquiriesPage />} />
          <Route path="/surveys" element={<SurveysPage />} />
          <Route path="/quotations" element={<ComingSoonPage title="Quotations" />} />
          <Route path="/orders" element={<ComingSoonPage title="Orders" />} />
          <Route path="/inventory" element={<ComingSoonPage title="Inventory" />} />
          <Route path="/installations" element={<ComingSoonPage title="Installations" />} />
          <Route path="/service" element={<ComingSoonPage title="Service & Warranty" />} />
          <Route path="/analytics" element={<ComingSoonPage title="Analytics" />} />
          <Route path="/settings" element={<ComingSoonPage title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
