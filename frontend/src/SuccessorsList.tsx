import { useState } from "react";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

import ValueEdit from './ValueEdit';

export interface SuccessorConstraints {
  limit: number;
  share: number;
  wallet: string;
}

type Props = {
  successors: {[name: string]: SuccessorConstraints},
  onChange: (name: string, share: number, limit: number) => void,
  onRemove: (name: string) => void
}

export const SuccessorsList: React.FC<Props> = ({ successors, onChange, onRemove }) => {
  const successorsNames =  Object.keys(successors);
  const absorber = successorsNames[successorsNames.length - 1];


  const limits = Object.keys(successors).reduce((acc, key) => ({...acc, [key]: successors[key].limit}), {})
  const [monthlyLimits, setMonthlyLimits] = useState<{[name: string]: number}>(limits);


  const handleChange = (name: string, newValue: number | number[], newLimit: number) => {
    console.log(name, newValue);
    console.log(name, newLimit);
    onChange(name, newValue as number, newLimit);
  };

  const getSuccessorsList = () => {
    return successorsNames.map(name => (
      <div className="flex flex-row px-1 m-3 gap-4 items-center">
        <div className="flex-none">{ name }</div>
        <input
          type="range"
          min={0}
          max={100}
          onChange={event => handleChange(name, parseInt(event.target.value), successors[name].limit)}
          value={successors[name].share}
          disabled={ name === absorber }
          className="slider"
        />
      </div>

    ));
  }

  const getSuccessorsLimits = () => {
    return successorsNames.map(name => (
      <div>{successors[name].limit}</div>
    ));
  }

  const EditButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
      <img
        src="/edit.svg"
        className="w-8 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 my-2"
        onClick={onClick}
      />
    );
  }


  return (
    <div className="flex flex-row items-center italic">
      <div className="grow">
        {getSuccessorsList()}
      </div>
      <div className="text-right flex-none flex flex-col gap-y-3 mr-1">
        {getSuccessorsLimits()}
      </div>
      <div className="flex flex-none flex-col gap-y-1 max-w-xs">
        {successorsNames.map(name => {
          return <div className="flex flex-row">
            <ValueEdit
              initial={successors[name].limit}
              commit="Set"
              cancel="Cancel"
              onCommit={value => handleChange(name, successors[name].share, value)}
              Trigger={EditButton}
            />
          </div>
      })
      }
      </div>
    </div>
  );
}

