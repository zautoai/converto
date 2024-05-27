import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import converto from "../../img/converto.png";
function Head({ backArrow, handleClick, msgVisible }) {
  // Adjusted prop name
  return (
    <div>
      {msgVisible == 1 && (
        <nav className="bg-dark position-relative p-1 px-2">
          {backArrow && (
            <div
              style={{ cursor: "pointer", top: "10%" }}
              className="text-light position-absolute left-0"
            >
              <FontAwesomeIcon
                onClick={() => handleClick(2)}
                className="fs-6"
                icon={faArrowLeft}
              />
            </div>
          )}
          <div className=" p-2 text-light d-flex align-item-center justify-content-center py-4">
            {msgVisible == 1 && <h3>Messages</h3>}
          </div>
        </nav>
      )}

      {msgVisible != 1 && (
        <nav className="bg-dark position-relative p-1 px-2">
          {backArrow && (
            <div
              style={{ cursor: "pointer", top: "10%" }}
              className="text-light position-absolute left-0"
            >
              <FontAwesomeIcon
                onClick={() => handleClick(2)}
                className="fs-6"
                icon={faArrowLeft}
              />
            </div>
          )}
          <div className=" p-2 text-light d-flex align-item-center justify-content-between w-75  py-4">
          
          <div><img className="w-25" src={converto} alt="" /></div>
          <h1>Title</h1>
          </div>
        </nav>
      )}
    </div>
  );
}

export default Head;
