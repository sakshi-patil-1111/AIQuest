import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import QuestionList from "./components/QuestionList";
import AskQuestion from "./components/AskQuestion";
import QuestionDetails from "./components/QuestionDetails";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./App.css";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<QuestionList />} />
          <Route path="/ask" element={<AskQuestion />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
