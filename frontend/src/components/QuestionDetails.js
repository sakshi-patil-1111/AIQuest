import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function QuestionDetails() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [userId, setUserId] = useState(null); // To store the current user's ID
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [aiSuggestedAnswer, setAiSuggestedAnswer] = useState(null); // For AI-suggested answer

  useEffect(() => {
    // Fetch the question details
    axios
      .get(`http://127.0.0.1:5000/questions/${id}`)
      .then((res) => setQuestion(res.data))
      .catch((err) => console.error(err));

    // Fetch the answers for the question
    axios
      .get(`http://127.0.0.1:5000/questions/${id}/answers`)
      .then((res) => setAnswers(res.data))
      .catch((err) => console.error(err));

    // Fetch AI suggested answer for the question
    axios
      .get(`http://127.0.0.1:5000/questions/${id}/ai-answer`)
      .then((res) => setAiSuggestedAnswer(res.data))
      .catch((err) => console.error(err));

    // Check if the user is logged in and fetch the user ID from the JWT token
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
      setUserId(decodedToken.sub); // assuming 'sub' is the user ID from JWT payload
      setIsLoggedIn(true);
    }
  }, [id]);

  const handleVote = (answerId, type) => {
    axios
      .post("http://127.0.0.1:5000/answers/vote", {
        answer_id: answerId,
        vote_type: type,
      })
      .then(() => {
        setAnswers((prevAnswers) =>
          prevAnswers.map((ans) =>
            ans.id === answerId
              ? {
                  ...ans,
                  net_votes: ans.net_votes + (type === "upvote" ? 1 : -1),
                }
              : ans
          )
        );
      })
      .catch((err) => console.error(err));
  };

  const handleAddAnswer = () => {
    if (!isLoggedIn) {
      alert("You need to be logged in to post an answer.");
      return;
    }

    axios
      .post(`http://127.0.0.1:5000/questions/${id}/answers`, {
        content: newAnswer,
      })
      .then(() => {
        setNewAnswer("");
        // Fetch answers again
        axios
          .get(`http://127.0.0.1:5000/questions/${id}/answers`)
          .then((res) => setAnswers(res.data));
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteAnswer = (answerId) => {
    axios
      .delete(`http://127.0.0.1:5000/answers/${answerId}`)
      .then(() => {
        setAnswers((prevAnswers) =>
          prevAnswers.filter((ans) => ans.id !== answerId)
        );
      })
      .catch((err) => console.error(err));
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div>
      <h1>{question.title}</h1>
      <p>{question.description}</p>
      <p>
        <strong>Posted by: </strong>@{question.posted_by}{" "}
      </p>
      <div>
        <strong>Category:</strong> {question.category} <br />
        <strong>Tags:</strong> {question.tags.join(", ")}
      </div>

      {/* AI Suggested Answer Section */}
      {aiSuggestedAnswer && (
        <div
          style={{
            border: "1px solid #ddd",
            margin: "10px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h4>AI Suggested Answer</h4>
          <p>{aiSuggestedAnswer.ai_answer}</p>
        </div>
      )}

      <h3>Answers</h3>
      {answers.map((ans) => (
        <div
          key={ans.id}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
        >
          <p>{ans.content}</p>
          <div>
            <button onClick={() => handleVote(ans.id, "upvote")}>Upvote</button>
            <button onClick={() => handleVote(ans.id, "downvote")}>
              Downvote
            </button>
            <span>Votes: {ans.net_votes}</span>
            {/* Only show delete button if the current user is the author of the answer */}
            {ans.user_id === userId && (
              <button onClick={() => handleDeleteAnswer(ans.id)}>Delete</button>
            )}
          </div>
        </div>
      ))}
      {isLoggedIn && (
        <>
          <h4>Add Your Answer</h4>
          <textarea
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            rows="4"
            cols="50"
          />
          <button onClick={handleAddAnswer}>Submit</button>
        </>
      )}
      {!isLoggedIn && <p>You need to be logged in to post an answer.</p>}
    </div>
  );
}

export default QuestionDetails;
