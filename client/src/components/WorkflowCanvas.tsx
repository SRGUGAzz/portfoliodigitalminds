import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  workflowNodes,
  workflowConnections,
  nodeTypeColors,
  nodeTypeLabels,
  type WorkflowNode,
} from '../data/workflow-data';

const NODE_W = 180;
const NODE_H = 44;

// Normalize positions to canvas coordinates
function normalizePositions(nodes: WorkflowNode[]) {
  const minX = Math.min(...nodes.map(n => n.position[0]));
  const minY = Math.min(...nodes.map(n => n.position[1]));
  const PADDING = 100;
  const SCALE = 0.14;

  return nodes.map(n => ({
    ...n,
    x: (n.position[0] - minX) * SCALE + PADDING,
    y: (n.position[1] - minY) * SCALE + PADDING,
  }));
}

type NormalizedNode = WorkflowNode & { x: number; y: number };

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

  // Canvas dimensions
  const canvasWidth = useMemo(() => Math.max(...normalizedNodes.map(n => n.x)) + NODE_W + 200, [normalizedNodes]);
  const canvasHeight = useMemo(() => Math.max(...normalizedNodes.map(n => n.y)) + NODE_H + 200, [normalizedNodes]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.15), 3));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0 && (e.target as HTMLElement).closest('[data-canvas]')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Touch support
  const touchRef = useRef<{ x: number; y: number; dist: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist: Math.sqrt(dx * dx + dy * dy),
      };
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setPan({ x: e.touches[0].clientX - panStart.x, y: e.touches[0].clientY - panStart.y });
    } else if (e.touches.length === 2 && touchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      const scale = newDist / touchRef.current.dist;
      setZoom(z => Math.min(Math.max(z * scale, 0.15), 3));
      touchRef.current.dist = newDist;
    }
  }, [isPanning, panStart]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    touchRef.current = null;
  }, []);

  // Fit to view on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / canvasWidth;
      const scaleY = rect.height / canvasHeight;
      const fitZoom = Math.min(scaleX, scaleY) * 0.9;
      setZoom(fitZoom);
      setPan({
        x: (rect.width - canvasWidth * fitZoom) / 2,
        y: (rect.height - canvasHeight * fitZoom) / 2,
      });
    }
  }, [canvasWidth, canvasHeight]);

  const getColor = (type: string) => nodeTypeColors[type] || '#8b5cf6';

  return (
    <Wrapper>
      <CanvasContainer
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        data-canvas
      >
        <CanvasTransform style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <svg
            width={canvasWidth}
            height={canvasHeight}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="rgba(139,92,246,0.4)" />
              </marker>
            </defs>
            {workflowConnections.map((conn, i) => {
              const fromNode = nodeMap.get(conn.from);
              const toNode = nodeMap.get(conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.x + NODE_W;
              const y1 = fromNode.y + NODE_H / 2;
              const x2 = toNode.x;
              const y2 = toNode.y + NODE_H / 2;
              const dx = Math.abs(x2 - x1) * 0.5;

              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="rgba(139,92,246,0.25)"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
          </svg>

          {normalizedNodes.map(node => (
            <NodeBox
              key={node.id}
              $color={getColor(node.type)}
              $selected={selectedNode?.id === node.id}
              style={{ left: node.x, top: node.y, width: NODE_W }}
              onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
            >
              <NodeDot $color={getColor(node.type)} />
              <NodeLabel>{node.name}</NodeLabel>
              <NodeType>{nodeTypeLabels[node.type] || node.type}</NodeType>
            </NodeBox>
          ))}
        </CanvasTransform>

        <Controls>
          <ControlBtn onClick={() => setZoom(z => Math.min(z * 1.2, 3))}>+</ControlBtn>
          <ControlBtn onClick={() => setZoom(z => Math.max(z * 0.8, 0.15))}>-</ControlBtn>
          <ControlBtn onClick={() => {
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              const scaleX = rect.width / canvasWidth;
              const scaleY = rect.height / canvasHeight;
              const fitZoom = Math.min(scaleX, scaleY) * 0.9;
              setZoom(fitZoom);
              setPan({
                x: (rect.width - canvasWidth * fitZoom) / 2,
                y: (rect.height - canvasHeight * fitZoom) / 2,
              });
            }
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </ControlBtn>
        </Controls>

        <NodeCounter>{workflowNodes.length} nodes</NodeCounter>
      </CanvasContainer>

      {selectedNode && (
        <DetailPanel>
          <DetailHeader>
            <DetailDot $color={getColor(selectedNode.type)} />
            <div>
              <DetailTitle>{selectedNode.name}</DetailTitle>
              <DetailType $color={getColor(selectedNode.type)}>
                {nodeTypeLabels[selectedNode.type] || selectedNode.type}
              </DetailType>
            </div>
            <CloseBtn onClick={() => setSelectedNode(null)}>&times;</CloseBtn>
          </DetailHeader>
          <DetailBody>
            {Object.entries(selectedNode.details).map(([key, value]) => {
              if (value === undefined || value === null || value === '') return null;
              return (
                <DetailRow key={key}>
                  <DetailKey>{formatKey(key)}</DetailKey>
                  <DetailValue>{formatValue(value)}</DetailValue>
                </DetailRow>
              );
            })}
            {Object.keys(selectedNode.details).length === 0 && (
              <EmptyDetail>Nenhum parametro configurado</EmptyDetail>
            )}
            <DetailRow>
              <DetailKey>Posicao</DetailKey>
              <DetailValue>x: {selectedNode.position[0]}, y: {selectedNode.position[1]}</DetailValue>
            </DetailRow>
          </DetailBody>
        </DetailPanel>
      )}
    </Wrapper>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/_/g, ' ');
}

function formatValue(value: unknown): React.ReactNode {
  if (Array.isArray(value)) {
    return (
      <TagList>
        {value.map((v, i) => (
          <Tag key={i}>{String(v)}</Tag>
        ))}
      </TagList>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// Styled Components
const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
`;

const CanvasContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  cursor: grab;
  background:
    radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 70%),
    linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 20px 20px, 20px 20px;

  &:active {
    cursor: grabbing;
  }
`;

const CanvasTransform = styled.div`
  position: absolute;
  transform-origin: 0 0;
  will-change: transform;
`;

const NodeBox = styled.div<{ $color: string; $selected: boolean }>`
  position: absolute;
  height: ${NODE_H}px;
  border-radius: 8px;
  background: ${({ $selected }) => $selected ? 'rgba(30, 27, 75, 0.95)' : 'rgba(15, 23, 42, 0.9)'};
  border: 1.5px solid ${({ $color, $selected }) => $selected ? $color : `${$color}50`};
  box-shadow: ${({ $selected, $color }) => $selected ? `0 0 16px ${$color}40` : `0 2px 8px rgba(0,0,0,0.3)`};
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  overflow: hidden;
  z-index: 1;

  &:hover {
    border-color: ${({ $color }) => $color};
    box-shadow: 0 0 12px ${({ $color }) => $color}30;
    z-index: 2;
  }
`;

const NodeDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const NodeLabel = styled.span`
  color: #e2e8f0;
  font-size: 9px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  line-height: 1.2;
`;

const NodeType = styled.span`
  color: #64748b;
  font-size: 7px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
`;

const ControlBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(15, 23, 42, 0.9);
  color: #a78bfa;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover {
    background: rgba(139, 92, 246, 0.2);
  }
`;

const NodeCounter = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #a78bfa;
  font-size: 11px;
  font-weight: 500;
  z-index: 10;
`;

const DetailPanel = styled.div`
  width: 300px;
  background: rgba(15, 23, 42, 0.98);
  border-left: 1px solid rgba(139, 92, 246, 0.3);
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
    border-top: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px 16px 0 0;
    z-index: 20;
  }
`;

const DetailHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.15);
`;

const DetailDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const DetailTitle = styled.h3`
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
`;

const DetailType = styled.span<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 11px;
  font-weight: 500;
`;

const CloseBtn = styled.button`
  margin-left: auto;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    background: rgba(139, 92, 246, 0.3);
  }
`;

const DetailBody = styled.div`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const DetailKey = styled.span`
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  color: #cbd5e1;
  font-size: 12px;
  word-break: break-word;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  line-height: 1.4;
  background: rgba(139, 92, 246, 0.05);
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid rgba(139, 92, 246, 0.1);
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.25);
  color: #c4b5fd;
  font-size: 11px;
`;

const EmptyDetail = styled.div`
  color: #475569;
  font-size: 12px;
  font-style: italic;
  text-align: center;
  padding: 16px 0;
`;
