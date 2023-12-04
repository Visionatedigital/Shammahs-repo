import React from "react";
import style from "./NavBar.module.css";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../index.css"

function NavBar(props) {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 768);

  const handleResize = () => {
    setIsLargeScreen(window.innerWidth > 768);
  };
  const closeOffcanvas = () => {
    setShowOffcanvas(false);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isLargeScreen) {
      closeOffcanvas();
    }
  }, [isLargeScreen]);

  // scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <>
      {["md"].map((expand) => (
        <Navbar key={expand} expand={expand} id={style.Navbar}>
          <Container fluid>
            <Navbar.Brand > <Link className={style.Brand}> <img src="/images/Afrolearn Logo.png" alt="" className={style.logo}/>AfroLearn</Link></Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`}
               onClick={() => setShowOffcanvas(!showOffcanvas)} />
            <Navbar.Offcanvas
              id="offcanvas"
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="end"
              show={showOffcanvas}
              onHide={closeOffcanvas}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  Offcanvas
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
              <Nav className="justify-content-end flex-grow-1 pe-3" id={style.nav}>
                  <Link to="" id={style.Link} onClick={closeOffcanvas}>
                    <Nav id={style.Link2}> HOME</Nav>
                  </Link>
                  <Link to="" id={style.Link} onClick={closeOffcanvas}>
                    <Nav id={style.Link2}> ABOUT US</Nav>
                  </Link>
                  <Link to="" id={style.Link} onClick={closeOffcanvas}>
                    <Nav id={style.Link2}> COURSES</Nav>
                  </Link>

            
                </Nav>
                <Nav>
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Search"
                    className="me-2"
                    aria-label="Search"
                    id={style.form}
                  />
                
                </Form>
                </Nav>
                 
                 <label className={style.label} >
                 <Link to="" id={style.Link3} onClick={closeOffcanvas}>
                    <Nav id={style.Link2}> SIGNUP</Nav>
                  </Link>
                 </label>
              
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </>
  );
}

export default NavBar;
