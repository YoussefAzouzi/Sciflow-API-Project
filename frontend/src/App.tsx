import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ConferencePage from "./pages/ConferencePage";
import CreateConferencePage from "./pages/CreateConferencePage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-inner">
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
              }}
            >
              <img
                src="/logo.png"
                alt="Sciflow logo"
                style={{ height: 50, width: "auto" }}
              />
              <div className="app-title-group">
                <div className="app-title">Welcome!</div>
                <div className="app-subtitle">
                  The first scientific conference discovery and program explorer.
                </div>
              </div>
            </Link>
            <Link to="/conferences/new">
              <button className="button">+ Create conference</button>
            </Link>
          </div>
        </header>

        <main className="app-main">
          <div className="app-main-inner">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/conferences/new" element={<CreateConferencePage />} />
              <Route path="/conferences/:id" element={<ConferencePage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
