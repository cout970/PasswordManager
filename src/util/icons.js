import * as icons from '@tabler/icons-react';

const AllIcons = Object.entries(icons)
  .filter(([key]) => key.startsWith('Icon'))
  .map(([key, IconComponent]) => {
    return (
      {
        id: key.substring(4),
        render: (props) => <IconComponent {...props}/>,
      }
    );
  });

export function useIconList() {
  return AllIcons;
}
