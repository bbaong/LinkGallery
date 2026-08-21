import { Route, Routes } from "react-router-dom";
import { AppProviders } from "./app/AppProviders";
import { LandingPage } from "./app/pages/LandingPage";
import { NotFoundPage } from "./app/pages/NotFoundPage";
import { ProtectedRoute } from "./app/routes/ProtectedRoute";
import { PublicOnlyRoute } from "./app/routes/PublicOnlyRoute";
import { LoginPage } from "./domains/auth/pages/LoginPage";
import { SignupPage } from "./domains/auth/pages/SignupPage";
import { SettingsPage } from "./domains/auth/pages/SettingsPage";
import { DashboardPage } from "./domains/folders/pages/DashboardPage";
import { FolderDetailPage } from "./domains/folders/pages/FolderDetailPage";

export default function App() {
  return (
    <AppProviders>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/folders/:folderId" element={<FolderDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppProviders>
  );
}
