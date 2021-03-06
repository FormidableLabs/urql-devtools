import React, {
  FC,
  useMemo,
  useState,
  useCallback,
  useEffect,
  ComponentProps,
} from "react";
import styled from "styled-components";
import { Operation } from "@urql/core";
import { rem } from "polished";
import { useTimelineContext, START_PADDING } from "../../context";
import { Background } from "../../components/Background";
import {
  TimelineRow,
  TimelinePane,
  Tick,
  TimelineSourceIcon,
  Settings,
} from "./components";

export const Timeline: FC<ComponentProps<typeof Page>> = (props) => {
  const {
    setContainer,
    scale,
    events,
    eventOrder,
    startTime,
    container,
    selectedEvent,
    setSelectedEvent,
    setPosition,
    filter,
  } = useTimelineContext();
  const [selectedSource, setSelectedSource] = useState<Operation | undefined>();

  // Unmount source pane on event select
  useEffect(() => {
    if (selectedEvent) {
      setSelectedSource(undefined);
    }
  }, [selectedEvent]);

  // Unmount event pane on source select
  useEffect(() => {
    if (selectedSource) {
      setSelectedEvent(undefined);
    }
  }, [selectedSource]);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Back to beginning
      if (e.key === "Home") {
        setPosition(startTime - START_PADDING);
      }

      // Skip to current time
      if (e.key === "End") {
        setPosition(Date.now());
      }
    };

    addEventListener("keydown", handleKeyDown, { passive: true });
    return () => removeEventListener("keydown", handleKeyDown);
  }, [setPosition, startTime]);

  const ticks = useMemo(
    () =>
      scale
        ? scale.ticks(getTickCount(container.clientWidth)).map((t) => {
            const delta = t - startTime;

            // Round up numbers (200ms, 300ms, etc)
            const time = Math.round(delta / 1000) * 1000;

            return {
              label: `${time}ms`,
              position: scale(time + startTime),
            };
          })
        : [],
    [scale]
  );

  const handleSourceClick = useCallback(
    (o: Operation) => () => {
      setSelectedSource((current) =>
        current && current.key === o.key ? undefined : o
      );

      const latest = [...events[o.key]]
        .reverse()
        .find((e) => e.type === "execution");
      latest && setPosition(latest.timestamp - START_PADDING);
    },
    [events, setPosition, setSelectedSource]
  );

  const sources = useMemo<Operation[]>(
    () =>
      eventOrder.map((key) => {
        const source = events[key].find((e) => e.operation.kind !== "teardown");

        // Only events for given source is teardown
        // Unknown source type
        // TODO: infer type from operation.query
        if (source === undefined) {
          return events[key][0].operation;
        }

        return source.operation;
      }),
    [events, eventOrder]
  );

  const paneProps = useMemo(() => {
    if (selectedSource) {
      return {
        source: selectedSource,
      };
    }

    if (selectedEvent) {
      return {
        event: selectedEvent,
      };
    }
    return {};
  }, [selectedSource, selectedEvent]);

  const content = useMemo(
    () =>
      // We lie about the types to save having to do this check
      // in every child component. This guard is needed.
      !container ? null : (
        <>
          {ticks.map((t, i) => (
            <Tick key={`p-${i}`} label={t.label} style={{ left: t.position }} />
          ))}
          {eventOrder.map((key, i) => (
            <TimelineRow
              key={key}
              events={events[key]}
              style={{
                display: filter.graphqlType.includes(sources[i].kind)
                  ? undefined
                  : "none",
              }}
            />
          ))}
        </>
      ),
    [container, events, eventOrder, ticks, sources]
  );

  return (
    <Page {...props}>
      <Settings />
      <PageContent>
        <TimelineContainer>
          <TimelineIcons>
            {sources.map((s) => (
              <TimelineSourceIcon
                key={s.key}
                title="Source operation"
                kind={s.kind === "teardown" ? "query" : s.kind}
                onClick={handleSourceClick(s)}
                style={{
                  display: filter.graphqlType.includes(s.kind)
                    ? undefined
                    : "none",
                }}
              />
            ))}
          </TimelineIcons>
          <TimelineList ref={setContainer} draggable="true" key="TimelineList">
            {content}
          </TimelineList>
        </TimelineContainer>
        <TimelinePane {...paneProps} />
      </PageContent>
    </Page>
  );
};

const Page = styled(Background)`
  background-color: ${(p) => p.theme.colors.canvas.base};
  @media (min-aspect-ratio: 1/1) {
    flex-direction: column;
  }
`;

const PageContent = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  @media (min-aspect-ratio: 1/1) {
    flex-direction: row;
  }
`;

const TimelineContainer = styled.div`
  display: flex;
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: hidden;
`;

const TimelineIcons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${rem(40)};

  /* Margin prevents ticks from being hidden. */
  margin-top: ${(p) => p.theme.space[10]};
  height: max-content;
  background: ${(p) => p.theme.colors.canvas.base};
  z-index: 1;

  > * {
    margin-top: ${(p) => p.theme.space[5]};
  }

  > *:after {
    content: "";
    width: ${rem(200)};
    height: ${rem(200)};
  }
`;

const TimelineList = styled.div`
  cursor: grab;
  display: block;
  position: relative;
  padding: ${(p) => p.theme.space[10]} 0;
  overflow-y: visible;
  width: 100%;
  box-sizing: border-box;
  min-height: 100%;
  height: max-content;

  &:active {
    cursor: grabbing;
  }
`;

const getTickCount = (width: number) => {
  if (width < 600) {
    return 2;
  }

  if (width < 1300) {
    return 5;
  }

  return 10;
};
