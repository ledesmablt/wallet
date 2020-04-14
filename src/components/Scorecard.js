import React from 'react';
import './Scorecard.css'

function Scorecard({ label, value }) {
  return (
    <div className="Scorecard">
      <p className="Scorecard-label">{label}</p>
      <p className="Scorecard-value">{value}</p>
    </div>
  )
}

export default Scorecard;