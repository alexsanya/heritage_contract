import BackButton from './backButton';

const NetworksPanel = () => {
  return (
    <div className="flex flex-row items-center justify-between w-full md:w-1/4 gap-3 md:gap-0">
      <a href="https://www.linkedin.com/in/kovalas/" target="blank">
        <img src="/linkedin.svg" className="w-10" />
      </a>
      <a href="https://github.com/alexsanya" target="blank"> 
        <img src="/github.svg" className="w-10" />
      </a>
      <a href="https://www.instagram.com/a_l_e_x_s_a_n_y_a" target="blank">
        <img src="/instagram.svg" className="w-10" />
      </a>
      <a href="mailto:alexsanyakoval@gmail.com">
        <img src="/email.svg" className="w-10" />
      </a>
    </div>
  );
}

const ButtonsPanel = () => {
  return (
    <div className="flex flex-row items-center justify-center">
      <a
        className="flex flex-row items-center cursor-pointer rounded-lg drop-shadow-md bg-slate-800 p-2 my-6"
        href="/Koval-BE-dev.pdf"
        target="blank"
      >
        <img src="/resume.png" className="w-10 px-1" />
        <div className="text-xl font-medium text-white">My CV</div>
      </a>
    </div>
  );
}


const AuthorPage = () => {
  return (<>
    <BackButton />
    <div className="flex flex-col items-center">
      <img src="/myPhoto.jpeg" className="rounded-full drop-shadow-md w-[250px]"/>
      <div className="p-4 w-3/4 italic font-sans text-center">
       Digital nomad, traveller, technologies enthuziast, rock climber, motorcyclists, paraplane pilot and FPV pilot, more skills will come in the future...
 Currently living in Quito, Ecuador. My mision is to make this world a better place using modern technologies
      </div>
      <NetworksPanel />
      <ButtonsPanel />
    </div>
  </>);
}

export default AuthorPage;
