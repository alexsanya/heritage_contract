import { useState } from "react";
import { ValueEdit } from './ValueEdit';

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

  const handleChange = (name: string, newValue: number | number[], newLimit: number) => {
    console.log(name, newValue);
    console.log(name, newLimit);
    onChange(name, newValue as number, newLimit);
  };

  const getSuccessorsSliders = () => {
    return successorsNames.map(name => (
        <input
          type="range"
          min={0}
          max={100}
          onChange={event => handleChange(name, parseInt(event.target.value), successors[name].limit)}
          value={successors[name].share}
          disabled={ name === absorber }
          className="slider"
        />

    ));
  }

  const getSuccessorsNames = () => {
    return successorsNames.map(name => (
      <div className="flex-none">{ `${name} (${successors[name].share}%)` }</div>
    ))
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
      <div className="flex-none flex flex-col items-conter gap-y-3 mr-1">
        {getSuccessorsNames()}
      </div>
      <div className="grow flex flex-col gap-y-5 my-2 pr-4">
        {getSuccessorsSliders()}
      </div>
      <div className="flex flex-none flex-col gap-y-1 max-w-xs">
        {successorsNames.map(name => {
          return <div className="flex flex-row content-end items-end self-end">
            <ValueEdit
              initial={successors[name].limit}
              commit="Set"
              cancel="Cancel"
              placeholder="amount"
              showValue={true}
              onCommit={value => handleChange(name, successors[name].share, +value)}
              Trigger={EditButton}
            />
          </div>
      })
      }
      </div>
      <div className="flex flex-none flex-col gap-y-1 max-w-xs">
        {(successorsNames.length > 1) && successorsNames.map((name) => {
          return <img
            src="/delete.svg"
            className="w-8 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-1 my-2"
            onClick={() => onRemove(name)}
          />
        })}
      </div>
    </div>
  );
}

