import { BrowserRouter, Routes, Route } from "react-router-dom";
import BoardPage from "./pages/BoardPage";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { SnackbarProvider } from "./components/Snackbar";

export default function App() {
  return (
    <SnackbarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<BoardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}