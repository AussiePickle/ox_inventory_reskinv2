import React, { useCallback, useRef } from 'react';
import { DragSource, DropTarget, Inventory, InventoryType, Slot, SlotWithItem } from '../../typings';
import { useDrag, useDragDropManager, useDrop } from 'react-dnd';
import { useAppDispatch } from '../../store';
import WeightBar from '../utils/WeightBar';
import { onDrop } from '../../dnd/onDrop';
import { onBuy } from '../../dnd/onBuy';
import { Items } from '../../store/items';
import { canCraftItem, canPurchaseItem, getItemUrl, isSlotWithItem } from '../../helpers';
import { onUse } from '../../dnd/onUse';
import { Locale } from '../../store/locale';
import { onCraft } from '../../dnd/onCraft';
import useNuiEvent from '../../hooks/useNuiEvent';
import { ItemsPayload } from '../../reducers/refreshSlots';
import { closeTooltip, openTooltip } from '../../store/tooltip';
import { openContextMenu } from '../../store/contextMenu';
import { useMergeRefs } from '@floating-ui/react';

interface SlotProps {
  inventoryId: Inventory['id'];
  inventoryType: Inventory['type'];
  inventoryGroups: Inventory['groups'];
  inventoryKey: 'leftInventory' | 'backpackInventory' | 'rightInventory';
  item: Slot;
}

