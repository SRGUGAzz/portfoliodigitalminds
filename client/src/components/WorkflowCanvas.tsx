import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  workflowNodes,
  workflowConnections,
  nodeTypeColors,
  nodeTypeLabels,
  type WorkflowNode,
} from '../data/workflow-data';

const NODE_W = 200;
const NODE_H = 52;

function normalizePositions(nodes: WorkflowNode[]) {
  const minX = Math.min(...nodes.map(n => n.position[0]));
  const minY = Math.min(...nodes.map(n => n.position[1]));
  const PADDING = 200;
  const SCALE = 0.55;

  return nodes.map(n => ({
    ...n,
    x: (n.position[0] - minX) * SCALE + PADDING,
    y: (n.position[1] - minY) * SCALE + PADDING,
  }));
}

type NormalizedNode = WorkflowNode & { x: number; y: number };

// SVG icons per node type
const nodeIcons: Record<string, string> = {
  webhook: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  switch: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  set: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  httpRequest: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z',
  merge: 'M8 6l4-4 4 4M8 18l4 4 4-4M12 2v20',
  supabase: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zM9 12h6M12 9v6',
  redis: 'M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5zM16 8L2 22M17.5 15H9',
  code: 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  if: 'M16 3h5v5M21 3L9 15M4 20l5-5M4 20h5v-5',
  wait: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
  noOp: 'M12 2a10 10 0 100 20 10 10 0 000-20zM8 12h8',
  splitOut: 'M16 3h5v5M8 3H3v5M16 21h5v-5M8 21H3v-5',
  sort: 'M3 6h7M3 12h5M3 18h3M16 6l4 4-4 4',
  aggregate: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  summarize: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  limit: 'M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3',
  splitInBatches: 'M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3zM2 20h20',
  convertToFile: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M12 18v-6M9 15l3-3 3 3',
};

