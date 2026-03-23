import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { PredictionPage } from "./pages/PredictionPage";

type Page = "home" | "prediction" | "dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  return (
    <div className="min-h-screen">
      <Navbar currentPage={page} onNavigate={setPage} />
      <main>
        {page === "home" && <HomePage onStart={() => setPage("prediction")} />}
        {page === "prediction" && <PredictionPage />}
        {page === "dashboard" && <DashboardPage />}
      </main>
    </div>
  );
}
