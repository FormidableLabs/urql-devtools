import React, { FC } from "react";
import { GraphQLNamedType } from "graphql";
import styled from "styled-components";
import { faHome, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Toolbar } from "../../../components";

interface TopBarProps {
  setStack: (stack: GraphQLNamedType[] | []) => void;
  stack: GraphQLNamedType[] | [];
}

export const TopBar: FC<TopBarProps> = ({ setStack, stack, children }) => {
  const prevType = stack[stack.length - 2];

  return (
    <FlexContainer>
      <Toolbar
        items={[
          {
            title: "Root",
            icon: faHome,
            disabled: stack.length < 2,
            onClick: () => setStack([]),
          },
          {
            title: prevType?.name || "Root",
            icon: faArrowLeft,
            disabled: stack.length === 0,
            onClick: () => setStack([...stack].slice(0, -1)),
          },
        ]}
      >
        {children}
      </Toolbar>

      <Breadcrumbs>
        <TextButton
          data-disabled={stack.length === 0}
          onClick={() => setStack([])}
        >
          Root
        </TextButton>
        {stack.length > 0
          ? (stack as GraphQLNamedType[]).map((item, i) => (
              <TextButton
                onClick={() => setStack([...stack].slice(0, i + 1))}
                data-disabled={i === stack.length - 1}
                key={i}
              >
                {item.name}
              </TextButton>
            ))
          : null}
      </Breadcrumbs>
    </FlexContainer>
  );
};

const FlexContainer = styled.div`
  background-color: ${(p) => p.theme.colors.canvas.elevated05};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
`;

const TextButton = styled.button`
  display: inline-block;
  background: transparent;
  outline: none;
  border: none;
  cursor: pointer;
  font-size: ${(p) => p.theme.fontSizes.body.s};
  line-height: ${(p) => p.theme.lineHeights.body.s};
  text-align: left;
  padding: 0;
  margin: 0;
  color: ${(p) => p.theme.colors.primary.base};

  &:hover {
    text-decoration: underline;
  }

  &[data-disabled="true"] {
    color: ${(p) => p.theme.colors.textDimmed.base};
    pointer-events: none;
  }

  &[data-disabled="false"] {
    &::after {
      content: ">";
      display: inline-block;
      margin: 0 ${(p) => p.theme.space[2]};
      color: ${(p) => p.theme.colors.textDimmed.base};
    }
  }
`;

const Breadcrumbs = styled.nav`
  display: flex;
  align-items: center;
  padding: ${(p) => `${p.theme.space[3]} ${p.theme.space[2]}`};
  margin: 0 ${(p) => p.theme.space[2]};
  color: ${(p) => p.theme.colors.textDimmed.base};
`;
