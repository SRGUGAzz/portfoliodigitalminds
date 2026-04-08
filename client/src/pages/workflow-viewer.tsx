import styled from "styled-components";
import { Link } from "wouter";

const N8N_WORKFLOW_URL = "https://n8n.mayrinkads.com/workflow/v4c1pkB15SpsSOXR";

export default function WorkflowViewer() {
  return (
    <Container>
      <TopBar>
        <BackLink href="/">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Voltar ao Portfolio
        </BackLink>
        <Title>Workflow de Automacao - Digital Minds</Title>
        <Badge>Somente Leitura</Badge>
      </TopBar>
      <IframeWrapper>
        <StyledIframe
          src={N8N_WORKFLOW_URL}
          title="Workflow n8n - Portfolio Digital Minds"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </IframeWrapper>
    </Container>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #0f0c29, #302b63);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  flex-shrink: 0;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a78bfa;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #c4b5fd;
  }
`;

const Title = styled.h1`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
`;

const Badge = styled.span`
  padding: 4px 12px;
  border-radius: 9999px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #a78bfa;
  font-size: 12px;
  font-weight: 500;
`;

const IframeWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;
