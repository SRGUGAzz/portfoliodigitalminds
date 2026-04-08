import React from 'react';
import styled from 'styled-components';
import { Link } from 'wouter';

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
  max-width: 1200px;
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

const PreviewCard = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.1);
  aspect-ratio: 16 / 8;
  max-height: 500px;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none;
`;

const Overlay = styled(Link)`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.4);
  opacity: 0;
  transition: opacity 0.3s;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`;

const ViewButton = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6b46c1, #2563eb);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(107, 70, 193, 0.4);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
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
        <PreviewCard>
          <StyledIframe
            src="https://n8n.mayrinkads.com/workflow/v4c1pkB15SpsSOXR"
            title="Workflow n8n - Portfolio Digital Minds"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <Overlay href="/workflow">
            <ViewButton>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
              Explorar Workflow Completo
            </ViewButton>
          </Overlay>
        </PreviewCard>
      </Container>
    </Section>
  );
};

export default WorkflowSection;
