import { useState } from "react";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

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
  const [succesorLimit, setSuccesorLimit] = useState('');


  const handleChange = (name: string, newValue: number | number[], newLimit: number) => {
    console.log(name, newValue);
    console.log(name, newLimit);
    onChange(name, newValue as number, newLimit);
  };

  const getSuccessorsList = () => {
    return successorsNames.map(name => (
      <Stack direction="row" alignItems="center" spacing={1}>
        <div>{ name }</div>
        <Slider
          aria-label="Share"
          value={successors[name].share}
          step={1}
          onChange={(event: Event, newValue: number | number[]) => handleChange(name, newValue, successors[name].limit)}
          min={0}
          max={100}
          valueLabelDisplay="on"
          disabled={ name === absorber }
        />
        <TextField
          id=""
          label="limit"
          variant="standard"
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          value={successors[name].limit.toString()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleChange(name, successors[name].share, parseInt(event.target.value))}
        />
        { successorsNames.length > 1 && (
          <IconButton aria-label="delete" size="small" onClick={() => onRemove(name)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        ) }
      </Stack>
    ));
  }

  return (
    <>
      {getSuccessorsList()}
    </>
  );
}

