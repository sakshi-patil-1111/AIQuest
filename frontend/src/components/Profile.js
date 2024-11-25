import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [username, setUsername] = useState(""); // Add state for username
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // useNavigate hook

  useEffect(() => {
    // Fetch profile data from the backend
    axios
      .get("http://127.0.0.1:5000/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        setUsername(response.data.username); // Set username from the response
        setUserQuestions(response.data.questions);
        setUserAnswers(response.data.answers);
      })
      .catch((err) => {
        setError("Failed to load profile. Please log in again.");
        console.error("Error fetching profile data:", err);
        navigate("/login"); // Redirect to login if not authorized
      });
  }, [navigate]);

  return (
    <div className="bg-gray-800 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Your Profile</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Display Username */}
        <div className="bg-gray-900/50 p-6 rounded-xl mb-6 shadow-md">
          <p className="text-xl font-semibold text-white">
            Username: @{username}
          </p>
        </div>

        {/* User Questions */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Your Questions
          </h2>
          {userQuestions.length > 0 ? (
            <div className="space-y-4">
              {userQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-gray-900/50 border border-blue-900/20 rounded-xl p-6 hover:border-blue-600/30 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/questions/${question.id}`)} // Redirect to the question page
                >
                  <h3 className="text-xl font-bold text-white">
                    {question.title}
                  </h3>
                  <p className="mt-2 text-gray-300">{question.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              You haven't posted any questions yet.
            </p>
          )}
        </div>

        {/* User Answers */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Your Answers
          </h2>
          {userAnswers.length > 0 ? (
            <div className="space-y-4">
              {userAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className="bg-gray-900/50 border border-green-900/20 rounded-xl p-6 hover:border-green-600/30 transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/questions/${answer.question_id}`)} // Redirect to the question page
                >
                  <p className="text-lg font-semibold text-white">
                    Answer to Question ID: {answer.question_id}
                  </p>
                  <p className="mt-2 text-gray-300">{answer.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">You haven't posted any answers yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
