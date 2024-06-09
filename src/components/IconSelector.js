import '../style/icon-selector.scss';
import {ActionIcon, Button, ColorPicker, Flex, Pagination, Popover, Stack, Tabs, TextInput} from "@mantine/core";
import {t} from "../util/i18n";
import {IconColorPicker, IconIcons, IconPhoto, IconSearch} from "@tabler/icons-react";
import {useIconList} from "../util/icons";
import {useEffect, useState} from "react";
import {useDebouncedValue} from "@mantine/hooks";

export function IconDisplay({value, size, alt}) {
  value = value || '';
  const index = value.indexOf("://");
  const icons = useIconList();
  const defaultValue = <img src="/logo512.png" alt={alt} style={{width: 'auto', height: '100%', maxWidth: size, maxHeight: size}}/>;

  if (index === -1 || value === '') {
    return defaultValue;
  }

  const prefix = value.substring(0, index);

  if (prefix === 'icon') {
    const id = value.substring(index + 3);
    const icon = icons.find(icon => icon.id === id);

    return icon
      ? <div className="icon-display-icon" style={{width: '100%', height: '100%', maxWidth: size, maxHeight: size}}>{icon.render({size})}</div>
      : defaultValue;
  }

  if (prefix === 'rgb') {
    const color = value.substring(index + 3);

    return <div
      className="icon-display-color"
      style={{width: size, height: size, backgroundColor: color}}
      title={alt}
    />;
  }

  return <img src={value} alt={alt} style={{width: 'auto', height: '100%', maxWidth: size, maxHeight: size}}/>;
}

export function IconSelector({value, onChange}) {
  const [tab, setTab] = useState('icon');

  return <div className="icon-selector">
    <Popover
      width={300}
      position="bottom"
      withArrow
      shadow="xl"
      withinPortal
      zIndex={6000}
      middlewares={{flip: false, shift: true}}
    >
      <Popover.Target>
        <Button
          variant="subtle"
          size="sm"
          pl={0}
          leftIcon={<IconDisplay value={value} size={24} alt={t('Icon')}/>}
        >
          {t('Set Icon')}
        </Button>
      </Popover.Target>

      <Popover.Dropdown>
        <Tabs className="icon-selector-tabs"
              value={tab}
              onTabChange={setTab}
          // onChange={setTab} // In the new version the prop is called onChange
        >
          <Tabs.List>
            <Tabs.Tab value="icon" icon={<IconIcons size={16}/>}>
              {t('Icon')}
            </Tabs.Tab>

            <Tabs.Tab value="image" icon={<IconPhoto size={16}/>}>
              {t('Image')}
            </Tabs.Tab>

            <Tabs.Tab value="color" icon={<IconColorPicker size={16}/>}>
              {t('Color')}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="icon" pt="sm">
            {tab === 'icon' ? <IconSelectorIcon value={value} onChange={onChange}/> : ''}
          </Tabs.Panel>

          <Tabs.Panel value="image" pt="sm">
            {tab === 'image' ? <IconSelectorImage value={value} onChange={onChange}/> : ''}
          </Tabs.Panel>

          <Tabs.Panel value="color" pt="sm">
            {tab === 'color' ? <IconSelectorColor value={value} onChange={onChange}/> : ''}
          </Tabs.Panel>
        </Tabs>
      </Popover.Dropdown>
    </Popover>
  </div>;
}

function IconSelectorIcon({value, onChange}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const allIcons = useIconList();

  const filteredIcons = search !== ''
    ? allIcons.filter(icon => icon.id.toLowerCase().includes(search.toLowerCase()))
    : allIcons;

  const numPages = Math.ceil(filteredIcons.length / 64);
  const realPage = Math.max(0, Math.min(page - 1, numPages - 1));
  const visibleIcons = filteredIcons.slice(realPage * 64, (realPage + 1) * 64);

  return <Stack justify="center" align="center" w="100%">
    <TextInput
      icon={<IconSearch size={16}/>}
      placeholder={t('Search by name')}
      value={search}
      onChange={e => {
        setSearch(e.target.value);
        setPage(1);
      }}
    />

    <Flex
      className="icon-select-icon-list"
      justify="start"
      align="start"
      wrap="wrap"
      gap={4}
    >
      {visibleIcons.map(icon => {
          const url = 'icon://' + icon.id;

          return <ActionIcon
            variant={value === url ? 'filled' : 'subtle'}
            color={value === url ? 'blue' : undefined}
            className="icon-select-item"
            key={icon.id}
            onClick={() => onChange(url)}
            title={icon.id}
          >
            {icon.render({size: 24})}
          </ActionIcon>;
        }
      )}
    </Flex>

    <Pagination
      className={'icon-select-pagination'}
      total={numPages}
      value={page}
      onChange={setPage}
      siblings={1}
      boundaries={0}
    />
  </Stack>;
}

function IconSelectorColor({value, onChange}) {
  const [modified, setModified] = useState(false);
  const [color, setColor] = useState(() => {
    if (value && value.startsWith('rgb://')) {
      return value.substring(6);
    }
    return '#ffffff';
  });
  const [debouncedColor] = useDebouncedValue(color, 100);
  const validColor = /#[0-9a-fA-F]+/.test(color);

  useEffect(() => {
    if (!/#[0-9a-fA-F]+/.test(debouncedColor)) {
      return;
    }
    const url = 'rgb://' + debouncedColor;

    if (modified && value !== url) {
      onChange(url);
    }
  }, [modified, value, onChange, debouncedColor]);

  return <div className="icon-select-color">
    <ColorPicker
      value={color}
      onChange={v => {
        setColor(v);
        setModified(true);
      }}
      format="hex"
      swatches={['#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
      swatchesPerRow={7}
      fullWidth
    />

    <TextInput
      label={t('Color')}
      value={color}
      error={!validColor ? t('Invalid color') : undefined}
      onChange={e => {
        setColor(e.target.value);
        setModified(true);
      }}
    />
  </div>;
}

function IconSelectorImage({value, onChange}) {
  return <div className="icon-select-image">
    <TextInput
      label={t('Image URL')}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>;
}
