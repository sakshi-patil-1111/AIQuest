import React, { useState } from "react";
import axios from "axios";

function Answer({ answer, currentVotes }) {
  const [votes, setVotes] = useState(currentVotes);

  const handleVote = (voteType) => {
    axios
      .post(
        "http://127.0.0.1:5000/answers/vote",
        { vote_type: voteType, answer_id: answer.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )
      .then((response) => {
        setVotes(votes + (voteType === "upvote" ? 1 : -1));
      })
      .catch((error) => {
        console.error("Error voting:", error);
      });
  };

  return (
    <div>
      <p>{answer.content}</p>
      {answer.isOfficial && (
        <span className="official-badge">Official Answer</span>
      )}
      {answer.isAiGenerated && <span className="ai-badge">AI Generated</span>}
      <div>
        <button onClick={() => handleVote("upvote")}>Upvote</button>
        <button onClick={() => handleVote("downvote")}>Downvote</button>
        <p>Votes: {votes}</p>
      </div>
    </div>
  );
}

export default Answer;
