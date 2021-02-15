import React, { SyntheticEvent, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [text, setText] = useState("");
  const [results, setResults] = useState("");

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    axios.get(`/api/query/${text}`)
      .then(res => {
        setResults(res.data)
      });
  }

  return (
    <div className="app">
      <header className="app-header">
        Search:
      </header>
      <form
        className="search-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Search an artist"
          onChange={e => setText(e.currentTarget.value)}
        />
        <button>Submit</button>
      </form>
      <div className="search-results">
        {results}
      </div>
    </div>
  );
}

export default App;
