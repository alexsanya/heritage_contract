import { useState } from 'react';
import MainTemplate from './main-template';

const chapters = [
{ time: '00:00' , name: 'The idea of project' },
{ time: '04:13' , name: 'Create new testament' },
{ time: '06:26' , name: 'Add / Withdraw funds' },
{ time: '08:54' , name: 'Add heirs to testament' },
{ time: '13:10' , name: 'Specify shares' },
{ time: '18:00' , name: 'Heirs interface' },
{ time: '19:43' , name: 'Reset timer' },
{ time: '23:51' , name: 'Withdraw shares' },
{ time: '26:51', name: 'Withdraw in parts' },
{ time: '30:06', name: 'USDC tokens on Polygon main net'},
{ time: '38:33', name: 'Delete contracts'}
];

const Tutorial: React.FC<{startFrom: number}> = ({ startFrom }) => {
  const rawHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/011J4l032Ec?start=${startFrom}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;

  return (
    <div dangerouslySetInnerHTML={{__html: rawHtml}} />
  );
}

interface IVideoChapter {
  time: string;
  name: string;
}

const Chapter: React.FC<IVideoChapter & { onSelect: (time: number) => void }> = ({ time, name, onSelect}) => {
  const [min, sec] = time.split(':').map(number => parseInt(number));
  const timestamp = min*60+sec;
  return (
    <div onClick={() => onSelect(timestamp)}>{name}</div>
  );
}

const VideoNavigation: React.FC<{chapters: IVideoChapter[], onChapterSwitch: (time: number) => void}> = ({ chapters, onChapterSwitch }) => {
  const [activeItem, setActiveItem] = useState(0);

  return (
    <ul className="flex flex-col gap-2 p-4">
      {chapters.map(({time, name}, index) => (
        <li className={  "cursor-pointer p-2 rounded-md font-medium" + (index === activeItem ? " bg-slate-600 text-white" : "")}>
          <Chapter time={time} name={name} onSelect={(time: number)=> {setActiveItem(index); onChapterSwitch(time)}} />
        </li>
      ))}
    </ul>
  );
}

const DocsPage = () => {
  const [startFrom, setStartFrom] = useState(0);

  return (
      <div className="flex flex-row items-center justify-center h-full">
        <VideoNavigation chapters={chapters} onChapterSwitch={time => setStartFrom(time)}/>
        <div>
          <Tutorial startFrom={startFrom} />
        </div>
      </div>
  );
}

export default DocsPage;
