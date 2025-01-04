import React, { useState } from 'react';
import { processQuery } from '../api/dental';

const DentalQuery = ({ userId }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await processQuery(question, userId);
      setResponse(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {response && (
        <div className="response">
          <h3>Response:</h3>
          <p><strong>Question:</strong> {response.question}</p>
          <p><strong>Natural Response:</strong> {response.natural_response}</p>
          <details>
            <summary>Technical Details</summary>
            <p><strong>SQL Query:</strong> {response.sql_query}</p>
            <p><strong>SQL Response:</strong> {response.sql_response}</p>
          </details>
        </div>
      )}
    </div>
  );
};

export default DentalQuery; 