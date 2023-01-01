import ReactDOM from "react-dom/client";
import './tailwind.css';

import App from './App';
import Owner from './Owner';
import Successor from './Successor';
import NewContract from './NewContract';
import EditContract from './EditContract';
import MainTemplate from './main-template';

import { Metamask } from './metamask';


import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
// import your route components too

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Metamask>
    <MainTemplate>
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}></Route>
            <Route path="/owner" element={<Owner />}></Route>
            <Route path="/successor" element={<Successor />}></Route>
            <Route path="/newContract" element={<NewContract />}></Route>
            <Route path="/edit-contract/:address" element={<EditContract />}></Route>
        </Routes>
      </BrowserRouter>
    </MainTemplate>
  </Metamask>
);
