import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import type { Inventory as InventoryProps } from '../../typings';
import { selectLeftInventory, selectBackpackInventory } from '../../store/inventory';

interface LeftInventoryProps {
  inventoryKey?: 'leftInventory' | 'backpackInventory';
}

const LeftInventory: React.FC<LeftInventoryProps> = ({ inventoryKey = 'leftInventory' }) => {
  const inventory: InventoryProps | null =
    inventoryKey === 'leftInventory'
      ? useAppSelector(selectLeftInventory)
      : useAppSelector(selectBackpackInventory);

  if (!inventory) return null;

  // ✅ Here is where you put the return
  return (
    <div className="inventory-panel">
      {/* Pass inventoryKey down to InventoryGrid */}
      <InventoryGrid inventory={inventory} inventoryKey={inventoryKey} />
    </div>
  );
};

export default LeftInventory;
