import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import WorkflowCanvas from '../components/WorkflowCanvas';
import { workflowName, nodeCount } from '../data/workflow-data';

const VALID_USER = 'admin';
const VALID_PASS = 'INK$!@#';

export default function WorkflowViewer() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === VALID_USER && password === VALID_PASS) {
      setAuthed(true);
      setError('');
    } else {
      setError('Credenciais invalidas');
    }
  };

  if (!authed) {
    return (
      <LoginPage>
        <LoginCard>
          <LoginIcon>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </LoginIcon>
          <LoginTitle>Acesso ao Workflow</LoginTitle>
          <LoginSubtitle>Autenticacao necessaria para visualizar o fluxo</LoginSubtitle>
          <LoginForm onSubmit={handleLogin}>
            <InputGroup>
              <InputLabel>Usuario</InputLabel>
              <Input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </InputGroup>
            <InputGroup>
              <InputLabel>Senha</InputLabel>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </InputGroup>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <SubmitBtn type="submit">Entrar</SubmitBtn>
          </LoginForm>
        </LoginCard>
      </LoginPage>
    );
  }

  return (
    <Container>
      <TopBar>
        <TopBarLeft>
          <BackLink href="/">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Portfolio
          </BackLink>
          <Separator />
          <WorkflowTitle>{workflowName}</WorkflowTitle>
        </TopBarLeft>
        <TopBarRight>
          <Badge>{nodeCount} nodes</Badge>
          <Badge $accent>Somente Leitura</Badge>
        </TopBarRight>
      </TopBar>
      <CanvasWrapper>
        <WorkflowCanvas />
      </CanvasWrapper>
    </Container>
  );
}

// Login styles
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const LoginPage = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  background-image: radial-gradient(circle at 30% 40%, rgba(107, 70, 193, 0.08) 0%, transparent 50%);
`;

const LoginCard = styled.div`
  width: 360px;
  max-width: 90vw;
  padding: 40px 32px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.3s ease;
`;

const LoginIcon = styled.div`margin-bottom: 16px;`;

const LoginTitle = styled.h1`
  color: #e2e8f0;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 6px;
  font-family: 'Audiowide', cursive;
`;

const LoginSubtitle = styled.p`
  color: #64748b;
  font-size: 13px;
  margin: 0 0 24px;
  text-align: center;
`;

const LoginForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(30, 27, 75, 0.4);
  color: #e2e8f0;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #8b5cf6;
  }
`;

const ErrorMsg = styled.div`
  color: #f87171;
  font-size: 13px;
  text-align: center;
`;

const SubmitBtn = styled.button`
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #6b46c1, #2563eb);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(107, 70, 193, 0.4);
  }
`;

// Main layout styles
const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: linear-gradient(135deg, #0f0c29, #302b63);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  flex-shrink: 0;
  gap: 12px;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const BackLink = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a78bfa;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;

  &:hover { color: #c4b5fd; }
`;

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background: rgba(139, 92, 246, 0.3);
`;

const WorkflowTitle = styled.h1`
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span<{ $accent?: boolean }>`
  padding: 3px 10px;
  border-radius: 9999px;
  background: ${({ $accent }) => $accent ? 'rgba(234, 179, 8, 0.15)' : 'rgba(139, 92, 246, 0.15)'};
  border: 1px solid ${({ $accent }) => $accent ? 'rgba(234, 179, 8, 0.3)' : 'rgba(139, 92, 246, 0.3)'};
  color: ${({ $accent }) => $accent ? '#eab308' : '#a78bfa'};
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
`;

const CanvasWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;
