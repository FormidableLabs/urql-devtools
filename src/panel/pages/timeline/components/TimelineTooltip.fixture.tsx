import React from "react";
import styled from "styled-components";
import { TimelineTooltip, useTooltip } from "./TimelineTooltip";

const Wrapper = styled.div`
  display: flex;
  padding: 10px;
  background: ${props => props.theme.dark["0"]};
  flex-grow: 1;
`;

const HoverableItem = () => {
  const { ref, tooltipProps, isVisible } = useTooltip();

  console.log({ ref, tooltipProps, isVisible });

  return (
    <>
      <button
        style={{
          position: "absolute",
          left: 200,
          top: 200,
          width: 100,
          height: 30
        }}
        ref={ref}
      >
        Hover me!
      </button>
      {isVisible && <TimelineTooltip {...tooltipProps}>Hello!</TimelineTooltip>}
    </>
  );
};

export default {
  basic: (
    <Wrapper>
      <TimelineTooltip>A network response or cache update</TimelineTooltip>
    </Wrapper>
  ),
  onHover: (
    <Wrapper>
      <HoverableItem />
    </Wrapper>
  )
};
