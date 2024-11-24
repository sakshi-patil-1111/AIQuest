import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function QuestionDetails() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [userId, setUserId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [aiSuggestedAnswer, setAiSuggestedAnswer] = useState(null);

  useEffect(() => {
    // Fetch question, answers, and AI suggested answer
    axios
      .get(`http://127.0.0.1:5000/questions/${id}`)
      .then((res) => setQuestion(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`http://127.0.0.1:5000/questions/${id}/answers`)
      .then((res) => setAnswers(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`http://127.0.0.1:5000/questions/${id}/ai-answer`)
      .then((res) => setAiSuggestedAnswer(res.data))
      .catch((err) => console.error(err));

    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUserId(decodedToken.sub);
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
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="w-4xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-4">{question.title}</h1>
        <p className="text-lg mb-4">{question.description}</p>
        <p className="text-sm text-gray-400">
          <strong>Posted by:</strong> @{question.posted_by}
        </p>
        <div className="text-sm text-gray-400 mt-2">
          <strong>Category:</strong> {question.category} <br />
          <strong>Tags:</strong> {question.tags.join(", ")}
        </div>

        {/* AI Suggested Answer Section */}
        {aiSuggestedAnswer && (
          <div className="bg-gray-900 p-4 mt-6 rounded-lg shadow-md">
            <h4 className="text-xl font-semibold mb-2">AI Suggested Answer</h4>
            <p>{aiSuggestedAnswer.ai_answer}</p>
          </div>
        )}

        <h3 className="text-2xl font-semibold mt-8 mb-4">Answers</h3>
        {answers.map((ans) => (
          <div
            key={ans.id}
            className="border p-4 mb-4 rounded-lg shadow-md bg-gray-900"
          >
            <p className="text-lg">{ans.content}</p>
            <div className="flex items-center space-x-4 mt-2">
              <button
                className="bg-blue-500 text-white py-1 px-4 rounded-lg"
                onClick={() => handleVote(ans.id, "upvote")}
              >
                Upvote
              </button>
              <button
                className="bg-red-500 text-white py-1 px-4 rounded-lg"
                onClick={() => handleVote(ans.id, "downvote")}
              >
                Downvote
              </button>
              <span className="text-sm text-gray-400">
                Votes: {ans.net_votes}
              </span>
              {ans.user_id === userId && (
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleDeleteAnswer(ans.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoggedIn && (
          <>
            <h4 className="text-2xl font-semibold mt-8 mb-4">
              Add Your Answer
            </h4>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows="4"
              cols="50"
              className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-white"
              placeholder="Write your answer here..."
            />
            <button
              className="bg-green-500 text-white py-2 px-6 mt-4 rounded-lg"
              onClick={handleAddAnswer}
            >
              Submit Answer
            </button>
          </>
        )}

        {!isLoggedIn && (
          <p className="mt-4 text-sm text-gray-400">
            You need to be logged in to post an answer.
          </p>
        )}
      </div>
    </div>
  );
}

export default QuestionDetails;
