import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import converto from '../../img/converto.png';
function Head({ backArrow, handleClick, msgVisible, data }) {
  // Adjusted prop name
  return (
    <div>
      {msgVisible == 1 && (
        <nav className="bg-dark position-relative p-1 px-2">
          {backArrow && (
            <div
              style={{ cursor: 'pointer', top: '10%' }}
              className="text-light position-absolute left-0"
            >
              <FontAwesomeIcon
                onClick={() => handleClick(2)}
                className="fs-6"
                icon={faArrowLeft}
              />
            </div>
          )}
          <div className=" p-2 text-light d-flex align-item-center justify-content-center py-3">
            {msgVisible == 1 && <h3>Messages</h3>}
          </div>
        </nav>
      )}

      {msgVisible != 1 && (
        <nav className="bg-dark position-relative p-1 px-2">
          {backArrow && (
            <div
              style={{ cursor: 'pointer', top: '10%' }}
              className="text-light position-absolute left-0"
            >
              <FontAwesomeIcon
                onClick={() => handleClick(2)}
                className="fs-6"
                icon={faArrowLeft}
              />
            </div>
          )}
          <div className=" p-2 text-light  py-2">
            <div className="d-flex gap-2 align-item-center justify-content-center">
              <img  src={data.logoUrl||converto} alt="Logo" width="50" />{' '}
              <h1 className="w-100">{data.displayName}</h1>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export default Head;
