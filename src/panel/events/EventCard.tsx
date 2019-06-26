import React, { FC, useContext, useCallback } from "react";
import styled, { ThemeContext } from "styled-components";
import { UrqlEvent } from "../../types";
import { EventsContext } from "../context";

/** Shows basic information about an operation. */
export const EventCard: FC<{ operation: UrqlEvent; active: boolean }> = ({
  operation,
  active = false
}) => {
  const theme = useContext(ThemeContext);
  const { selectedEvent, selectEvent, clearSelectedEvent } = useContext(
    EventsContext
  );

  const handleContainerClick = useCallback(() => {
    selectedEvent === operation ? clearSelectedEvent() : selectEvent(operation);
  }, [operation, selectedEvent, selectEvent]);

  const colors = {
    subscription: theme.orange[0],
    teardown: theme.grey[0],
    mutation: theme.purple[0],
    query: theme.blue[0],
    response: theme.green[0],
    error: theme.red[0]
  };

  const name =
    operation.type === "operation"
      ? operation.data.operationName
      : operation.type;
  const date = formatDate(operation.timestamp);
  const info =
    operation.type === "operation"
      ? operation.data.context.devtools.source
      : operation.data.operation.context.devtools.source;
  const key =
    operation.type === "operation"
      ? operation.data.key
      : operation.data.operation.key;

  return (
    <Container onClick={handleContainerClick} aria-selected={active}>
      <Indicator style={{ backgroundColor: colors[name] }} />
      <OperationName>{capitalize(name)}</OperationName>
      <OperationTime>{date}</OperationTime>
      <OperationAddInfo>{info || "Unknown"}</OperationAddInfo>
      <OperationKey>{key}</OperationKey>
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

const capitalize = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

// Breakpoints
const smMax = "399px";
const mdMin = "400px";

const OperationName = styled.h3`
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  margin: 0;
  width: 50%;

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
`;

const Indicator = styled.div`
  position: absolute;
  left: 0;
  width: 5px;
  top: 0;
  bottom: 0;
`;

const Container = styled.div`
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
