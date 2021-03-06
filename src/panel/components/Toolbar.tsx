import React, { ComponentProps, FC } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { rem } from "polished";

type ToolbarItem = {
  title: string;
  icon: IconProp;
  onClick: () => void;
  id?: string;
  active?: boolean;
  disabled?: boolean;
};

export const Toolbar: FC<
  { items: ToolbarItem[] } & ComponentProps<typeof Container>
> = ({ items, children, ...props }) => (
  <Container {...props}>
    {items.map((item, index) => (
      <Item
        key={index}
        title={item.title}
        onClick={item.onClick}
        active={item.active}
        id={item.id}
        disabled={item.disabled}
      >
        <FontAwesomeIcon icon={item.icon} />
      </Item>
    ))}

    {children}
  </Container>
);

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: solid 1px ${(p) => p.theme.colors.divider.base};
`;

const Item = styled.button<{ active?: boolean }>`
  font-size: ${(p) => p.theme.fontSizes.body.l};
  line-height: ${(p) => p.theme.lineHeights.body.l};
  width: ${rem(32)};
  height: ${rem(32)};
  flex-shrink: 0;
  color: ${(p) =>
    p.active ? p.theme.colors.primary.base : p.theme.colors.textDimmed.base};

  &:hover {
    color: ${(p) =>
      p.active
        ? p.theme.colors.primary.hover
        : p.theme.colors.textDimmed.hover};
  }

  &:active {
    color: ${(p) =>
      p.active
        ? p.theme.colors.primary.active
        : p.theme.colors.textDimmed.active};
  }

  &::[disabled] {
    opacity: 0.5;
  }
`;
