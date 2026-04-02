import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  height: 60px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 32px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  font-size: 24px;
  font-weight: 700;
  color: #1a2533;
  letter-spacing: -0.02em;
`;

const Header = () => {
  return (
    <HeaderContainer>
      <span role="img" aria-label="scale">⚖️</span>
      &nbsp;&nbsp;Juri-Sim
    </HeaderContainer>
  );
};

export default Header;