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
import { CleaningRecordsReportPage } from "./pages/CleaningRecordsReportPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UsersPage } from "./pages/UsersPage";
import { AdminRoute } from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/cleaning/:slug" element={<PublicCleaningPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entities"
          element={
            <ProtectedRoute>
              <EntitiesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entities/new"
          element={
            <ProtectedRoute>
              <NewEntityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entities/qr-report"
          element={
            <ProtectedRoute>
              <QrReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entities/:slug/qr-print"
          element={
            <ProtectedRoute>
              <QrPrintPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entities/:slug/edit"
          element={
            <ProtectedRoute>
              <EditEntityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/entities/:slug"
          element={
            <ProtectedRoute>
              <EntityDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/cleaning-records"
          element={
            <ProtectedRoute>
              <CleaningRecordsReportPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;