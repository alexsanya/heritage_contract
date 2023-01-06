import { useContext } from "react";
import { MetamaskContext } from "./ConnectWallet";
import { chainExplorerUrl, factoryAddress } from "./config";

const MainTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { awaitingConfirmation, label } = useContext(MetamaskContext);

  return (<>
    <div style={{ display: awaitingConfirmation ? 'flex' : 'none' }} className='modal'>
        <div className='modal-content'>
          <div className='loader'></div>
          <div className='modal-text'>{label || 'Confirming transaction...'}</div>
        </div>
      </div>
    <div className="flex flex-col h-full">
      <nav className="sticky top-0 z-50 container p-4 bg-slate-800 max-w-full font-medium">
        <div className="flex items-center justify-center">
          <div className="flex space-x-6 text-white">
            <a href="/" className="px-10">Home</a>
            <a href="/docs" className="px-10">Documentation</a>
            <a href={`${chainExplorerUrl}/${factoryAddress}`} target="blank" className="px-10">Explore Contract</a>
            <a href="/author" className="px-10">About Author</a>
          </div>
        </div>
      </nav>
      <section className="grow p-4" id="hero">
        { children }
      </section>
      <footer className="sticky bottom-0 z-50 bg-very-dark-blue">
        <div className="flex sm:items-center items-center justify-center p-4 bg-slate-600">
          <div className="flex flex-col sm:flex-row items-center space-x-6 text-white font-mono">
            <a
              href="https://github.com/alexsanya/heritage_contract"
              target="blank"
              className="px-10"
            >
              source code
            </a>
            <a href="mailto:alexsanyakoval@gmail.com">report a bug</a>
            <a href="https://polygon.technology/" target="blank">
              <div className="flex flex-row justify-items-start gap-2 items-center px-10">
                built on
                <img src="/polygon-logo.svg" className="w-8" />
                Polygon
              </div>
            </a>
            <a href="https://ud.me/kovalas.wallet" target="blank">support author</a>
          </div>
        </div>
      </footer>
    </div>
  </>);
}

export default MainTemplate;

