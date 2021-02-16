import React, { SyntheticEvent, useState } from 'react';
import axios from 'axios';
import './App.css';
import { ArtistResponse } from './Interfaces';
import ArtistData from './ArtistData';

function App() {
  const [text, setText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [results, setResults] = useState([]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    axios.get(`/api/query/${text}`)
      .then(res => {
        setResponseText(`You searched for "${text}"`);
        setResults(res.data.similarArtists.map((data: ArtistResponse) => (
          <li key={data.rank}>
            {ArtistData(data)}
          </li>
        )))
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
      <div>
        {responseText}
      </div>
      <ul className="search-results">
        {results}
      </ul>
    </div>
  );
}

export default App;
