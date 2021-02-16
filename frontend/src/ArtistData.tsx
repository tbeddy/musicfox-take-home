import React from 'react';
import './ArtistData.css';
import { ArtistResponse } from './Interfaces';

export default (data: ArtistResponse) => {
  return (
    <div className="artist-data">
      <span>{data.rank}</span>
      <span>{data.artistName}</span>
    </div>
  )
}