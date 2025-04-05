import React from 'react';
import GlobalStyle from './Styles/GlobalStyle'; // make sure this matches your file path
import styled from 'styled-components';

function App() {
  return (
    <>
      <GlobalStyle />
      <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: '#fff' }}>Hello from React!</h1>
      </div>
    </>
  );
}

const AppStyled = styled.div

;

export default App;
