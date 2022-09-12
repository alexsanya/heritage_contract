import Slider from '@mui/material/Slider';

export interface SuccessorConstraints {
  limit: number;
  share: number;
}

type Props = {
  successors: {[name: string]: SuccessorConstraints},
  onChange: (name: string, share: number, limit: number) => void  
}

export const SuccessorsList: React.FC<Props> = ({ successors, onChange }) => {
  const successorsNames =  Object.keys(successors);
  const absorber = successorsNames[successorsNames.length - 1];

  const handleChange = (name: string, event: Event, newValue: number | number[]) => {
    console.log(name, newValue);
    onChange(name, newValue as number, 100);
  };

  const getSuccessorsList = () => {
    return successorsNames.map(name => (
      <>
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
      </>
    ));
  }

  return (
    <>
      {getSuccessorsList()}
    </>
  );
}

