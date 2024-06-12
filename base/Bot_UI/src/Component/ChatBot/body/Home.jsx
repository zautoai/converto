import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

function Home({handleClick,data}) {

  const welcomeMsg = data.welcomeMsg || '';
  const words = welcomeMsg.split(' ');
  const midPoint = Math.ceil(words.length / 2);
  const firstPart = words.slice(0, midPoint).join(' ');
  const secondPart = words.slice(midPoint).join(' ');

  return (
    <div className="p-2  mt-3 d-flex flex-column justify-content-center">
      <div className="text-center">
        <div>
          <h2 className="fw-bolder">{firstPart}</h2>
        </div>
        <div>
          <h2 className="fw-bolder">{secondPart}</h2>
        </div>
      </div>
      <div className="border rounded p-3 mt-4 shadow-sm">
        <p>
         {data.companyValue}
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
