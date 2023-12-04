import React from "react";
import style from "./Buttons.module.css"

function Buttons(props) {
  return (
    <>
      <div className="container-fluid" id={style.container}>
        <div className="row">
          <div className="col"><button id={style.button} >Student</button></div>
          <div className="col"><button id={style.button2} >Tutor</button></div>
          <div className="col"><button id={style.button3} >Parent</button></div>
        </div>
      </div>
    </>
  );
}

export default Buttons;
