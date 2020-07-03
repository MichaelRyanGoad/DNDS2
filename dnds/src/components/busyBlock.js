import React from "react";

function BusyBlock(props) {
  return (
    <div style="border:1px solid black">
      <p>Name: {props.name}</p>
      <p>Date: {props.date}</p>
      <p>BST: {props.bstime}</p>
      <p>BET: {props.betime}</p>
    </div>
  );
}

export default BusyBlock;
