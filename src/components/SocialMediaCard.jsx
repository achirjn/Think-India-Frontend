import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Card = () => {
  return (
    <StyledWrapper>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="card"
      >
        <ul>
          <motion.li 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="iso-pro"
          >
            <span />
            <span />
            <a href>
              <svg className="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none" stroke="white" stroke-width="3"/>
                <line x1="2" y1="50" x2="98" y2="50" stroke="white" stroke-width="3"/>
                <line x1="50" y1="2" x2="50" y2="98" stroke="white" stroke-width="3"/>
                <path d="M 20 5 C 25 25, 25 75, 20 95" fill="none" stroke="white" stroke-width="3"/>
                <path d="M 80 5 C 75 25, 75 75, 80 95" fill="none" stroke="white" stroke-width="3"/>
                <path d="M 5 20 C 25 25, 75 25, 95 20" fill="none" stroke="white" stroke-width="3"/>
                <path d="M 5 80 C 25 75, 75 75, 95 80" fill="none" stroke="white" stroke-width="3"/>
              </svg>
            </a>
            <div className="text">Globe</div>
          </motion.li>
          <motion.li 
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="iso-pro"
          >
            <span />
            <span />
            <a href>
              <svg className="svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="6" width="20" height="12" rx="2" fill="transparent" stroke="white" stroke-width="2"/>
                <path d="M2 6l10 7 10-7" fill="transparent" stroke="white" stroke-width="2"/>
              </svg>
            </a>
            <div className="text">Gmail</div>
          </motion.li>
          <motion.li 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="iso-pro"
          >
            <span />
            <span />
            <a href>
              <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
              </svg>
            </a>
            <div className="text">Instagram</div>
          </motion.li>
        </ul>
      </motion.div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    max-width: fit-content;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
    gap: 0.5rem;
    backdrop-filter: blur(15px);
    transition: 0.25s;
  }

  .card:hover {
    background: rgba(173, 173, 173, 0.05);
  }

  .card ul {
    padding: 0.5rem;
    display: flex;
    list-style: none;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    flex-direction: row;
  }

  .card ul li {
    cursor: pointer;
  }

  .svg {
    transition: all 0.15s;
    padding: 0.75rem;
    height: 45px;
    width: 45px;
    border-radius: 100%;
    color: white;
    fill: currentColor;
    box-shadow:
      inset 0 0 20px rgba(255, 255, 255, 0.3),
      inset 0 0 5px rgba(255, 255, 255, 0.5),
      0 5px 5px rgba(0, 0, 0, 0.164);
  }

  .text {
    opacity: 0;
    border-radius: 5px;
    padding: 5px;
    transition: all 0.15s;
    color: white;
    background-color: rgba(255, 255, 255, 0.3);
    position: absolute;
    z-index: 9999;
    box-shadow:
      -5px 0 1px rgba(153, 153, 153, 0.2),
      -10px 0 1px rgba(153, 153, 153, 0.2),
      inset 0 0 20px rgba(255, 255, 255, 0.3),
      inset 0 0 5px rgba(255, 255, 255, 0.5),
      0 5px 5px rgba(0, 0, 0, 0.082);
  }

  /*isometric prooyection*/
  .iso-pro {
    transition: 0.25s;
  }
  .iso-pro:hover a > .svg {
    transform: translate(8px, -8px);
    border-radius: 100%;
  }



  .iso-pro:hover .svg {
    transform: translate(3px, -3px);
  }

  .iso-pro span {
    opacity: 0;
    position: absolute;
    color: white;
    border-color: white;
    box-shadow:
      inset 0 0 20px rgba(255, 255, 255, 0.3),
      inset 0 0 5px rgba(255, 255, 255, 0.5),
      0 5px 5px rgba(0, 0, 0, 0.164);
    border-radius: 50%;
    transition: all 0.15s;
    height: 45px;
    width: 45px;
  }

  .iso-pro:hover span {
    opacity: 1;
  }

  .iso-pro:hover span:nth-child(1) {
    opacity: 0.3;
    transform: translate(3px, -3px);
  }

  .iso-pro:hover span:nth-child(2) {
    opacity: 0.6;
    transform: translate(6px, -6px);
  }`;

export default Card;
