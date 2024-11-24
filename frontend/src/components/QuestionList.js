import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from "lucide-react";

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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setFilteredQuestions(questions); // Show all questions if the search bar is empty
    } else {
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
    <div className="bg-gray-800 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Questions</h1>

        {/* Ask a Question Link */}
        <div className="mb-6">
          <Link
            to="/ask"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Ask a Question
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-gray-900/50 border border-blue-900/20 rounded-xl p-6 hover:border-blue-600/30 transition-all duration-300"
            >
              <div className="flex items-start space-x-4">
                {/* Votes Section */}
                <div className="flex flex-col items-center space-y-2">
                  <button className="p-2 rounded-lg hover:bg-blue-600/10 text-gray-400 hover:text-blue-400">
                    <ThumbsUp className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-semibold text-gray-300">
                    {question.votes}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-red-600/10 text-gray-400 hover:text-red-400">
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white hover:text-blue-400 cursor-pointer">
                      <Link to={`/questions/${question.id}`}>
                        {question.title}
                      </Link>
                    </h2>
                  </div>

                  <p className="mt-2 text-gray-300">{question.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-medium bg-blue-600/10 text-blue-400 rounded-full hover:bg-blue-600/20 cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {question.answers} answers
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        asked by{" "}
                        <span className="text-blue-400">
                          {question.posted_by}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuestionList;
