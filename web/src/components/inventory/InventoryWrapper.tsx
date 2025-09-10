import React from 'react';
import { useAppSelector } from '../../store';
import InventoryGrid from './InventoryGrid';
import { Inventory } from '../../typings';

const InventoryWrapper: React.FC = () => {
  const leftInventory = useAppSelector((state) => state.inventory.leftInventory);
  const rightInventory = useAppSelector((state) => state.inventory.rightInventory);
  const backpackInventory = useAppSelector((state) => state.inventory.backpackInventory);

  return (
    <div className="inventory-wrapper" style={{ display: 'flex', gap: '20px' }}>
      {/* Left Column: Player + Backpack */}
      <div className="left-column" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <InventoryGrid inventory={leftInventory} inventoryKey="leftInventory" />
        {backpackInventory && (
          <InventoryGrid inventory={backpackInventory} inventoryKey="backpackInventory" />
        )}
      </div>

      {/* Right Inventory */}
      <InventoryGrid inventory={rightInventory} inventoryKey="rightInventory" />
    </div>
  );
};

export default InventoryWrapper;
