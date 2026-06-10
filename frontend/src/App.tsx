import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PublicCleaningPage } from "./pages/PublicCleaningPage";
import { EntityDetailsPage } from "./pages/EntityDetailsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { EntitiesPage } from "./pages/EntitiesPage";
import { NewEntityPage } from "./pages/NewEntityPage";
import { QrPrintPage } from "./pages/QrPrintPage";
import { QrReportPage } from "./pages/QrReportPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EditEntityPage } from "./pages/EditEntityPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cleaning/:slug" element={<PublicCleaningPage />} />
        <Route path="/entities/:slug" element={<EntityDetailsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/entities" element={<EntitiesPage />} />
        <Route path="/entities/new" element={<NewEntityPage />} />
        <Route path="/entities/:slug/qr-print" element={<QrPrintPage />} />
        <Route path="/entities/qr-report" element={<QrReportPage />} />
        <Route path="/entities/:slug/edit" element={<EditEntityPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;