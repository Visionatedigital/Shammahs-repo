import React from "react";
import style from "./AboutPage.module.css";

function AboutPage(props) {
  return (
    <>
      <div>
        <h2 className={style.h3}>
          Why AfroLearn ?
        </h2>
      </div>
      <div className="container-fluid" id={style.container}>
        <div className="row">
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12">
            <div className={style.body}>
            <img src="images/illustration_4-removebg-preview.png" alt="" className={style.image} />
            <h3>Customized Learning</h3>
            <p>
              Afrolearn offers your child learning that access their interests
              and tailors our tools to suit your child’s interests.
            </p>
            </div>
          </div >
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12">
            <div className={style.body}>
            <img src="images/illustration_5-removebg-preview.png" alt=""  className={style.image}/>
            <h3>Trusted Resources</h3>
            <p>
              We have partnered with leading education consultants and teachers
              to create this education content.
            </p>
            </div>
          </div>
          <div className="col-xl-4 col-lg-4 col-md-4 col-sm-12">
            <div className={style.body}>
            <img src="images/illustration_6-removebg-preview.png" alt="" className={style.image} />
            <h3>Back to our Roots</h3>
            <p>
              Give your child a chance to learn about their culture and
              heritage.
            </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutPage;
