import { useContext } from "react";
import { MetamaskContext } from "./ConnectWallet";

const MainTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { awaitingConfirmation } = useContext(MetamaskContext);

  return (<>
    <div style={{ display: awaitingConfirmation ? 'flex' : 'none' }} className='modal'>
        <div className='modal-content'>
          <div className='loader'></div>
          <div className='modal-text'>Confirming transaction...</div>
        </div>
      </div>
    <div className="flex flex-col h-full">
      <nav className="sticky top-0 z-50 container p-4 bg-slate-800 max-w-full">
        <div className="flex items-center justify-center">
          <div className="flex space-x-6 text-white">
            <a href="#" className="px-10">Documentation</a>
            <a href="#" className="px-10">Explore Contract</a>
            <a href="#" className="px-10">About Author</a>
          </div>
        </div>
      </nav>
      <section className="grow p-4" id="hero">
        { children }
      </section>
      <footer className="sticky bottom-0 z-50 bg-very-dark-blue">
        <div className="flex sm:items-center justify-center p-4 bg-slate-600">
          <div className="flex flex-col sm:flex-row space-x-6 text-white font-mono">
            <a href="#" className="px-10">source code</a>
            <a href="#" className="px-10">about Metamask</a>
          </div>
        </div>
      </footer>
    </div>
  </>);
}

export default MainTemplate;

