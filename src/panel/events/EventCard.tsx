import React, { FC, useContext, useCallback, MouseEventHandler } from "react";
import styled, { ThemeContext, css } from "styled-components";
import { animated, useSpring } from "react-spring";
import { EventsContext } from "../context";
import { ParsedEvent } from "../types";
import { smMax, mdMin } from "./constants";

/** Shows basic information about an operation. */
export const EventCard: FC<{
  event: ParsedEvent;
  active: boolean;
  canFilter: boolean;
}> = ({ event, canFilter, active = false }) => {
  const theme = useContext(ThemeContext);
  const {
    selectedEvent,
    selectEvent,
    clearSelectedEvent,
    addFilter
  } = useContext(EventsContext);

  const slideInAnimation = useSpring({
    config: { duration: 200 },
    from: { transform: `translate(100%)` },
    to: { transform: `translate(0%)` }
  });

  const colors: { [key: string]: string } = {
    subscription: theme.orange[0],
    teardown: theme.grey[0],
    mutation: theme.purple[0],
    query: theme.blue[0],
    response: theme.green[0],
    error: theme.red[0]
  };

  const handleContainerClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    e => {
      if (e.ctrlKey || e.metaKey) {
        return;
      }

      selectedEvent === event ? clearSelectedEvent() : selectEvent(event);
    },
    [event, selectedEvent, clearSelectedEvent]
  );

  const handleFilterClick = useCallback(
    (
      property: Parameters<typeof addFilter>[0]
    ): MouseEventHandler<HTMLDivElement> => e => {
      if (!e.ctrlKey && !e.metaKey) {
        return;
      }

      addFilter(property, event[property]);
    },
    [event]
  );

  return (
    <Container
      style={slideInAnimation}
      onClick={handleContainerClick}
      aria-selected={active}
    >
      <Indicator style={{ backgroundColor: colors[event.type] }} />
      <OperationName onClick={handleFilterClick("type")} isActive={canFilter}>
        {event.type}
      </OperationName>
      <OperationTime>{formatDate(event.timestamp)}</OperationTime>
      <OperationAddInfo
        onClick={handleFilterClick("source")}
        isActive={canFilter}
      >
        {event.source}
      </OperationAddInfo>
      <OperationKey onClick={handleFilterClick("key")} isActive={canFilter}>
        {event.key}
      </OperationKey>
    </Container>
  );
};

const formatDate = (date: number) => {
  const d = new Date(date);
  const padded = (n: number) => String(n).padStart(2, "0");

  return `${padded(d.getHours())}:${padded(d.getMinutes())}:${padded(
    d.getSeconds()
  )}`;
};

const getActiveStyles = (p: { isActive: boolean }) => {
  return (
    p.isActive &&
    css`
      text-decoration: underline;
      cursor: pointer;
    `
  );
};

const OperationName = styled.h3`
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  margin: 0;
  width: 50%;
  text-transform: capitalize;

  @media (max-width: ${smMax}) {
    margin-bottom: 10px;
  }

  @media (min-width: ${mdMin}) {
    color: rgba(255, 255, 255, 0.8);
    order: 1;
    font-size: 13px;
    width: auto;
    flex-basis: 4;
    width: 20%;
  }

  &:hover {
    ${getActiveStyles}
  }
`;

const OperationTime = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
  width: 50%;
  text-align: right;

  @media (min-width: ${mdMin}) {
    order: 4;
    font-size: 13px;
    width: 20%;
  }
`;

const OperationAddInfo = styled.p`
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  width: 50%;

  @media (min-width: ${mdMin}) {
    color: rgba(255, 255, 255, 0.8);
    order: 2;
    font-size: 13px;
    width: 25%;
  }

  &:hover {
    ${getActiveStyles}
  }
`;

const OperationKey = styled.p`
  margin: 0;

  @media (max-width: ${smMax}) {
    color: rgba(255, 255, 255, 0.7);
    width: 50%;
    text-align: right;
  }

  @media (min-width: ${mdMin}) {
    color: rgba(255, 255, 255, 0.8);
    order: 3;
    font-size: 13px;
    width: 25%;
  }

  &:hover {
    ${getActiveStyles}
  }
`;

const Indicator = styled.div`
  position: absolute;
  left: 0;
  width: 5px;
  top: 0;
  bottom: 0;
`;

const Container = styled(animated.div)`
  position: relative;
  background-color: ${props => props.theme.dark[0]};
  width: auto;
  height: auto;
  display: flex;
  flex-direction: row;
  padding: 10px 15px;

  &:nth-child(2n):not(:hover) {
    background-color: ${props => props.theme.dark["-1"]};
  }

  &:hover {
    cursor: pointer;
    background-color: ${props => props.theme.dark["-2"]};
  }

  &[aria-selected="true"]:not(:hover) {
    background-color: ${props => props.theme.dark["-3"]};
  }

  @media (max-width: ${smMax}) {
    flex-wrap: wrap;
    align-items: baseline;
  }

  @media (min-width: ${mdMin}) {
    align-items: center;
    justify-content: space-between;
  }
`;
