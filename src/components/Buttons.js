import React from 'react';
import './Buttons.css';


export function ApproveRejectButtons({ approveHandler, rejectHandler }) {
    return (
        <div className="ButtonsContainer">
            <input onClick={approveHandler} className="ApproveButton Round" type="submit" value="✔" />
            <input onClick={rejectHandler} className="RejectButton Round" type="button" value="✖" />
        </div>
    )
}

export function CreateRecordButton({ onClick}) {
    return (
        <button className="CreateRecordButton Round" onClick={onClick}>
            +
        </button>
    )
}