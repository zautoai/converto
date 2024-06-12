import React from "react";
import Chat from "./body/Chat";
import News from "./body/News";
import Help from "./body/Help";
import Message from "./body/Message";
import Home from "./body/Home";

function Body({ open, handleClick,data }) {






  return (
    <div className="overflow-x-auto h-100vh w-100 d-flex justify-content-center">
      {open === 1 && <Home handleClick={handleClick} data={data} />}
      {open === 2 && <Message handleClick={handleClick}  />}
      {open === 3 && <Help />}
      {open === 4 && <News />}
      {open === 5 &&  <div className="w-100  h-100"><Chat data={data}/></div>}
    </div>
  );
}

export default Body;
