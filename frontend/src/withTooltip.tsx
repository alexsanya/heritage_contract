import { useState } from 'react';

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal
} from "@floating-ui/react";

interface IWithTooltipProps {
  Widget: React.FC<{ anchor: any }>,
  title: string
}

const WithTooltip: React.FC<IWithTooltipProps> = ({ Widget, title }) => {
  const [open, setOpen] = useState(false);

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    whileElementsMounted: autoUpdate,
    middleware: [offset(5), flip(), shift()]
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role
  ]);

  return (<>
      <Widget anchor={reference} {...getReferenceProps()} />
      <FloatingPortal>
        {open && (
          <div
            className="Tooltip"
            ref={floating}
            style={{
              position: strategy,
              background: 'white',
              padding: 2,
              borderRadius: 4,
              top: y ?? 0,
              left: x ?? 0
            }}
            {...getFloatingProps()}
          >
            { title }
          </div>
        )}
      </FloatingPortal>
    
  </>);
}

export default WithTooltip;
