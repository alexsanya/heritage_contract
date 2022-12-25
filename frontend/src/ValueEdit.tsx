import { useState } from "react";

interface IValueEditProps {
  commit: string;
  cancel: string;
  initial: number;
  onCommit: (value: number) => void;
  Trigger: React.FC<{ onClick: () => void }>
}

const ValueEdit: React.FC<IValueEditProps> = ({ commit, cancel, initial, onCommit, Trigger }) => {
  const [value, setValue] = useState(initial);
  const [shown, setShown] = useState(false);

  const onValueChange = () => {
    onCommit(value);
    setShown(false);
  };

  return (
    <div className="flex flex-row px-1 mx-1 items-center">
      <div className = {(shown ? 'invisible' : '')}>
        <Trigger onClick={() => setShown(true)}/>
      </div>
      { shown && (<>
        <input
          type="text" 
          className="border border-solid divide-slate-300 p-1 rounded-md max-w-[150px]"
          placeholder="enter token address"
          value={value}
          onChange={event => setValue(+event.target.value)} 
        />
        <div
          className="cursor-pointer rounded-md bg-slate-100 drop-shadow-md mx-1 px-3 py-1"
          onClick={onValueChange}
        >
          { commit }
        </div>
        <div
          className="cursor-pointer rounded-md bg-slate-100 drop-shadow-md mx-1 px-3 py-1"
          onClick={() => setShown(false)}
        >
          { cancel }
        </div>
      </>) }
    </div>
  );
}

export default ValueEdit;
