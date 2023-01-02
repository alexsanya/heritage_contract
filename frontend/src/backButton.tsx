import { useNavigate } from "react-router-dom";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit"
      onClick={() => navigate(-1)}
    >
      <img src="/back.svg" className="w-10" />
      <div className="text-xl">Back</div>
    </div>
  );
}

export default BackButton;

