import React from 'react';
import styled, { keyframes } from 'styled-components';

const N8N_WORKFLOW_URL = "https://n8n.mayrinkads.com/workflow/v4c1pkB15SpsSOXR";

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const flowLine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

const Section = styled.section`
  position: relative;
  z-index: 10;
  padding: 4rem 1rem;
  background: linear-gradient(to bottom, #0f172a, #111838);

  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 4rem 4rem;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h2`
  font-size: 1.875rem;
  color: white;
  margin-bottom: 1rem;
  font-family: 'Audiowide', cursive;

  @media (min-width: 768px) {
    font-size: 2.25rem;
  }
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1rem;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
`;

const Card = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 27, 75, 0.8));
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.1);
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const FlowDiagram = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Node = styled.div<{ $color: string; $delay: number }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  background: ${({ $color }) => $color}20;
  border: 1px solid ${({ $color }) => $color}60;
  color: ${({ $color }) => $color};
  font-size: 0.8rem;
  font-weight: 500;
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const Arrow = styled.div`
  color: rgba(139, 92, 246, 0.4);
  font-size: 1.2rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

const FlowBar = styled.div`
  width: 100%;
  max-width: 600px;
  height: 4px;
  border-radius: 2px;
  background: rgba(139, 92, 246, 0.15);
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
    animation: ${flowLine} 2.5s ease-in-out infinite;
  }
`;

const InfoText = styled.p`
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
  max-width: 500px;
`;

const OpenButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6b46c1, #2563eb);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(107, 70, 193, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(107, 70, 193, 0.5);
  }
`;

const WorkflowSection: React.FC = () => {
  return (
    <Section id="workflow">
      <Container>
        <Header>
          <Title>Workflow de Automacao</Title>
          <Subtitle>
            Veja em tempo real como nossos agentes de IA operam por meio de fluxos
            inteligentes no n8n, orquestrando tarefas de forma autonoma.
          </Subtitle>
        </Header>
        <Card>
          <FlowDiagram>
            <Node $color="#22c55e" $delay={0}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Webhook
            </Node>
            <Arrow>&rarr;</Arrow>
            <Node $color="#8b5cf6" $delay={0.4}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Processa IA
            </Node>
            <Arrow>&rarr;</Arrow>
            <Node $color="#3b82f6" $delay={0.8}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Gemini
            </Node>
            <Arrow>&rarr;</Arrow>
            <Node $color="#f59e0b" $delay={1.2}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Resposta
            </Node>
          </FlowDiagram>
          <FlowBar />
          <InfoText>
            Nosso workflow orquestra agentes de IA com Gemini, Supabase e 25+ nodes
            para processar conversas em tempo real.
          </InfoText>
          <OpenButton
            href={N8N_WORKFLOW_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Abrir Workflow no n8n
          </OpenButton>
        </Card>
      </Container>
    </Section>
  );
};

export default WorkflowSection;
