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
    <MainTemplate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}></Route>
          <Route path="/docs" element={<DocsPage />}></Route>
          <Route path="/author" element={<AuthorPage />}></Route>
          <Route path="/owner" element={<Metamask><Owner /></Metamask>}></Route>
          <Route path="/successor" element={<Metamask><Successor /></Metamask>}></Route>
          <Route path="/newContract" element={<Metamask><NewContract /></Metamask>}></Route>
          <Route path="/edit-contract/:address" element={<Metamask><EditContract /></Metamask>}></Route>
        </Routes>
      </BrowserRouter>
    </MainTemplate>
);
