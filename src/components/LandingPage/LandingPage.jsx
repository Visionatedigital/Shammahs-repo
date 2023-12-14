import React from "react";
import NavBar from "../NavBar/NavBar";
import style from "./LandingPage.module.css";
import Buttons from "../Buttons/Buttons";
import { Link } from "react-router-dom";
import CoursePlans from "../CoursePlans/CoursePlans";
import Courses from "../Courses/Courses";
import AboutPage from "../AboutPage/AboutPage";


function LandingPage(props) {
  return (
    <>
      <NavBar />
      <div className={style.main}>
        <div className="container-fluid" id={style.main2}>
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12  "><img src="/images/illustration_1-removebg-preview.png" alt="" className={style.image} /> </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 " id={style.body}>Our Child <label className={style.learning}> learning</label>  from the convenience of their home. Learn about your <label className={style.life}>life,culture </label> and shape your child's <label className={style.future}>future.</label> </div>
            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-12"> <img src="/images/illustration_2-removebg-preview.png" alt=""  className={style.image2}/></div>
          </div>
        </div>
        <Buttons student="Student" tutor="Tutor" parent="Parent"/>
        <CoursePlans/>
        <Courses/>
        <AboutPage/>
      </div>
    </>
  );
}

export default LandingPage;
