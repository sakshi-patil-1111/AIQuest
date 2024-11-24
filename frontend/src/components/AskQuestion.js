import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AskQuestion() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null); // Store the logged-in user ID
  const history = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem("access_token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT token
      setUserId(decodedToken.sub); // Store user ID
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // If the user is not logged in, show an alert and prevent the question submission
    if (!isLoggedIn) {
      alert("You must be logged in to post a question.");
      return;
    }

    const data = {
      title,
      description,
      category,
      tags: tags.split(",").map((tag) => tag.trim()),
      user_id: userId, // Include the user ID with the question
    };

    axios
      .post("http://127.0.0.1:5000/questions", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
      .then((response) => {
        alert("Question posted successfully!");
        setTitle("");
        setDescription("");
        setCategory("");
        setTags("");
        history("/"); // Redirect to the questions page after posting
      })
      .catch((error) => console.error("Error posting question:", error));
  };

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-3xl p-6 bg-gray-900 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-white mb-6">
          Ask a Question
        </h1>
        {!isLoggedIn && (
          <p className="text-sm text-red-400">
            You must be logged in to post a question.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 text-white"
            />
          </div>

          <div>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 text-white"
            ></textarea>
          </div>

          <div>
            <input
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 text-white"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-600 text-white"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!isLoggedIn}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AskQuestion;
