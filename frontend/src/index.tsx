import ReactDOM from "react-dom/client";
import './tailwind.css';

import App from './App';
import Owner from './Owner';
import Successor from './Successor';
import NewContract from './NewContract';
import EditContract from './EditContract';
import MainTemplate from './main-template';
import DocsPage from './documentation';
import AuthorPage from './author';

import { Metamask } from './metamask';


import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainTemplate><App /></MainTemplate>}></Route>
          <Route path="/docs" element={<MainTemplate><DocsPage /></MainTemplate>}></Route>
          <Route path="/author" element={<MainTemplate><AuthorPage /></MainTemplate>}></Route>
          <Route path="/owner" element={<Metamask><MainTemplate><Owner /></MainTemplate></Metamask>}></Route>
          <Route path="/successor" element={<Metamask><MainTemplate><Successor /></MainTemplate></Metamask>}></Route>
          <Route path="/newContract" element={<Metamask><MainTemplate><NewContract /></MainTemplate></Metamask>}></Route>
          <Route path="/edit-contract/:address" element={<Metamask><MainTemplate><EditContract /></MainTemplate></Metamask>}></Route>
        </Routes>
      </BrowserRouter>
);
