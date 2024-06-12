import {React,useState} from "react";

import HomeLight from "../../SVG/homelight.svg";
import MessageLight from "../../SVG/msgLight.svg";
import HelpLight from "../../SVG/help.svg";
import NewsLight from "../../SVG/news.svg";
import HomeDark from "../../SVG/homeDark.svg";
import NewsDark from "../../SVG/newsDark.svg";
import MessageDark from "../../SVG/messageDark.svg";
import HelpDark from "../../SVG/helpDark.svg";

const App = ({footerVisible,selected,handleClick}) => {


  return (
    <div className="App">
      
      {footerVisible && (
        <div className=" w-100 border-top">
          <ul className="d-flex list-unstyled align-items-center justify-content-evenly mt-2 p-0">
            <li
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(1)}
              className="text-center"
            >
              <img src={selected === 1 ? HomeDark : HomeLight} alt="Home" />
              <p>Home</p>
            </li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(2)}
              className="text-center"
            >
              <img src={selected === 2 ? MessageDark : MessageLight} alt="Message" />
              <p>Message</p>
            </li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(3)}
              className="text-center"
            >
              <img src={selected === 3 ? HelpDark : HelpLight} alt="Help" />
              <p>Help</p>
            </li>
            <li
              style={{ cursor: "pointer" }}
              onClick={() => handleClick(4)}
              className="text-center"
            >
              <img src={selected === 4 ? NewsDark : NewsLight} alt="News" />
              <p>News</p>
            </li>
          </ul>
       
        </div>
      )}
         {/* <div className="bg-dark text-light text-center p-1"><span style={{fontSize:'10px'}}>Powerded By Zauto</span></div> */}
    </div>
  );
};

export default App;
