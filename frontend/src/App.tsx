import React, { SyntheticEvent, useState } from 'react';
import axios from 'axios';
import './App.css';
import { ArtistResponse } from './Interfaces';
import ArtistData from './ArtistData';

function App() {
  const [text, setText] = useState("");
  const [accuracy, setAccuracy] = useState(0.0);
  const [maxResults, setMaxResults] = useState(10);
  const [responseText, setResponseText] = useState("");
  const [results, setResults] = useState([]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (text === "") return;
    axios.post(`/api/query/${text}`, { accuracy, maxResults })
      .then(res => {
        setResponseText(`You searched for "${text}"`);
        setResults(res.data.similarArtists.map((data: ArtistResponse) => (
          <li key={data.rank}>
            {ArtistData(data)}
          </li>
        )))
      });
  }

  let resultsDisplay = (results.length === 0) && (responseText.length !== 0) ?
    (<p className="no-results">No results found :(</p>) :
    (<ul className="search-results">{results}</ul>);

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
      <div className="search-controls">
        <label>Accuracy
          <input
            type="range" min="0.0" max="3.0" step="0.1" value={accuracy}
            onChange={e => setAccuracy(Number(e.currentTarget.value))}
          />
        </label>
        <label>Maximum Number of Results
          <input
            type="number" min="0" value={maxResults}
            onChange={e => setMaxResults(Number(e.currentTarget.value))}
          />
          (0 means as many as possible)
        </label>
      </div>
      <div>
        {responseText}
      </div>
      {resultsDisplay}
    </div>
  );
}

export default App;
