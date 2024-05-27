import React, { useState } from "react";
import Body from "./ChatBot/Body";
import Head from "./ChatBot/Head";
import Foot from "./ChatBot/Foot";

function Widge() {
  const [open, setOpen] = useState(1);
  const [selected, setSelected] = useState(1);
  const [footerVisible, setFooterVisible] = useState(true);
  const [backArrow, setBackArrow] = useState(false);
  const [msgVisible, setMsgVisible] = useState(false);

  const handleClick = (id) => {
    setOpen(id);
    setSelected(id);
    setFooterVisible(id !== 5);
    if (id == 5) {
      setBackArrow(true);
    } else {
      setBackArrow(false);
    }

    if (id == 1) {
      setMsgVisible(false);
    } else {
      setMsgVisible(true);
    }
  };

  return (
    <div style={{ height: "100vh" }} className="d-flex flex-column w-100">
      <div>
        <Head
          backArrow={backArrow}
          handleClick={handleClick}
          msgVisible={msgVisible}
        />{" "}
      </div>
      <div style={{display:'flex',justifyContent:'center'}} className="h-100 w-100  align-self-center ">
        <Body handleClick={handleClick} open={open} />
      </div>
      <div>
        <Foot
          handleClick={handleClick}
          selected={selected}
          footerVisible={footerVisible}
        />
      </div>
    </div>
  );
}

export default Widge;
