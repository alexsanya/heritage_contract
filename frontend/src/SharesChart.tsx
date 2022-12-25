import { SuccessorConstraints } from './SuccessorsList';
import {CanvasJSChart} from 'canvasjs-react-charts';


const SharesChart: React.FC<{ successors: {[name: string]: SuccessorConstraints} }> = ({ successors }) => {
  const dataPoints = Object.keys(successors).map(name => ({ y: successors[name].share, label: name}));

  const options = {
    animationEnabled: true,
    data: [{
      type: "pie",
      startAngle: 75,
      toolTipContent: "<b>{label}</b>: {y}%",
      showInLegend: "false",
      legendText: "{label}",
      indexLabelFontSize: 16,
      indexLabel: "{label} - {y}%",
      dataPoints 
    }]
  }


  return (
			<CanvasJSChart options = {options}
				/* onRef={ref => this.chart = ref} */
			/>
  );
}

export default SharesChart;
