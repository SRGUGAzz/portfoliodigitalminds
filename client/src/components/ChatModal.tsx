import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useWebhookUrl, useSessionId } from '../hooks/use-env-config';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentIcon: string;
}

const zoomInBounce = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  background: rgba(22, 27, 58, 0.95);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(to right, #1e3a8a, #1a2151);
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
`;

const AgentAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(to bottom right, #6b46c1, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 1rem;
  font-size: 1.25rem;
`;

const AgentInfo = styled.div`
  flex: 1;
`;

const AgentName = styled.h3`
  margin: 0;
  color: white;
  font-size: 1.125rem;
`;

const AgentStatus = styled.p`
  margin: 0;
  color: #a5b4fc;
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  padding: 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  position: relative;
  z-index: 10;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ChatArea = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 300px;
  max-height: 50vh;
  background-image: 
    linear-gradient(rgba(22, 27, 58, 0.95), rgba(22, 27, 58, 0.95)),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50 L70 30 L50 10 L30 30 Z' fill='%236b46c1' fill-opacity='0.05'/%3E%3C/svg%3E");
`;

const bubbleZoomInBounce = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const MessageWrapper = styled.div<{ $isUser: boolean }>`
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
`;

const BubbleContainer = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  padding: 0.75rem 1.25rem; /* Aumentado o padding horizontal para 1.25rem (20px) */
  border-radius: 1rem;
  background: ${props => props.$isUser 
    ? 'linear-gradient(to right, #6b46c1, #2563eb)' 
    : 'rgba(45, 55, 72, 0.7)'};
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 0.5rem solid transparent;
    ${props => props.$isUser 
      ? 'border-left-color: #2563eb; right: -0.75rem; top: 50%; transform: translateY(-50%);'
      : 'border-right-color: rgba(45, 55, 72, 0.7); left: -0.75rem; top: 50%; transform: translateY(-50%);'
    }
  }
`;

const MessageTime = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-left: 0.5rem;
  align-self: flex-end;
`;

const InputArea = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.7);
  gap: 0.75rem;
  border-top: 1px solid rgba(139, 92, 246, 0.2);
`;

const ChatInput = styled.input`
  flex: 1;
  background: rgba(45, 55, 72, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1.5rem;
  padding: 0.75rem 1.25rem;
  color: white;
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: rgba(139, 92, 246, 0.6);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SendButton = styled.button`
  background: linear-gradient(to right, #6b46c1, #2563eb);
  border: none;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

// Componente de bolha de mensagem individual com sua própria animação
interface MessageBubbleProps {
  isUser: boolean;
  text: string;
  time: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ isUser, text, time }) => {
  return (
    <BubbleContainer $isUser={isUser}>
      {text}
      <MessageTime>{time}</MessageTime>
    </BubbleContainer>
  );
};

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
  createdAt: number; // timestamp para criar uma key única para cada mensagem
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, agentName, agentIcon }) => {
  const webhookUrl = useWebhookUrl();
  const sessionId = useSessionId();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Olá! Eu sou o assistente virtual para ${agentName}. Como posso ajudar você hoje?`,
      isUser: false,
      time: '09:30',
      createdAt: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(2);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Fecha o modal quando o usuário clica fora dele ou no botão fechar
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      console.log("Fechando modal via clique outside");
      e.stopPropagation();
      onClose();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      console.log("Fechando modal via ESC");
      onClose();
    }
  };
  
  const handleCloseButtonClick = (e: React.MouseEvent) => {
    console.log("Fechando modal via botão X");
    e.stopPropagation();
    onClose();
  };
  
  // Função para converter nomes para um formato URL amigável
  const slugifyAgentName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove múltiplos hífens
      .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Adiciona mensagem do usuário
    const newUserMessage: Message = {
      id: messageIdCounter.current++,
      text: inputValue,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Prepara o formato do payload para o webhook
    const webhookPayload = {
      agent: slugifyAgentName(agentName),
      message: inputValue,
      typeMessage: "text",
      sessionId: sessionId
    };
    
    console.log('Modal individual: Enviando mensagem com sessionId:', sessionId);
    
    // Envia requisição HTTP POST para o webhook
    setIsLoading(true);
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })
    .then(response => response.json())
    .then(responseData => {
      const text = responseData?.message || responseData?.output || responseData?.[0]?.message;
      const newAgentMessage: Message = {
        id: messageIdCounter.current++,
        text: text || 'Desculpe, não consegui processar sua mensagem.',
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };
      setMessages(prev => [...prev, newAgentMessage]);
    })
    .catch(error => {
      console.error('Erro ao enviar para o webhook:', error);
      const errorMessage: Message = {
        id: messageIdCounter.current++,
        text: 'Desculpe, estamos com dificuldades técnicas. Por favor, tente novamente mais tarde.',
        isUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    })
    .finally(() => {
      setIsLoading(false);
    });
    
    setInputValue('');
  };
  
  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick} onKeyDown={handleKeyDown} className="fade-in">
      <ModalContainer className="zoom-in-bounce">
        <ModalHeader>
          <AgentAvatar>
            <i className={agentIcon}></i>
          </AgentAvatar>
          <AgentInfo>
            <AgentName>{agentName}</AgentName>
            <AgentStatus>Online agora</AgentStatus>
          </AgentInfo>
          <CloseButton onClick={handleCloseButtonClick}>×</CloseButton>
        </ModalHeader>
        
        <ChatArea>
          {messages.map(message => (
            <MessageWrapper 
              key={`${message.id}-${message.createdAt}`}
              $isUser={message.isUser}
              className="zoom-in-bounce"
            >
              <BubbleContainer $isUser={message.isUser}>
                {message.text}
                <MessageTime>{message.time}</MessageTime>
              </BubbleContainer>
            </MessageWrapper>
          ))}
          {isLoading && (
            <MessageWrapper $isUser={false}>
              <BubbleContainer $isUser={false}>
                Digitando...
                <MessageTime>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</MessageTime>
              </BubbleContainer>
            </MessageWrapper>
          )}
          <div ref={messagesEndRef} />
        </ChatArea>
        
        <InputArea>
          <ChatInput
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <SendButton onClick={handleSendMessage} disabled={isLoading} style={{ opacity: isLoading ? 0.5 : 1 }}>
            <i className="fas fa-paper-plane"></i>
          </SendButton>
        </InputArea>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ChatModal;