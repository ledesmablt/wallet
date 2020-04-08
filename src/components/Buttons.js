import React from 'react';
import { useStoreState } from 'easy-peasy';
import './Buttons.css';


export function ApproveRejectDeleteButtons({ approveHandler, rejectHandler, deleteHandler }) {
  const currentAppState = useStoreState(state => state.app.currentState);
  switch (currentAppState) {
    case "createRecord":
      return (
        <div className="ButtonsContainer">
          <input onClick={approveHandler} className="ApproveButton Round" type="submit" value="✔" />
          <input onClick={rejectHandler} className="RejectButton Round" type="button" value="✖" />
        </div>
      )
    case "modifyRecord":
      return (
        <div className="ButtonsContainer">
          <input onClick={approveHandler} className="ApproveButton Round" type="submit" value="✔" />
          <input onClick={rejectHandler} className="RejectButton Round" type="button" value="✖" />
          <input onClick={deleteHandler} className="DeleteButton Oval" type="button" value="DEL" />
        </div>
      )
    default:
      return null;
  }
}

export function CreateRecordButton({ onClick}) {
  return (
    <div className="ButtonsContainer">
      <button className="CreateRecordButton Round" onClick={onClick}>
        +
      </button>
    </div>
  )
}