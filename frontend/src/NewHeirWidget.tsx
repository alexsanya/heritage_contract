import { useState, useContext } from "react";
import { MetamaskContext } from './ConnectWallet';
import { useParams } from "react-router-dom";
import getTestament from './getTestament';
import { ValueEdit, UserInputs } from './ValueEdit';

interface INewHeirWidgetProps {
  onAdd: (name: string, address: string) => void
}

const AddButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div
      className="flex flex-row items-center gap-2 cursor-pointer rounded-lg drop-shadow-md bg-slate-200 p-2 max-w-fit"
      onClick={ onClick }
    >
      <img src="/person.svg" className="w-4" />
      <div className="text-base">add...</div>
    </div>
  );
}

const checkIfAddressRegistered = async (testamentAddress: string, address: string) => {
  const testament = getTestament(testamentAddress);
  const isRegistered = await testament.methods.potentialSuccessors(address).call();
  return isRegistered;
}


const NewHeirWidget: React.FC<INewHeirWidgetProps> = ({ onAdd }) => {
  const [ address, setAddress ] = useState<string | boolean>(false);
  const [ validTag, setValidTag ] = useState<string | boolean>(false);
  const [ invalidTag, setInvalidTag ] = useState<string | boolean>(false);
  const { address: testamentAddress } = useParams();

  const { withLoader } = useContext(MetamaskContext);

  const validateAddress = async (address: string | number) => {
    const isRegistered = testamentAddress && (await checkIfAddressRegistered(testamentAddress, address as string));
    setAddress(address as string);
    if (isRegistered) {
      setValidTag(address as string);
      setInvalidTag(false);
    } else {
      setValidTag(false);
      setInvalidTag(address as string);
    }
  }

  const onHeirAdded = (value: string | number) => {
    onAdd(`${value}`, address as string);
    setValidTag(false);
    setInvalidTag(false);
  }

  const onAddHeirFormShow = () => {
    setValidTag(false);
    setInvalidTag(false);
  }

  const onValidateAddress = (address: string | number) => {
    withLoader(() => validateAddress(address), 'Validating address...');
  }

  return (<>
    { !validTag && (
        <ValueEdit
          commit="validate"
          cancel="cancel"
          placeholder="address"
          initial={0}
          onShow={onAddHeirFormShow}
          onCommit={onValidateAddress}
          Trigger={AddButton}
        />
    )}
      { validTag && (<>
        <div className="rounded-lg bg-green-700 drop-shadow-md mx-2 my-4 px-3 py-1 text-white w-fit drop-shadow-md">Valid: ${address as string}</div>
        <UserInputs
          shown={true}
          hide={onAddHeirFormShow}
          commit="add"
          cancel="cancel"
          initial=""
          placeholder="name"
          onValueChange={onHeirAdded}
        />
      </>) }
      { invalidTag && (
        <div className="rounded-full bg-red-700 drop-shadow-md mx-2 my-4 px-3 py-1 text-white w-fit drop-shadow-md">Invalid: ${address as string}</div>
      ) }
  </>);
}

export default NewHeirWidget;
