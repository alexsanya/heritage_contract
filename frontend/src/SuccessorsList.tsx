import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
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

  const handleChange = (name: string, event: Event, newValue: number | number[]) => {
    console.log(name, newValue);
    onChange(name, newValue as number, 100);
  };

  const getSuccessorsList = () => {
    return successorsNames.map(name => (
      <Stack direction="row" alignItems="center" spacing={1}>
        <div>{ name }</div>
        <Slider
          aria-label="Share"
          value={successors[name].share}
          step={1}
          onChange={(event: Event, newValue: number | number[]) => handleChange(name, event, newValue)}
          marks
          min={0}
          max={100}
          valueLabelDisplay="on"
          disabled={ name === absorber }
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

