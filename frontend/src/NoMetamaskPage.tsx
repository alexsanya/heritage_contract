const NoMetamaskPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="font-xl font-medium">
        You have to install <a href="https://metamask.io/" target="blank" className="underline text-sky-500">Metamask</a> for using this application
      </h1>
      <div className="flex flex-col sm:flex-row justify-center my-4">
        <a
          href="https://metamask.io/"
          target="blank"
          className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-800 p-2 max-w-fit"
        >
          <img src="/metamask-white.png" className="w-10" />
          <div className="text-xl font-medium text-white">Install metamask</div>
        </a>
      </div>
    </div>
  );
}

export default NoMetamaskPage;
