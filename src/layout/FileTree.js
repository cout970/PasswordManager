import {useAccount} from "../util/react";
import React, {useEffect, useMemo, useRef, useState} from "react";
import {collectAllFolderContents, collectFolderFileContents, moveFolder} from "../util/folder";
import {searchMatches} from "../util/util";
import {Button, Flex, Image, Text} from "@mantine/core";
import {
  IconArrowsMove,
  IconFilePower,
  IconFolder,
  IconFolderFilled,
  IconAbc,
  IconLock,
  IconQuestionMark,
  IconSettings, IconChevronRight, IconChevronDown
} from "@tabler/icons-react";
import {t} from "../util/i18n";
import {FolderSettingsModal} from "../components/FolderSettingsModal";
import {SecretSettingsModal} from "../components/SecretSettingsModal";
import {ServiceSettingsModal} from "../components/ServiceSettingsModal";
import {AlphabetSettingsModal} from "../components/AlphabetSettingsModal";
import {IconDisplay} from "../components/IconSelector";

/**
 * Shows a tree of all folders and files in the account.
 *
 * @param searchFilter
 * @returns {JSX.Element}
 * @constructor
 */
export function FileTree({searchFilter}) {
  const {account} = useAccount();
  const [open, setOpen] = useState({});

  const lines = useMemo(() => {
    let tmp = [];

    account.folders.forEach(folder => {
      collectAllFolderContents(folder, account, open, setOpen, [], tmp);
    });

    collectFolderFileContents(undefined, account, [], tmp);

    if (searchFilter) {
      tmp = tmp.map(line => {
        return {
          ...line,
          name: [...line.parents, line.name].join('/'),
          parents: [],
        }
      })
        .filter(line => searchMatches(line.name, searchFilter));
    }

    if (tmp.length) {
      tmp[tmp.length - 1].isEnd = true;
    }

    return tmp;
  }, [account, open, setOpen, searchFilter]);

  return <div className="file-tree-wrapper">
    <Flex className="file-tree" direction="column" gap="0" mih={200}>
      {lines.map(line => <FileTreeLine key={line.id} {...line} allLines={lines}/>)}

      {lines.length === 0 &&
        <Flex align="center" justify="center" mih={200}>
          <Text>{t("No results")}</Text>
        </Flex>
      }
    </Flex>
  </div>;
}

/**
 * Single line in the file tree.
 * @param {any} item
 * @param {string} name
 * @param {string[]} parents
 * @param {string} type
 * @param {boolean} isFirst
 * @param {boolean} isEnd
 * @param {boolean} isOpen
 * @param {boolean} isEmpty
 * @param {?string} icon
 * @param {()=>void} onClick
 * @param allLines
 * @returns {JSX.Element}
 * @constructor
 */
function FileTreeLine({item, name, parents, type, isFirst, isEnd, isOpen, isEmpty, icon, onClick, allLines}) {
  const [openSettings, setOpenSettings] = useState(false);
  let renderIcon = null;
  let iconSize = 32;

  if (type === 'folder') {
    renderIcon = isEmpty
      ? <IconFolder size={iconSize}/>
      : <IconFolderFilled size={iconSize}/>;
  } else if (type === 'service') {
    renderIcon = icon
      ? <IconDisplay value={icon} alt={name} size={iconSize}/>
      : <IconFilePower size={iconSize}/>;
  } else if (type === 'secret') {
    renderIcon = icon
      ? <IconDisplay value={icon} alt={name} size={iconSize}/>
      : <IconLock size={iconSize}/>;
  } else if (type === 'alphabet') {
    renderIcon = icon
      ? <IconDisplay value={icon} alt={name} size={iconSize}/>
      : <IconAbc size={iconSize}/>;
  } else {
    renderIcon = <IconQuestionMark size={iconSize}/>;
  }

  return <div className="file-tree-line">
    <GrabComponent allLines={allLines}/>

    <button className="file-tree-line-btn" onClick={() => onClick()}>
      <div className="line-prefix">
        {parents.map(i => {
          return <div className="line-prefix-vertical prev" key={'range-' + i}>
            <div className="line-prefix-vertical-top"/>
            <div className="line-prefix-vertical-bottom"/>
          </div>;
        })}

        <div className="line-prefix-vertical">
          <div className={"line-prefix-vertical-top" + (isFirst ? ' hidden' : '')}/>
          <div className={"line-prefix-vertical-bottom" + (isEnd ? ' hidden' : '')}/>
        </div>

        {type === 'folder'
          ? <div className={"line-prefix-folder" + (isOpen ? ' open' : '')}>
            <div className="back"/>
            {isOpen ? <IconChevronDown size="24px"/> : <IconChevronRight size="24px"/>}
          </div>
          : ''}

        <div className="line-prefix-horizontal"/>
      </div>

      <Flex className="text-part" align="center">
        {renderIcon} <Text ml={4}>{name}</Text>
      </Flex>
    </button>

    <Button className="config-btn" variant="subtle" ml="auto" onClick={() => setOpenSettings(true)}>
      <IconSettings size={16}/>
    </Button>

    {openSettings && type === 'service' &&
      <ServiceSettingsModal
        value={item}
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
    }

    {openSettings && type === 'secret' &&
      <SecretSettingsModal
        value={item}
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
    }

    {openSettings && type === 'alphabet' &&
      <AlphabetSettingsModal
        value={item}
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
    }

    {openSettings && type === 'folder' &&
      <FolderSettingsModal
        value={item}
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
    }
  </div>;
}

