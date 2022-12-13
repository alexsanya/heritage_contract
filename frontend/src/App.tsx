import React from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";

import { Metamask } from './metamask';

import './App.css';

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col sm:flex-row justify-center">
        <a href="/owner" className="container flex flex-col items-center m-10 p-4 max-w-fit">
          <img src="/manage-contract.png" className="w-20" />
          <p className="text-lg text-gray-700 p-3">
            Manage my testaments
          </p>
        </a>
        <a href="#" className="container flex flex-col items-center m-10 p-4 max-w-fit">
          <img src="/receive-funds.png" className="w-20" />
          <p className="text-lg text-gray-700 p-3">
            Receive funds / Register
          </p>
        </a>
      </div>
    </div>
  );
}

export default App;
