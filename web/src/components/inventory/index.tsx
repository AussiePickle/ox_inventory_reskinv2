import React, { useState } from 'react';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryWrapper from './InventoryWrapper';
import InventoryControl from './InventoryControl';
import InventoryHotbar from './InventoryHotbar';
import Tooltip from '../utils/Tooltip';
import InventoryContext from './InventoryContext';
import { useAppDispatch } from '../../store';
import { setupInventory, refreshSlots, setAdditionalMetadata } from '../../store/inventory';
import { closeTooltip } from '../../store/tooltip';
import { closeContextMenu } from '../../store/contextMenu';
import { useExitListener } from '../../hooks/useExitListener';
import Fade from '../utils/transitions/Fade';

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const dispatch = useAppDispatch();

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    dispatch(closeContextMenu());
    dispatch(closeTooltip());
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: any;
    rightInventory?: any;
    backpackInventory?: any;
  }>('setupInventory', (data) => {
    dispatch(setupInventory(data));
    !inventoryVisible && setInventoryVisible(true);
  });

  useNuiEvent('refreshSlots', (data) => dispatch(refreshSlots(data)));
  useNuiEvent('displayMetadata', (data) => dispatch(setAdditionalMetadata(data)));

  return (
    <>
      <Fade in={inventoryVisible}>
        <InventoryWrapper />
      </Fade>
      <InventoryControl />
      <Tooltip />
      <InventoryContext />
      <InventoryHotbar />
    </>
  );
};

export default Inventory;
