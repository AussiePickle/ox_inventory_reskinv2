import React from 'react';
import { useAppSelector } from '../../store';
import { onUse } from '../../dnd/onUse';
import { onGive } from '../../dnd/onGive';
import { onDrop } from '../../dnd/onDrop';
import { Items } from '../../store/items';
import { fetchNui } from '../../utils/fetchNui';
import { Locale } from '../../store/locale';
import { isSlotWithItem } from '../../helpers';
import { setClipboard } from '../../utils/setClipboard';
import { Menu, MenuItem } from '../utils/menu/Menu';
import { SlotWithItem } from '../../typings/slot';
import { InventoryType, DragSource, DropTarget } from '../../typings/inventory';

interface DataProps {
  action: string;
  component?: string;
  slot?: number;
  serial?: string;
  id?: number;
}

interface Button {
  label: string;
  index: number;
  group?: string;
}

interface ButtonWithIndex extends Button {
  index: number;
}

interface Group {
  groupName: string | null;
  buttons: ButtonWithIndex[];
}

type GroupedButtons = Group[];

type ContextSlot = SlotWithItem & {
  inventoryKey: 'leftInventory' | 'backpackInventory' | 'rightInventory';
  inventoryType: InventoryType;
};

const InventoryContext: React.FC = () => {
  const contextMenu = useAppSelector((state) => state.contextMenu);
  const item = contextMenu.item as ContextSlot | null;

  if (!item) return null;

  // Convert string[] buttons to Button[]
  const buttonsForItem: Button[] = (Items[item.name]?.buttons || []).map((label, index) => ({
    label,
    index,
  }));

  const groupButtons = (buttons?: Button[]): GroupedButtons => {
    if (!buttons) return [];
    return buttons.reduce((groups: Group[], button: Button, index: number) => {
      const btn: ButtonWithIndex = { ...button, index };
      if (button.group) {
        const groupIndex = groups.findIndex((g) => g.groupName === button.group);
        if (groupIndex !== -1) {
          groups[groupIndex].buttons.push(btn);
        } else {
          groups.push({ groupName: button.group, buttons: [btn] });
        }
      } else {
        groups.push({ groupName: null, buttons: [btn] });
      }
      return groups;
    }, []);
  };

  const handleClick = (data: DataProps) => {
    if (!item || !isSlotWithItem(item)) return;

    const dragSource: DragSource = {
      item, // SlotWithItem
      inventory: item.inventoryType,
      inventoryKey: item.inventoryKey,
    };

    // Use the proper DropTarget type instead of local DropData
    const dropTarget: DropTarget = {
      inventory: InventoryType.PLAYER, // Now using the enum type
      targetInventoryKey: 'backpackInventory',
      item: { slot: item.slot },
    };

    switch (data.action) {
      case 'use':
        if (item) onUse(item);
        break;
      case 'give':
        if (item) onGive(item);
        break;
      case 'drop':
        onDrop(dragSource, dropTarget);
        break;
      case 'remove':
        if (data.component && data.slot !== undefined) {
          fetchNui('removeComponent', { component: data.component, slot: data.slot });
        }
        break;

      case 'removeAmmo':
        if (item.metadata?.ammo) fetchNui('removeAmmo', item.slot);
        break;

      case 'copy':
        if (item.metadata?.serial) setClipboard(item.metadata.serial);
        break;

      case 'custom':
        fetchNui('useButton', { id: (data.id || 0) + 1, slot: item.slot });
        break;

      default:
        break;
    }
  };

  return (
    <Menu>
      <MenuItem onClick={() => handleClick({ action: 'use' })} label={Locale.ui_use || 'Use'} />
      <MenuItem onClick={() => handleClick({ action: 'give' })} label={Locale.ui_give || 'Give'} />
      <MenuItem onClick={() => handleClick({ action: 'drop' })} label={Locale.ui_drop || 'Drop'} />

      {item.metadata?.ammo && item.metadata.ammo > 0 && (
        <MenuItem onClick={() => handleClick({ action: 'removeAmmo' })} label={Locale.ui_remove_ammo} />
      )}
      
      {item.metadata?.serial && (
        <MenuItem onClick={() => handleClick({ action: 'copy', serial: item.metadata?.serial || '' })} label={Locale.ui_copy} />
      )}

      {item.metadata?.components?.length ? (
        <Menu label={Locale.ui_removeattachments}>
          {item.metadata.components.map((component: string, index: number) => (
            <MenuItem
              key={index}
              onClick={() => handleClick({ action: 'remove', component, slot: item.slot })}
              label={Items[component]?.label || ''}
            />
          ))}
        </Menu>
      ) : null}

      {buttonsForItem?.length ? (
        groupButtons(buttonsForItem).map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {group.groupName ? (
              <Menu label={group.groupName}>
                {group.buttons.map((button) => (
                  <MenuItem
                    key={button.index}
                    onClick={() => handleClick({ action: 'custom', id: button.index })}
                    label={button.label}
                  />
                ))}
              </Menu>
            ) : (
              group.buttons.map((button) => (
                <MenuItem
                  key={button.index}
                  onClick={() => handleClick({ action: 'custom', id: button.index })}
                  label={button.label}
                />
              ))
            )}
          </React.Fragment>
        ))
      ) : null}
    </Menu>
  );
};

export default InventoryContext;