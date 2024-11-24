import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/questions")
      .then((response) => {
        setQuestions(response.data);
        setFilteredQuestions(response.data); // Initially, all questions are visible
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  // Handle search query input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setFilteredQuestions(questions); // Show all questions if the search bar is empty
    } else {
      // Filter questions based on the search query in title or description
      setFilteredQuestions(
        questions.filter(
          (question) =>
            question.title
              .toLowerCase()
              .includes(e.target.value.toLowerCase()) ||
            question.description
              .toLowerCase()
              .includes(e.target.value.toLowerCase())
        )
      );
    }
  };

  return (
    <div>
      <h1>Questions</h1>
      <Link to="/ask">Ask a Question</Link>

      <div>
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <ul>
        {filteredQuestions.map((question) => (
          <li key={question.id}>
            <div>
              <h2>
                <Link to={`/questions/${question.id}`}>{question.title}</Link>
              </h2>
              <p>{question.description}</p>
              <p>
                <strong>Posted by: </strong>@{question.posted_by}{" "}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionList;
