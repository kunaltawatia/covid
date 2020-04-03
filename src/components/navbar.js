import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import $ from 'jquery';

function Navbar(props) {
  const [view, setView] = useState(() => {
    switch (window.location.pathname) {
      case '/': return "Home";
      case '/links': return "Helpline";
      case '/faq': return "FAQs";
      case '/acknowledgement': return 'Acknowledgement';
      default: return "";
    }
  });

  // useEffect(() => {
  //   setTimeout(() => {
  //     var windowBottom = $(window).scrollTop() + $(window).innerHeight();
  //     $(".animate").each(function () {
  //       /* Check the location of each desired element */
  //       var objectBottom = $(this).offset().top;

  //       /* If the element is completely within bounds of the window, fade it in */
  //       if (objectBottom < windowBottom) { //object comes into view (scrolling down)
  //         $(this).removeClass('animate').addClass('fadeInUp')
  //       } else { //object goes out of view (scrolling up)
  //         // if ($(this).css("opacity")==1) {$(this).fadeTo(500,0);}
  //       }
  //     });
  //   }, 300);
  // }, [view])

  if (window.location.pathname !== "/summary") {
    return (
      <div
        className="Navbar"
        style={{
          animationDelay: "0.5s",
          height: view === "Clusters" ? "2.5rem" : "",
          transition: "all 0.3s ease-in-out"
        }}
      >
        <img
          className="fadeInUp"
          src="/corona.png"
          style={{
            animationDelay: "0.0s",
            width: view === "Clusters" ? "1.5rem" : "",
            height: view === "Clusters" ? "1.5rem" : "",
            transition: "all 0.3s ease-in-out"
          }}
        />

        <div className="navbar-left">
          <Link
            to="/"
            onClick={() => {
              setView("Home");
            }}
          >
            <span
              className={`fadeInUp ${view === "Home" ? "focused" : ""}`}
              style={{ animationDelay: "0.2s" }}
            >
              होम
            </span>
          </Link>
          {/* 
          <Link
            to="/links"
            onClick={() => {
              setView("Helpline");
            }}
          >
            <span
              className={`fadeInUp ${
                view === "Helpline" ? "focused" : ""
                }`}
              style={{ animationDelay: "0.4s" }}
            >
              हेल्पलाइन
            </span>
          </Link> */}

          <Link
            to="/faq"
            onClick={() => {
              setView("FAQs");
            }}
          >
            <span
              className={`fadeInUp ${view === "FAQs" ? "focused" : ""}`}
              style={{ animationDelay: "0.6s" }}
            >
              दिशानिर्देश
            </span>
          </Link>

          <Link
            to="/acknowledgement"
            onClick={() => {
              setView("Acknowledgement");
            }}
          >
            <span
              className={`fadeInUp ${view === "Acknowledgement" ? "focused" : ""}`}
              style={{ animationDelay: "0.6s" }}
            >
              स्वीकृति
            </span>
          </Link>

          {/* <Link
            to="/doctor"
            onClick={() => {
              setView("Doctor");
            }}
          >
            <span
              className={`fadeInUp ${view === "Doctor" ? "focused" : ""}`}
              style={{ animationDelay: "0.6s" }}
            >
              Doctor
            </span>
          </Link> */}

        </div>

        <div className="navbar-right"></div>
      </div>
    );
  } else {
    return <div></div>;
  }
}

export default Navbar;
