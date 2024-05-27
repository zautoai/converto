import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function Home({handleClick}) {
  return (
    <div className="p-2  mt-3 d-flex flex-column justify-content-center">
      <div className="text-center">
        <div>
          <h1 className="fw-bolder">Hello There</h1>
        </div>
        <div>
          <h1 className="fw-bolder">How Can We Help You ?</h1>
        </div>
      </div>
      <div className="border rounded p-3 mt-4 shadow-sm">
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Assumenda,
          ipsam!
        </p>
      </div>
      <div style={{cursor:'pointer'}} onClick={() => handleClick(5)}  className=" d-flex mt-4 justify-content-center ">
          <div className="w-50 shadow-sm rounded-3 border">
            <div className="d-flex w-100 justify-content-between py-2 px-3">
              <div>
                <span>Send Us a Message </span>
              </div>{" "}
              <div>
                <FontAwesomeIcon icon={faPaperPlane} />
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default Home;
