import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [userQuestions, setUserQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [username, setUsername] = useState(""); // Add state for username
  const [error, setError] = useState(null);
  const history = useNavigate();

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
        history("/login"); // Redirect to login if not authorized
      });
  }, [history]);

  return (
    <div>
      <h1>Your Profile</h1>
      {error && <p>{error}</p>}

      {/* Display Username */}
      <p>Username: @{username}</p>

      <h2>Your Questions</h2>
      {userQuestions.length > 0 ? (
        <ul>
          {userQuestions.map((question) => (
            <li key={question.id}>
              <h3>{question.title}</h3>
              <p>{question.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't posted any questions yet.</p>
      )}

      <h2>Your Answers</h2>
      {userAnswers.length > 0 ? (
        <ul>
          {userAnswers.map((answer) => (
            <li key={answer.id}>
              <p>Answer to Question ID: {answer.question_id}</p>
              <p>{answer.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't posted any answers yet.</p>
      )}
    </div>
  );
}

export default Profile;