const InventorySlot: React.ForwardRefRenderFunction<HTMLDivElement, SlotProps> = (
  { item, inventoryId, inventoryType, inventoryGroups, inventoryKey },
  ref
) => {
  const manager = useDragDropManager();
  const dispatch = useAppDispatch();
  const timerRef = useRef<number | null>(null);

  const canDrag = useCallback(() => {
    return canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) &&
      canCraftItem(item, inventoryType);
  }, [item, inventoryType, inventoryGroups]);

  // Drag source
  const [{ isDragging }, drag] = useDrag<DragSource, void, { isDragging: boolean }>(
    () => ({
      type: 'SLOT',
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      item: () =>
        isSlotWithItem(item, inventoryType !== InventoryType.SHOP)
          ? {
              item: item as SlotWithItem, // Pass the full item object
              inventory: inventoryType as InventoryType,
              inventoryKey,
              image: item?.name ? `url(${getItemUrl(item) || 'none'})` : undefined,
            }
          : null,
      canDrag,
    }),
    [inventoryType, item, inventoryKey]
  );

  // Drop target
  const [{ isOver }, drop] = useDrop<DragSource, void, { isOver: boolean }>(
    () => ({
      accept: 'SLOT',
      collect: (monitor) => ({ isOver: monitor.isOver() }),
      drop: (source) => {
        dispatch(closeTooltip());

        const targetData: DropTarget = {
          item: item,
          inventory: inventoryType as InventoryType,
          targetInventoryKey: inventoryKey,
        };

        switch (source.inventory) {
          case InventoryType.SHOP:
            onBuy(source, targetData);
            break;
          case InventoryType.CRAFTING:
            onCraft(source, targetData);
            break;
          default:
            onDrop(source, targetData);
            break;
        }
      },
      canDrop: (source) =>
        source.item.slot !== item.slot || source.inventoryKey !== inventoryKey,
    }),
    [inventoryType, item, inventoryKey]
  );

  useNuiEvent('refreshSlots', (data: { items?: ItemsPayload | ItemsPayload[] }) => {
    if (!isDragging || !data.items) return;
    if (!Array.isArray(data.items)) return;

    const itemSlot = data.items.find(
      (dataItem) => dataItem.item.slot === item.slot && dataItem.inventory === inventoryId
    );

    if (!itemSlot) return;
    manager.dispatch({ type: 'dnd-core/END_DRAG' });
  });

  const connectRef = (element: HTMLDivElement) => drag(drop(element));

  const handleContext = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSlotWithItem(item)) return;
  
    // Create the properly typed context item
    const contextItem = {
      ...item,
      inventoryType: inventoryType as InventoryType, // Cast to enum type
      inventoryKey: inventoryKey, // This is already the right type
    };
  
    dispatch(
      openContextMenu({
        item: contextItem,
        coords: { x: event.clientX, y: event.clientY },
      })
    );
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    dispatch(closeTooltip());
    if (timerRef.current) clearTimeout(timerRef.current);
  
    if (event.ctrlKey && isSlotWithItem(item)) {
      let targetInventoryKey: SlotProps['inventoryKey'] = inventoryKey;
  
      // Determine target inventory dynamically
      if (inventoryKey === 'leftInventory') targetInventoryKey = 'backpackInventory';
      else if (inventoryKey === 'backpackInventory') targetInventoryKey = 'leftInventory';
      else targetInventoryKey = 'backpackInventory'; // default
  
      // Create proper DragSource and DropTarget for onDrop
      const dragSource: DragSource = {
        item: item as SlotWithItem,
        inventory: inventoryType as InventoryType,
        inventoryKey,
      };
  
      const dropTarget: DropTarget = {
        item: item,
        inventory: inventoryType as InventoryType,
        targetInventoryKey,
      };
  
      onDrop(dragSource, dropTarget);
    } else if (event.altKey && isSlotWithItem(item) && inventoryType === 'player') {
      // Fix the onUse call - create the properly typed object
      const usePayload = {
        ...item,
        inventoryKey: inventoryKey,
        inventoryType: inventoryType as InventoryType,
      };
      
      onUse(usePayload);
    }
  };

  const refs = useMergeRefs([connectRef, ref]);

  return (
    <div
      ref={refs}
      onContextMenu={handleContext}
      onClick={handleClick}
      className="inventory-slot"
      style={{
        filter:
          !canPurchaseItem(item, { type: inventoryType, groups: inventoryGroups }) ||
          !canCraftItem(item, inventoryType)
            ? 'brightness(80%) grayscale(100%)'
            : undefined,
        opacity: isDragging ? 0.4 : 1.0,
        backgroundImage: `url(${item?.name ? getItemUrl(item as SlotWithItem) : 'none'}`,
        border: isOver ? '1px dashed rgba(255,255,255,0.4)' : '',
      }}
    >
      {isSlotWithItem(item) && (
        <div
          className="item-slot-wrapper"
          onMouseEnter={() => {
            timerRef.current = window.setTimeout(() => {
              dispatch(openTooltip({ item, inventoryType }));
            }, 500) as unknown as number;
          }}
          onMouseLeave={() => {
            dispatch(closeTooltip());
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }
          }}          
        >
          {/* Count badge in top-left */}
          {item.count && item.count > 1 && (
            <div className="item-slot-count">
              {item.count.toLocaleString('en-us')}x
            </div>
          )}
          <div
            className={
              inventoryType === 'player' && inventoryKey === 'leftInventory' && item.slot <= 5
                ? 'item-hotslot-header-wrapper'
                : 'item-slot-header-wrapper'
            }
          >
            {inventoryType === 'player' && inventoryKey === 'leftInventory' && item.slot <= 5 && (
              <div className="inventory-slot-number">{item.slot}</div>
            )}
          </div>

          <div>
            {inventoryType !== 'shop' && item?.durability !== undefined && <WeightBar percent={item.durability} durability />}
            {inventoryType === 'shop' && item?.price !== undefined && (
              <>
                {item?.currency !== 'money' && item.currency !== 'black_money' && item.price > 0 && item.currency ? (
                  <div className="item-slot-currency-wrapper">
                    <img
                      src={item.currency ? getItemUrl(item.currency) : 'none'}
                      alt="item-image"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        height: 'auto',
                        width: '2vh',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                      }}
                    />
                    <p>{item.price.toLocaleString('en-us')}</p>
                  </div>
                ) : (
                  item.price > 0 && (
                    <div
                      className="item-slot-price-wrapper"
                      style={{ color: item.currency === 'money' || !item.currency ? '#2ECC71' : '#E74C3C' }}
                    >
                      <p>
                        {Locale.$ || '$'}
                        {item.price.toLocaleString('en-us')}
                      </p>
                    </div>
                  )
                )}
              </>
            )}
            <div className="inventory-slot-label-box">
              <div className="inventory-slot-label-text">
                {item.metadata?.label ? item.metadata.label : Items[item.name]?.label || item.name}
              </div>
              <div className="item-slot-info-wrapper">
                <p>
                  {item.weight && item.weight > 0
                    ? item.weight >= 1000
                      ? `${(item.weight / 1000).toLocaleString('en-us', { minimumFractionDigits: 2 })}kg `
                      : `${item.weight.toLocaleString('en-us', { minimumFractionDigits: 0 })}g `
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(React.forwardRef(InventorySlot));