function GrabComponent({allLines}) {
  const {account, updateAccount} = useAccount();
  const [grabbing, setGrabbing] = useState(false);
  const rootRef = useRef();
  const phantomRef = useRef();
  const initialPosRef = useRef();

  useEffect(() => {
    let root = rootRef.current;
    if (!root) {
      return;
    }

    const setFolder = (type, item, folderId) => {
      console.log('setFolder', type, item, folderId);
      if (type === 'service') {
        updateAccount({
          services: account.services.map(s => s.id === item.id ? ({...s, folder: folderId}) : s)
        });
      } else if (type === 'secret') {
        updateAccount({
          secrets: account.secrets.map(s => s.id === item.id ? ({...s, folder: folderId}) : s)
        });
      } else if (type === 'alphabet') {
        updateAccount({
          alphabets: account.alphabets.map(s => s.id === item.id ? ({...s, folder: folderId}) : s)
        });
      } else if (type === 'folder') {
        updateAccount({
          folders: moveFolder(account.folders, item, folderId)
        });
      }
    }

    const dropInto = (thisRow, targetRow) => {
      if (targetRow.type === 'folder') {
        // Move to folder

        const folderId = targetRow.item.id
        if (thisRow.item.folder !== folderId) {
          setFolder(thisRow.type, thisRow.item, targetRow.item.id);
        }
      } else if (targetRow.parents.length) {
        // Find nearest folder and move to it
        let index = allLines.indexOf(targetRow);

        while (index >= 0) {
          if (allLines[index].type === 'folder') {
            dropInto(thisRow, allLines[index]);
            break
          }
          index--;
        }
      }
    }

    const onMouseUp = (e) => {
      let initialPos = initialPosRef.current;

      setGrabbing(false);
      initialPosRef.current = null;
      root.parentElement.parentElement.classList.remove('grabbing-row');

      if (initialPos) {
        const moveY = e.clientY - initialPos.y;
        const slotDiff = (moveY / initialPos.height) | 0;
        const newIndex = Math.max(0, Math.min(initialPos.numSlots - 1, initialPos.slot + slotDiff));

        if (newIndex !== initialPos.slot) {
          const thisRow = allLines[initialPos.slot];
          const targetRow = allLines[newIndex];

          dropInto(thisRow, targetRow);
        }
      }
    };

    const onMouseMove = (e) => {
      let phantom = phantomRef.current;
      let initialPos = initialPosRef.current;
      if (!initialPos || !phantom) {
        return;
      }

      const moveY = e.clientY - initialPos.y;
      const slotDiff = (moveY / initialPos.height) | 0;
      const newIndex = Math.max(0, Math.min(initialPos.numSlots - 1, initialPos.slot + slotDiff));
      const yOffset = (newIndex - initialPos.slot) * initialPos.height;
      phantom.style.top = (initialPos.top + yOffset) + 'px';
    }

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    }
  }, [account, updateAccount, allLines, rootRef, initialPosRef, setGrabbing]);

  const initGrab = (e) => {
    let root = rootRef.current;
    let phantom = phantomRef.current;
    if (!phantom || !root) {
      return;
    }

    setGrabbing(true);

    phantom.style.width = root.parentElement.offsetWidth + 'px';
    phantom.style.height = root.parentElement.offsetHeight + 'px';
    phantom.style.top = root.offsetTop + 'px';
    phantom.style.left = root.offsetLeft + 'px';

    root.parentElement.parentElement.classList.add('grabbing-row');

    const numSlots = root.parentElement.parentElement.children.length;
    const slot = [...root.parentElement.parentElement.children].indexOf(root.parentElement);


    initialPosRef.current = {
      numSlots: numSlots,
      slot: slot,
      x: e.clientX,
      y: e.clientY,
      top: root.offsetTop,
      left: root.offsetLeft,
      width: root.parentElement.offsetWidth,
      height: root.parentElement.offsetHeight,
    }
  }

  return <div
    ref={rootRef}
    className={grabbing ? "grab-component grabbing" : "grab-component"}
    onMouseDown={initGrab}
  >
    <IconArrowsMove size={16}/>

    <div
      className={grabbing ? "grab-component-phantom" : "grab-component-phantom hidden"}
      ref={phantomRef}
    />
  </div>
}
