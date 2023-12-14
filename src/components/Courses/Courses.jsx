import React from "react";
import style from "./Courses.module.css";

function Courses(props) {
  return (
    <>
      <h3 className={style.courses}>COURSES</h3>
      <div className="container-fluid" id={style.container}>
        <div className="row">
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6" >
            
            <div id={style.math}>
            <img src="images/Maths.png" alt="Math" className={style.image} />
            <h5 className={style.h5}>Mathematics</h5>
            <ul className={style.ul}>
            <li className={style.li}>Pre-School</li>
              <li className={style.li}>Primary 1</li>
              <li className={style.li}>Primary 2</li>
              <li className={style.li}>Primary 3</li>
              <li className={style.li}>Primary 4</li>
              <li className={style.li}>Primary 5</li>
              <li className={style.li}>Primary 6</li>
              <li className={style.li}>Primary 7</li>
           
            </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 "  >
            <div id={style.socialstudies}>
            <img src="images/Social Studies.png" alt="Social Studies" className={style.image} />
            <h5 className={style.h5}>Social Studies</h5>
            <ul className={style.ul}>
              <li className={style.li}>Pre-School</li>
              <li className={style.li}>Primary 1</li>
              <li className={style.li}>Primary 2</li>
              <li className={style.li}>Primary 3</li>
              <li className={style.li}>Primary 4</li>
              <li className={style.li}>Primary 5</li>
              <li className={style.li}>Primary 6</li>
              <li className={style.li}>Primary 7</li>
           
            </ul>
            </div>
          </div>
          
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 "  >
            <div id={style.english}>
            <img src="images/English.png" alt="Social Studies" className={style.image} />
            <h5 className={style.h5}>English</h5>
            <ul className={style.ul}>
              <li className={style.li}>Pre-School</li>
              <li className={style.li}>Primary 1</li>
              <li className={style.li}>Primary 2</li>
              <li className={style.li}>Primary 3</li>
              <li className={style.li}>Primary 4</li>
              <li className={style.li}>Primary 5</li>
              <li className={style.li}>Primary 6</li>
              <li className={style.li}>Primary 7</li>
           
            </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 "  >
            <div id={style.science}>
            <img src="images/Science.png" alt="Social Studies" className={style.image} />
            <h5 className={style.h5}>Science</h5>
            <ul className={style.ul}>
              <li className={style.li}>Pre-School</li>
              <li className={style.li}>Primary 1</li>
              <li className={style.li}>Primary 2</li>
              <li className={style.li}>Primary 3</li>
              <li className={style.li}>Primary 4</li>
              <li className={style.li}>Primary 5</li>
              <li className={style.li}>Primary 6</li>
              <li className={style.li}>Primary 7</li>
           
            </ul>
            </div>
          </div>
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6" >
            
            <div id={style.math}>
            <img src="images/Maths.png" alt="Math" className={style.image} />
            <h5 className={style.h5}>Life Skills</h5>
            <ul className={style.ul2}>
            <li className={style.li}>Personal Hygiene</li>
              <li className={style.li2}>Financial Literacy</li>
              <li className={style.li2}>Social and Emotional Learning</li>
              <li className={style.li2}>Growth Attitude</li>
             
           
            </ul>
            </div>
          </div>
         
          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 "  >
            <div id={style.socialstudies}>
            <img src="images/Social Studies.png" alt="Social Studies" className={style.image} />
            <h5 className={style.h5}>Culture and Heritage</h5>
            <ul className={style.ul2}>
              <li className={style.li2}>Folk Tales</li>
              <li className={style.li2}>Traditional Languages</li>
              <li className={style.li2}>Practices and Norms</li>
              <li className={style.li2}>History</li>
           
           
            </ul>
            </div>
          </div>
         
        
        </div>
      </div>
    </>
  );
}

export default Courses;
