import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee"); // Default to 'employee'
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:5000/signup", { username, password, role })
      .then((response) => {
        alert("User registered successfully!");
        navigate("/login"); // Redirect to login after successful signup
      })
      .catch((err) => {
        setError("Failed to register. Try again.");
      });
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-white mb-6 text-center">
          Signup
        </h2>

        {error && (
          <p className="text-sm text-red-400 text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 text-white"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 text-white"
            />
          </div>

          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 text-white"
            >
              <option value="employee">Employee</option>
              <option value="expert">Expert</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
