// components/Button.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Button = ({
  variant = 'secondary',
  size = 'md',
  children = 'Button',
  onClick,
  disabled = false,
  className = '',
  as: asProp,
  ...props
}) => {
  const Comp = motion(asProp || 'button');
  return (
    <StyledWrapper>
      <Comp
        whileHover={!disabled ? { 
          scale: 1.02, 
          y: -2,
          boxShadow: "rgba(0, 0, 0, 0.25) 0 8px 15px"
        } : {}}
        whileTap={!disabled ? { 
          scale: 0.98, 
          y: 0,
          boxShadow: "none"
        } : {}}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20 
        }}
        className={`btn ${variant} ${size} ${className}`}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </Comp>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .btn {
    appearance: none;
    background-color: white;
    border: 0.125em solid var(--color-ashoka-blue);
    border-radius: 0.9375em;
    box-sizing: border-box;
    color: var(--color-ashoka-blue);
    cursor: pointer;
    display: inline-block;
    font-family: Roobert, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 16px;
    font-weight: 600;
    line-height: normal;
    margin: 0;
    min-height: 3.75em;
    min-width: 0;
    outline: none;
    padding: 1em 2.3em;
    text-align: center;
    text-decoration: none;
    transition: all 300ms cubic-bezier(.23, 1, 0.32, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    will-change: transform;
  }

  .btn:disabled {
    pointer-events: none;
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Remove default hover/active since Framer Motion handles it */
  .btn:hover:not(:disabled) {
    /* Framer Motion handles hover animations */
  }

  .btn:active:not(:disabled) {
    /* Framer Motion handles tap animations */
  }

  /* Secondary variant (Login/Admin) - white -> blue on hover */
  .btn.secondary {
    background-color: white;
    color: var(--color-ashoka-blue);
    border-color: var(--color-ashoka-blue);
  }
  .btn.secondary:hover:not(:disabled) {
    color: #fff;
    background-color: var(--color-ashoka-blue);
  }

  /* Primary variant (Sign up) - blue -> white with blue text on hover */
  .btn.primary {
    background-color: var(--color-ashoka-blue);
    color: #fff;
    border-color: var(--color-ashoka-blue);
  }
  .btn.primary:hover:not(:disabled) {
    background-color: #fff;
    color: var(--color-ashoka-blue);
  }

  /* Logout variant - red -> white with red text on hover */
  .btn.logout {
    background-color: #dc2626; /* red-600 */
    color: #fff;
    border-color: #dc2626;
  }
  .btn.logout:hover:not(:disabled) {
    background-color: #fff;
    color: #dc2626;
    border-color: #dc2626;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .btn {
      font-size: 14px;
      padding: 0.8em 1.6em;
      min-height: 3.2em;
    }
  }

  /* Sizes */
  .btn.sm {
    font-size: 14px;
    padding: 0.55em 1.2em;
    min-height: 2.6em;
    border-radius: 0.75em;
  }

  .btn.sm-plus {
    font-size: 15px;
    padding: 0.7em 1.8em;
    min-height: 3.1em;
    border-radius: 0.85em;
  }
`;

export default Button;