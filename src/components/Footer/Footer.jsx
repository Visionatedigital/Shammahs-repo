import React from "react";
import style from "./Footer.module.css";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { FaRegCopyright } from "react-icons/fa";

function Footer(props) {
  return (
    <>
      <div className="container-fluid" id={style.container}>
        <div className="row">
          <div className="col">
            <div className="">
            <h1>Get in Touch</h1>
            <p>Communications House Level 5-Office 24</p>
            <h4>Email Address</h4>
            <p>info@afrolearn.com</p>
            <h4>Phone Number</h4>
            <p></p>
            </div>
          </div>
          <div className="col">
            <img src="images/illustration_3-removebg-preview.png" alt="" className={style.image} />
          </div>
          <div className="col">
            <h3>Socials</h3>
            <p>
              <AiFillTwitterCircle  className={style.icons}/>
            </p>
            <p>
              <FaFacebook  className={style.icons}/>
            </p>
            <p>
              <FaLinkedin className={style.icons} />
            </p>
            <p>
              <FaInstagramSquare  className={style.icons}/>
            </p>
            <p></p>
          </div>
        </div>
      </div>
      <label>
        <label>
          <img src="images/Afrolearn Logo.png" alt=""  className={style.logo}/>
        </label>
        <p className={style.copy}><FaRegCopyright />&nbsp; 2023 Afrolearn</p>
      </label>
    </>
  );
}

export default Footer;
