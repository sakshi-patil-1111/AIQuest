import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { MessageCircle, PlusCircle } from "lucide-react";

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
              .includes(e.target.value.toLowerCase()) ||
            question.category
              ?.toLowerCase()
              .includes(e.target.value.toLowerCase()) || // Check category
            question.tags.some(
              (tag) => tag.toLowerCase().includes(e.target.value.toLowerCase()) // Check tags
            )
        )
      );
    }
  };

  return (
    <div className="bg-gray-800 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          Questions
        </h1>

        {/* Search Bar */}
        <div className="mb-8 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search questions by title, description, category, or tags..."
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
                        {question.no_of_ans} answers
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

      {/* Floating "Ask Question" Button */}
      <Link
        to="/ask"
        className="fixed bottom-8 right-8 flex items-center px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 group"
      >
        <PlusCircle className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
        <span className="font-semibold">Ask Question</span>
      </Link>
    </div>
  );
}

export default QuestionList;
