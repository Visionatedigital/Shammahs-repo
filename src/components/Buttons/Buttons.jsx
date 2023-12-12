import React from "react";
import style from "./Buttons.module.css"
import App from "../../App";
 
function Buttons(props) {
  return (
    <>
      <div className="container-fluid" id={style.container}>
        <div className="row">
          <div className="col"><button id={style.button} >{props.student}</button></div>
          <div className="col"><button id={style.button2} >{props.tutor}</button></div>
          <div className="col"><button id={style.button3} >{props.parent}</button></div>
        </div>
      </div>
    </>
  );
}

export default Buttons;
