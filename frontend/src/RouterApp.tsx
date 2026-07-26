import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./layout/AppLayout";
import { AllPage, BookmarksPage, CollectionsPage } from "./pages";

const navItems = [
  { label: "All Vault", to: "/" },
  { label: "Collections", to: "/collections" },
  { label: "Bookmarks", to: "/bookmarks" }
];

function RouterApp() {
  return (
    <BrowserRouter>
      <AppLayout navItems={navItems}>
        <Routes>
          <Route path="/" element={<AllPage />} />
          <Route path="/callback" element={<AllPage />} />
          <Route path="/me" element={<Navigate to="/" replace />} />
          <Route path="/status" element={<Navigate to="/" replace />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/all" element={<AllPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default RouterApp;