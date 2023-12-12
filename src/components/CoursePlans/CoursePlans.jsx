import React from "react";
import style from "./CoursePlans.module.css";
function CoursePlans(props) {
  return (
    <div>
      <h1 className={style.plan}>COURSE PLANS</h1>
      <div className="container-fluid" id={style.container}>
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12">
            <button id={style.button}>Basic</button>
            <h5 className={style.h5}>UGX. 50,000 per month</h5>
            <ul className={style.ul2}>
              <li>Syllabus</li>
              <li>Past Papers</li>
              <li>Virtual Quizzes</li>
              <li>Online chat with fellow students</li>
              <li>Audio and Visual Content</li>
            </ul>
          </div>
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12">
            <button id={style.button2}> Standard</button>
            <h5 className={style.h5}>UGX. 50,000 per month</h5>
            <ul className={style.ul2}>
              <li>Syllabus</li>
              <li>Past Papers</li>
              <li>Virtual Quizzes</li>
              <li>Online chat with fellow students</li>
              <li>Audio and Visual Content</li>
            </ul>
            
          </div>
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12">
            <button id={style.button3}> Premium</button>
            <h5 className={style.h5}> UGX. 100,000 per month </h5>
            <ul className={style.ul3}>
              <li>Syllabus</li>
              <li>Past Papers</li>
              <li>Virtual Quizzes</li>
              <li>Online chat with fellow students</li>
              <li>Audio and Visual Content</li>
              <li>Visual meetings with tutors</li>
              <li>Animations and Leaderboards</li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default CoursePlans;