export default function WorkflowCanvas() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<NormalizedNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedNodes = useMemo(() => normalizePositions(workflowNodes), []);

  const nodeMap = useMemo(() => {
    const map = new Map<string, NormalizedNode>();
    normalizedNodes.forEach(n => map.set(n.name, n));
    return map;
  }, [normalizedNodes]);

  const canvasWidth = useMemo(() => Math.max(...normalizedNodes.map(n => n.x)) + NODE_W + 200, [normalizedNodes]);
  const canvasHeight = useMemo(() => Math.max(...normalizedNodes.map(n => n.y)) + NODE_H + 200, [normalizedNodes]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.1), 4));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const touchRef = useRef<{ dist: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current = { dist: Math.sqrt(dx * dx + dy * dy) };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setPan({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
    } else if (e.touches.length === 2 && touchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      setZoom(z => Math.min(Math.max(z * (newDist / touchRef.current!.dist), 0.1), 4));
      touchRef.current.dist = newDist;
    }
  }, [isPanning, panStart]);

  const handleTouchEnd = useCallback(() => { setIsPanning(false); touchRef.current = null; }, []);

  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / canvasWidth;
    const scaleY = rect.height / canvasHeight;
    const fitZoom = Math.min(scaleX, scaleY) * 0.85;
    setZoom(fitZoom);
    setPan({
      x: (rect.width - canvasWidth * fitZoom) / 2,
      y: (rect.height - canvasHeight * fitZoom) / 2,
    });
  }, [canvasWidth, canvasHeight]);

  useEffect(() => { fitToView(); }, [fitToView]);

  const getColor = (type: string) => nodeTypeColors[type] || '#8b5cf6';

  return (
    <Wrapper>
      <CanvasArea
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Transform style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          {/* Connection lines */}
          <svg width={canvasWidth} height={canvasHeight} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <polygon points="0 0, 6 2.5, 0 5" fill="#b0b0b8" />
              </marker>
            </defs>
            {workflowConnections.map((conn, i) => {
              const from = nodeMap.get(conn.from);
              const to = nodeMap.get(conn.to);
              if (!from || !to) return null;

              const x1 = from.x + NODE_W;
              const y1 = from.y + NODE_H / 2;
              const x2 = to.x;
              const y2 = to.y + NODE_H / 2;

              // n8n style: smooth bezier with horizontal tangents
              const midX = (x1 + x2) / 2;
              const cpOffset = Math.min(Math.abs(x2 - x1) * 0.6, 80);

              return (
                <path
                  key={i}
                  d={`M${x1},${y1} C${x1 + cpOffset},${y1} ${x2 - cpOffset},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke="#d0d0d8"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {normalizedNodes.map(node => {
            const color = getColor(node.type);
            const isSelected = selectedNode?.id === node.id;
            return (
              <N8nNode
                key={node.id}
                $selected={isSelected}
                style={{ left: node.x, top: node.y, width: NODE_W }}
                onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
              >
                <NodeIconArea $color={color}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={nodeIcons[node.type] || nodeIcons.set} />
                  </svg>
                </NodeIconArea>
                <NodeInfo>
                  <NodeName>{node.name}</NodeName>
                  <NodeTypeBadge>{nodeTypeLabels[node.type] || node.type}</NodeTypeBadge>
                </NodeInfo>
                {/* Connection dots */}
                <InputDot />
                <OutputDot />
              </N8nNode>
            );
          })}
        </Transform>

        {/* Zoom controls */}
        <ZoomControls>
          <ZoomBtn onClick={() => setZoom(z => Math.min(z * 1.25, 4))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </ZoomBtn>
          <ZoomBtn onClick={() => setZoom(z => Math.max(z * 0.8, 0.1))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </ZoomBtn>
          <ZoomBtn onClick={fitToView}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </ZoomBtn>
        </ZoomControls>

        <CounterBadge>{workflowNodes.length} nodes</CounterBadge>
      </CanvasArea>

      {/* Detail Panel */}
      {selectedNode && (
        <Panel>
          <PanelHeader>
            <PanelIcon $color={getColor(selectedNode.type)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={nodeIcons[selectedNode.type] || nodeIcons.set} />
              </svg>
            </PanelIcon>
            <PanelHeaderText>
              <PanelTitle>{selectedNode.name}</PanelTitle>
              <PanelType $color={getColor(selectedNode.type)}>
                {nodeTypeLabels[selectedNode.type] || selectedNode.type}
              </PanelType>
            </PanelHeaderText>
            <CloseBtn onClick={() => setSelectedNode(null)}>&times;</CloseBtn>
          </PanelHeader>

          <PanelBody>
            <PanelSection>
              <SectionTitle>Parametros</SectionTitle>
              {Object.entries(selectedNode.details).length > 0 ? (
                Object.entries(selectedNode.details).map(([key, value]) => {
                  if (value === undefined || value === null || value === '') return null;
                  return (
                    <ParamRow key={key}>
                      <ParamKey>{formatKey(key)}</ParamKey>
                      <ParamValue>{formatValue(value)}</ParamValue>
                    </ParamRow>
                  );
                })
              ) : (
                <EmptyState>Sem parametros configurados</EmptyState>
              )}
            </PanelSection>

            <PanelSection>
              <SectionTitle>Informacoes</SectionTitle>
              <ParamRow>
                <ParamKey>Tipo do Node</ParamKey>
                <ParamValue>{selectedNode.type}</ParamValue>
              </ParamRow>
              <ParamRow>
                <ParamKey>Posicao Original</ParamKey>
                <ParamValue>[{selectedNode.position[0]}, {selectedNode.position[1]}]</ParamValue>
              </ParamRow>
              <ParamRow>
                <ParamKey>Conexoes de Entrada</ParamKey>
                <ParamValue>
                  {workflowConnections.filter(c => c.to === selectedNode.name).length}
                </ParamValue>
              </ParamRow>
              <ParamRow>
                <ParamKey>Conexoes de Saida</ParamKey>
                <ParamValue>
                  {workflowConnections.filter(c => c.from === selectedNode.name).length}
                </ParamValue>
              </ParamRow>
            </PanelSection>
          </PanelBody>
        </Panel>
      )}
    </Wrapper>
  );
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/_/g, ' ');
}

function formatValue(value: unknown): React.ReactNode {
  if (Array.isArray(value)) {
    return <TagList>{value.map((v, i) => <Tag key={i}>{String(v)}</Tag>)}</TagList>;
  }
  if (typeof value === 'object' && value !== null) return JSON.stringify(value, null, 2);
  return String(value);
}

/* ── Styled Components ── */

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  background: #f5f5f5;
`;

const CanvasArea = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  cursor: grab;
  /* n8n dot grid pattern */
  background-color: #fafafa;
  background-image: radial-gradient(circle, #d4d4d4 1px, transparent 1px);
  background-size: 24px 24px;

  &:active { cursor: grabbing; }
`;

const Transform = styled.div`
  position: absolute;
  transform-origin: 0 0;
  will-change: transform;
`;

/* ── n8n-style Node ── */
const N8nNode = styled.div<{ $selected: boolean }>`
  position: absolute;
  height: ${NODE_H}px;
  border-radius: 8px;
  background: #ffffff;
  border: 2px solid ${({ $selected }) => $selected ? '#ff6d5a' : '#e5e5e5'};
  box-shadow: ${({ $selected }) => $selected
    ? '0 2px 12px rgba(255,109,90,0.25)'
    : '0 1px 4px rgba(0,0,0,0.08)'};
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  z-index: 1;
  transition: border-color 0.12s, box-shadow 0.12s;

  &:hover {
    border-color: #ff6d5a;
    box-shadow: 0 2px 12px rgba(255,109,90,0.2);
    z-index: 2;
  }
`;

const NodeIconArea = styled.div<{ $color: string }>`
  width: 36px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const NodeInfo = styled.div`
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const NodeName = styled.span`
  color: #262626;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

const NodeTypeBadge = styled.span`
  color: #8c8c8c;
  font-size: 8px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const InputDot = styled.div`
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d0d0d8;
  border: 2px solid #fafafa;
`;

const OutputDot = styled.div`
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d0d0d8;
  border: 2px solid #fafafa;
`;

/* ── Zoom Controls (n8n style) ── */
const ZoomControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  border: 1px solid #e5e5e5;
  overflow: hidden;
  z-index: 10;
`;

const ZoomBtn = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #525252;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;

  &:hover { background: #f5f5f5; }
  & + & { border-left: 1px solid #e5e5e5; }
`;

const CounterBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 14px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  color: #525252;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
`;

/* ── Detail Panel ── */
const Panel = styled.div`
  width: 320px;
  background: #ffffff;
  border-left: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 50%;
    border-left: none;
    border-top: 1px solid #e5e5e5;
    border-radius: 12px 12px 0 0;
    z-index: 20;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const PanelIcon = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PanelHeaderText = styled.div`
  flex: 1;
  min-width: 0;
`;

const PanelTitle = styled.h3`
  color: #171717;
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PanelType = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 600;
`;

const CloseBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
  background: transparent;
  color: #8c8c8c;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover { background: #f5f5f5; color: #171717; }
`;

const PanelBody = styled.div`
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PanelSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionTitle = styled.div`
  color: #8c8c8c;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
`;

const ParamRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ParamKey = styled.span`
  color: #525252;
  font-size: 11px;
  font-weight: 600;
`;

const ParamValue = styled.div`
  color: #171717;
  font-size: 12px;
  word-break: break-word;
  font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
  line-height: 1.5;
  background: #f9f9f9;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ebebeb;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span`
  padding: 3px 8px;
  border-radius: 4px;
  background: #fff4f2;
  border: 1px solid #ffd4cc;
  color: #cc4c35;
  font-size: 11px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  color: #a3a3a3;
  font-size: 12px;
  font-style: italic;
  text-align: center;
  padding: 12px 0;
`;
