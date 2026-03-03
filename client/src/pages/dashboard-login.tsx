import React, { useState } from "react";
import { useLocation } from "wouter";
import styled, { keyframes } from "styled-components";
import NeuralBackground from "../components/NeuralBackground";
import FloatingParticles from "../components/FloatingParticles";
import { Lock, User, Eye, EyeOff, BarChart3 } from "lucide-react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
  50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const GradientOrb = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
  &.top-right {
    top: -100px;
    right: -100px;
    background: radial-gradient(circle, #6b46c1, transparent);
  }
  &.bottom-left {
    bottom: -100px;
    left: -100px;
    background: radial-gradient(circle, #2563eb, transparent);
  }
`;

const LoginCard = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  margin: 1rem;
  padding: 2.5rem;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 1.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const LogoArea = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const IconCircle = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b46c1, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${glowPulse} 3s ease-in-out infinite;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  color: rgba(148, 163, 184, 0.8);
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  color: rgba(148, 163, 184, 0.9);
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 0.75rem;
  color: #fff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  &:focus {
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  &::placeholder {
    color: rgba(100, 116, 139, 0.6);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.85rem;
  color: rgba(139, 92, 246, 0.6);
  display: flex;
  align-items: center;
`;

const TogglePassword = styled.button`
  position: absolute;
  right: 0.85rem;
  background: none;
  border: none;
  color: rgba(148, 163, 184, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  &:hover {
    color: rgba(148, 163, 184, 0.8);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, #6b46c1, #2563eb);
  border: none;
  border-radius: 0.75rem;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: #fca5a5;
  font-size: 0.85rem;
  text-align: center;
`;

export default function DashboardLoginPage() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Credenciais inválidas");
        return;
      }

      const { token } = await res.json();
      localStorage.setItem("dashboard_token", token);
      navigate("/dashboard");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <NeuralBackground />
      <FloatingParticles />
      <GradientOrb className="top-right" />
      <GradientOrb className="bottom-left" />

      <LoginCard>
        <LogoArea>
          <IconCircle>
            <BarChart3 size={28} color="#fff" />
          </IconCircle>
          <Title>Dashboard BI</Title>
          <Subtitle>Qualidade de Atendimento — Dotcom Internet</Subtitle>
        </LogoArea>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <InputGroup>
            <InputLabel>Usuário</InputLabel>
            <InputWrapper>
              <InputIcon><User size={16} /></InputIcon>
              <StyledInput
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <InputLabel>Senha</InputLabel>
            <InputWrapper>
              <InputIcon><Lock size={16} /></InputIcon>
              <StyledInput
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <TogglePassword type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </TogglePassword>
            </InputWrapper>
          </InputGroup>

          <SubmitButton type="submit" disabled={loading || !username || !password}>
            {loading ? "Entrando..." : "Acessar Dashboard"}
          </SubmitButton>
        </Form>
      </LoginCard>
    </PageWrapper>
  );
}
