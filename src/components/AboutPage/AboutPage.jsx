import React from "react";
import style from "./AboutPage.module.css";

function AboutPage(props) {
  return (
    <>
      <div>
        <h2 className={style.h3}>
          Why Afro Learn is a necessity to your child
        </h2>
      </div>
      <div className="container-fluid" id={style.container}>
        <div className="row">
          <div className="col">
            <div className={style.body}>
            <img src="" alt="" />
            <h3>Customized Learning</h3>
            <p>
              Afrolearn offers your child learning that access their interests
              and tailors our tools to suit your child’s interests.
            </p>
            </div>
          </div >
          <div className="col">
            <div className={style.body}>
            <img src="" alt="" />
            <h3>Trusted Resources</h3>
            <p>
              We have partnered with leading education consultants and teachers
              to create this education content.
            </p>
            </div>
          </div>
          <div className="col">
            <div className={style.body}>
            <img src="" alt="" />
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
