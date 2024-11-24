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
    <div>
      <h1>Ask a Question</h1>
      {!isLoggedIn && <p>You must be logged in to post a question.</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit" disabled={!isLoggedIn}>
          Post Question
        </button>
      </form>
    </div>
  );
}

export default AskQuestion;
