import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Modal from "./components/Modal";
import { AppProvider } from "./contexts/AppContext";
import Posts from "./pages/Posts";
import Projects from "./pages/Projects";

import "./App.css";

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          {/* Front face */}
          <div className="app-front">
            <div className="flex min-h-screen flex-col bg-dark-300 text-gray-200">
              <Header />
              <main className="flex-grow px-4 py-8 sm:px-6 lg:px-8 mt-16">
                <Routes>
                  <Route path="/" element={<Projects />} />
                  <Route path="/posts" element={<Posts />} />
                </Routes>
              </main>
            </div>
          </div>

          {/* Back face */}
          <div className="app-back">
            <Modal />
          </div>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
