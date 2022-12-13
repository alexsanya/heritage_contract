import ReactDOM from "react-dom/client";
import './tailwind.css';

import App from './App';
import Owner from './Owner';
import Successor from './Successor';
import NewContract from './NewContract';
import EditContract from './EditContract';

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
    <div className="flex flex-col h-full">
      <nav className="relative container p-4 bg-slate-800 max-w-full">
        <div className="flex items-center justify-center">
          <div className="flex space-x-6 text-white">
            <a href="#" className="px-10">Documentation</a>
            <a href="#" className="px-10">Explore Contract</a>
            <a href="#" className="px-10">About Author</a>
          </div>
        </div>
      </nav>
      <section className="grow p-4" id="hero">
        <BrowserRouter>
          <Routes>
              <Route path="/" element={<App />}></Route>
              <Route path="/owner" element={<Owner />}></Route>
              <Route path="/successor" element={<Successor />}></Route>
              <Route path="/newContract" element={<NewContract />}></Route>
              <Route path="/edit-contract/:address" element={<EditContract />}></Route>
          </Routes>
        </BrowserRouter>
      </section>
      <footer className="bg-very-dark-blue">
        <div className="flex sm:items-center justify-center p-4 bg-slate-600">
          <div className="flex flex-col sm:flex-row space-x-6 text-white font-mono">
            <a href="#" className="px-10">source code</a>
            <a href="#" className="px-10">about Metamask</a>
          </div>
        </div>
      </footer>
    </div>

  </Metamask>
);
