import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ComingSoonPage } from "./pages/ComingSoonPage.jsx";
import { GamePage } from "./pages/GamePage.jsx";
import { LeaderboardPage } from "./pages/LeaderboardPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { StorePage } from "./pages/StorePage.jsx";
import { StagesPage } from "./pages/StagesPage.jsx";

function protectedPage(page) {
  return <ProtectedRoute>{page}</ProtectedRoute>;
}

function publicOnlyPage(page) {
  return <PublicOnlyRoute>{page}</PublicOnlyRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={publicOnlyPage(<LandingPage />)} />
        <Route path="/login" element={publicOnlyPage(<LoginPage />)} />
        <Route path="/register" element={publicOnlyPage(<RegisterPage />)} />
        <Route path="/game" element={protectedPage(<GamePage />)} />
        <Route path="/game/:stageNumber" element={protectedPage(<GamePage />)} />
        <Route path="/stages" element={protectedPage(<StagesPage />)} />
        <Route path="/profile" element={protectedPage(<ProfilePage />)} />
        <Route path="/store" element={protectedPage(<StorePage />)} />
        <Route path="/leaderboard" element={protectedPage(<LeaderboardPage />)} />
        <Route path="/settings" element={protectedPage(<ComingSoonPage title="الإعدادات" />)} />
      </Route>
    </Routes>
  );
}
