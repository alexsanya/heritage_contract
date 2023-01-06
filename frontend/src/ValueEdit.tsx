import { useState } from "react";

interface IUserInputs {
  shown: boolean;
  onValueChange: (value: string | number) => void;
  hide: () => void;
  commit: string;
  cancel: string;
  placeholder: string;
  initial: number | string;
}

interface IValueEditProps {
  commit: string;
  cancel: string;
  placeholder: string;
  initial: string | number;
  showValue?: boolean,
  onShow?: () => void;
  onCommit: (value: number | string) => void;
  Trigger: React.FC<{ onClick: () => void }>
}

export const UserInputs: React.FC<IUserInputs> = ({ shown, onValueChange, commit, cancel, placeholder, initial, hide }) => {
  const [value, setValue] = useState<any>(initial);

  return (
    <div className="flex flex-row items-center">
      <input
        type="text" 
        className="border border-solid divide-slate-300 p-1 rounded-md max-w-[150px]"
        placeholder={placeholder}
        value={value}
        onChange={event => setValue(event.target.value)} 
      />
      <div
        className="cursor-pointer rounded-md bg-slate-100 drop-shadow-md mx-1 px-3 py-1"
        onClick={() => onValueChange(value)}
      >
        { commit }
      </div>
      <div
        className="cursor-pointer rounded-md bg-slate-100 drop-shadow-md mx-1 px-3 py-1"
        onClick={hide}
      >
        { cancel }
      </div>
    </div>
  );
}

export const ValueEdit: React.FC<IValueEditProps> = ({ commit, cancel, initial, showValue, onCommit, placeholder, onShow, Trigger }) => {
  const [shown, setShown] = useState(false);
  const [value, setValue] = useState(initial);

  const onValueChange = (value: string | number) => {
    onCommit(value);
    setValue(value);
    setShown(false);
  };

  return (
    <div className="flex flex-row px-1 mx-1 items-center">
      { showValue && !shown && <div>{value}</div> }
      <div className = {(shown ? 'invisible' : '')}>
        <Trigger onClick={() => {setShown(true); onShow && onShow();}}/>
      </div>
      { shown && <UserInputs
        shown={shown}
        placeholder={placeholder}
        onValueChange={onValueChange}
        commit={commit}
        cancel={cancel}
        initial={initial}
        hide={() => setShown(false)}/>
      }
    </div>
  );
}

