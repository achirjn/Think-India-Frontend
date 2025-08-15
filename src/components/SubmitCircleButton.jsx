import React from 'react'
import styled from 'styled-components'

const SubmitCircleButton = ({
  type = 'submit',
  disabled = false,
  className = '',
  ariaLabel = 'Send',
  ...props
}) => {
  return (
    <StyledWrapper className={className}>
      <div className="styled-wrapper">
        <button type={type} disabled={disabled} aria-label={ariaLabel} className="button" {...props}>
          <div className="button-box">
            <span className="button-elem">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="arrow-icon">
                <path fill="var(--color-ashoka-blue)" d="M4 13h12.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4v2z" />
              </svg>
            </span>
            <span className="button-elem">
              <svg fill="var(--color-ashoka-blue)" viewBox="0 0  24 24" xmlns="http://www.w3.org/2000/svg" className="arrow-icon">
                <path d="M4 13h12.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4v2z" />
              </svg>
            </span>
          </div>
        </button>
      </div>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  .styled-wrapper .button {
    display: block;
    position: relative;
    width: 76px;
    height: 76px;
    margin: 0;
    overflow: hidden;
    outline: none;
    background-color: transparent;
    cursor: pointer;
    border: 0;
  }

  .styled-wrapper .button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .styled-wrapper .button:before {
    content: "";
    position: absolute;
    border-radius: 50%;
    inset: 7px;
    border: 3px solid var(--color-ashoka-blue);
    transition:
      opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
      transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
  }

  .styled-wrapper .button:after {
    content: "";
    position: absolute;
    border-radius: 50%;
    inset: 7px;
    border: 4px solid var(--color-ashoka-blue);
    transform: scale(1.3);
    transition:
      opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
      transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    opacity: 0;
  }

  .styled-wrapper .button:hover:before,
  .styled-wrapper .button:focus:before {
    opacity: 0;
    transform: scale(0.7);
    transition:
      opacity 0.4s cubic-bezier(0.165, 0.84, 0.44, 1),
      transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .styled-wrapper .button:hover:after,
  .styled-wrapper .button:focus:after {
    opacity: 1;
    transform: scale(1);
    transition:
      opacity 0.4s cubic-bezier(0.77, 0, 0.175, 1) 80ms,
      transform 0.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) 80ms;
  }

  .styled-wrapper .button-box {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    transition: transform 0.4s;
  }

  .styled-wrapper .button-elem {
    display: block;
    width: 30px;
    height: 30px;
    margin: 24px 18px 0 22px;
    transform: rotate(360deg);
    fill: var(--color-ashoka-blue);
  }

  .styled-wrapper .button:hover .button-box {
    transform: translateX(69px);
  }
`

export default SubmitCircleButton


