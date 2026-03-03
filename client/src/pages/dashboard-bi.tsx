import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import styled, { keyframes } from "styled-components";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import NeuralBackground from "../components/NeuralBackground";
import FloatingParticles from "../components/FloatingParticles";
import {
  BarChart3, Users, TrendingUp, TrendingDown, Star, Eye,
  LogOut, RefreshCw, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───
interface QualidadeRecord {
  id: number;
  nota_atendimento: number;
  resultado_atendimento: string;
  atendimento: string;
  melhoria_atendimento: string;
}

// ─── Animations ───
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const borderGlow = keyframes`
  0%, 100% { border-color: rgba(139, 92, 246, 0.2); }
  50% { border-color: rgba(139, 92, 246, 0.45); }
`;

// ─── Styled Components ───
const PageWrapper = styled.div`
  min-height: 100vh;
  background: #0a0a1a;
  position: relative;
  overflow-x: hidden;
`;

const Content = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  @media (min-width: 768px) { padding: 2rem 2rem 4rem; }
`;

// Header
const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b46c1, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  span { color: rgba(139, 92, 246, 0.9); }
  @media (min-width: 768px) { font-size: 1.5rem; }
`;

const HeaderMeta = styled.div`
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.8rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconBtn = styled.button`
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 0.5rem;
  color: rgba(148, 163, 184, 0.8);
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  &:hover {
    border-color: rgba(139, 92, 246, 0.4);
    color: #fff;
  }
`;

// KPI Cards
const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const KPICard = styled.div<{ $delay?: number }>`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  animation: ${slideUp} 0.5s ease-out ${(p) => (p.$delay || 0) * 0.1}s both;
  transition: border-color 0.3s;
  &:hover {
    border-color: rgba(139, 92, 246, 0.4);
  }
`;

const KPILabel = styled.div`
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const KPIValue = styled.div`
  color: #fff;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
`;

const KPISub = styled.div`
  color: rgba(148, 163, 184, 0.5);
  font-size: 0.75rem;
  margin-top: 0.35rem;
`;

// Charts Section
const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 2rem;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
`;

const ChartCard = styled.div<{ $delay?: number }>`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 1rem;
  padding: 1.5rem;
  animation: ${slideUp} 0.5s ease-out ${(p) => (p.$delay || 0) * 0.1}s both;
`;

const ChartTitle = styled.h2`
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Progress Section
const ProgressCard = styled.div`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  animation: ${slideUp} 0.5s ease-out 0.4s both;
`;

const FaixaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  &:last-child { margin-bottom: 0; }
`;

const FaixaLabel = styled.div`
  min-width: 180px;
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 640px) { min-width: 140px; font-size: 0.75rem; }
`;

const FaixaStars = styled.span<{ $color: string }>`
  color: ${(p) => p.$color};
  font-size: 0.75rem;
`;

const FaixaPercent = styled.div`
  min-width: 48px;
  text-align: right;
  color: rgba(148, 163, 184, 0.8);
  font-size: 0.8rem;
  font-weight: 600;
`;

const FaixaCount = styled.div`
  min-width: 24px;
  text-align: right;
  color: rgba(148, 163, 184, 0.5);
  font-size: 0.75rem;
`;

const ProgressBarTrack = styled.div`
  flex: 1;
  height: 10px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${(p) => p.$pct}%;
  background: ${(p) => p.$color};
  border-radius: 999px;
  transition: width 0.6s ease-out;
`;

// Table Section
const TableCard = styled.div`
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 92, 246, 0.15);
  border-radius: 1rem;
  padding: 1.5rem;
  animation: ${slideUp} 0.5s ease-out 0.5s both;
  animation: ${borderGlow} 4s ease-in-out infinite;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  color: rgba(148, 163, 184, 0.7);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
`;

const Td = styled.td`
  color: rgba(226, 232, 240, 0.9);
  font-size: 0.85rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(30, 41, 59, 0.5);
  vertical-align: middle;
`;

const TrClickable = styled.tr`
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: rgba(139, 92, 246, 0.06); }
`;

const NotaBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #fff;
  background: ${(p) => p.$color};
`;

const ViewBtn = styled.button`
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 0.5rem;
  color: rgba(139, 92, 246, 0.9);
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s;
  &:hover {
    background: rgba(139, 92, 246, 0.25);
    color: #fff;
  }
`;

// Dialog Overlay
const Overlay = styled.div<{ $open: boolean }>`
  display: ${(p) => (p.$open ? "flex" : "none")};
  position: fixed;
  inset: 0;
  z-index: 100;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  padding: 1rem;
`;

const DialogBox = styled.div`
  background: #0f172a;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1rem;
  width: 100%;
  max-width: 700px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.3s ease-out;
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.15);
`;

const DialogTitle = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: rgba(148, 163, 184, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  &:hover { color: #fff; }
`;

const DialogBody = styled.div`
  flex: 1;
  overflow: hidden;
  padding: 1.25rem 1.5rem;
`;

const TextBlock = styled.div`
  color: rgba(226, 232, 240, 0.85);
  font-size: 0.85rem;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Footer = styled.footer`
  text-align: center;
  color: rgba(148, 163, 184, 0.4);
  font-size: 0.75rem;
  margin-top: 2rem;
  padding-bottom: 1rem;
`;

// Skeleton loading
const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

// ─── Helpers ───
const NOTA_COLORS: Record<string, string> = {
  "1": "#ef4444",
  "2": "#f97316",
  "3": "#eab308",
  "4": "#22c55e",
  "5": "#8b5cf6",
};

function getNotaColor(nota: number): string {
  if (nota >= 4.5) return NOTA_COLORS["5"];
  if (nota >= 3.5) return NOTA_COLORS["4"];
  if (nota >= 2.5) return NOTA_COLORS["3"];
  if (nota >= 1.5) return NOTA_COLORS["2"];
  return NOTA_COLORS["1"];
}

function getNotaLabel(nota: number): string {
  if (nota >= 4.5) return "Excelente";
  if (nota >= 3.5) return "Bom";
  if (nota >= 2.5) return "Regular";
  if (nota >= 1.5) return "Ruim";
  return "Muito Ruim";
}

const FAIXAS = [
  { label: "Excelente", range: "4.5 – 5.0", min: 4.5, max: 5.01, stars: 5, color: NOTA_COLORS["5"] },
  { label: "Bom", range: "3.5 – 4.4", min: 3.5, max: 4.5, stars: 4, color: NOTA_COLORS["4"] },
  { label: "Regular", range: "2.5 – 3.4", min: 2.5, max: 3.5, stars: 3, color: NOTA_COLORS["3"] },
  { label: "Ruim", range: "1.5 – 2.4", min: 1.5, max: 2.5, stars: 2, color: NOTA_COLORS["2"] },
  { label: "Muito Ruim", range: "1.0 – 1.4", min: 1.0, max: 1.5, stars: 1, color: NOTA_COLORS["1"] },
];

function truncate(text: string, max: number): string {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// Custom Recharts tooltip
const CustomTooltipWrapper = styled.div`
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 0.5rem;
  padding: 0.6rem 0.85rem;
  color: #fff;
  font-size: 0.8rem;
`;

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <CustomTooltipWrapper>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>Nota {label}</div>
      <div>{payload[0].value} atendimento(s)</div>
    </CustomTooltipWrapper>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <CustomTooltipWrapper>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{payload[0].name}</div>
      <div>{payload[0].value} ({(payload[0].percent * 100).toFixed(1)}%)</div>
    </CustomTooltipWrapper>
  );
}

// ─── Component ───
export default function DashboardBIPage() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<QualidadeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<QualidadeRecord | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const token = localStorage.getItem("dashboard_token");

  useEffect(() => {
    if (!token) {
      navigate("/dashboard/login");
      return;
    }
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/qualidade", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("dashboard_token");
        navigate("/dashboard/login");
        return;
      }
      if (!res.ok) throw new Error("Erro ao carregar dados");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("dashboard_token");
    navigate("/dashboard/login");
  }

  // ─── Computed Stats ───
  const stats = useMemo(() => {
    if (!data.length) return { total: 0, media: 0, max: 0, min: 0 };
    const notas = data.map((d) => Number(d.nota_atendimento));
    const total = notas.length;
    const media = notas.reduce((a, b) => a + b, 0) / total;
    const max = Math.max(...notas);
    const min = Math.min(...notas);
    return { total, media, max, min };
  }, [data]);

  // Bar chart data: count per nota (rounded to nearest 0.5)
  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      const nota = Number(d.nota_atendimento);
      const key = nota.toFixed(1);
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([nota, count]) => ({ nota, count }))
      .sort((a, b) => parseFloat(a.nota) - parseFloat(b.nota));
  }, [data]);

  // Pie chart data: by faixa
  const pieData = useMemo(() => {
    return FAIXAS.map((f) => {
      const count = data.filter((d) => {
        const n = Number(d.nota_atendimento);
        return n >= f.min && n < f.max;
      }).length;
      return { name: f.label, value: count, color: f.color };
    }).filter((d) => d.value > 0);
  }, [data]);

  // Progress bars
  const faixaStats = useMemo(() => {
    const total = data.length || 1;
    return FAIXAS.map((f) => {
      const count = data.filter((d) => {
        const n = Number(d.nota_atendimento);
        return n >= f.min && n < f.max;
      }).length;
      return { ...f, count, pct: Math.round((count / total) * 100) };
    });
  }, [data]);

  // Sorted table
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) =>
      sortAsc
        ? Number(a.nota_atendimento) - Number(b.nota_atendimento)
        : Number(b.nota_atendimento) - Number(a.nota_atendimento)
    );
  }, [data, sortAsc]);

  if (!token) return null;

  return (
    <PageWrapper>
      <NeuralBackground />
      <FloatingParticles />

      <Content>
        {/* Header */}
        <Header>
          <HeaderLeft>
            <LogoCircle>
              <BarChart3 size={22} color="#fff" />
            </LogoCircle>
            <div>
              <HeaderTitle>
                Notas Atendimento IA <span>Dotcom</span>
              </HeaderTitle>
              <HeaderMeta>
                Total: {stats.total} registros
                {!loading && ` · Atualizado agora`}
              </HeaderMeta>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <IconBtn onClick={fetchData} title="Atualizar dados">
              <RefreshCw size={16} />
            </IconBtn>
            <IconBtn onClick={handleLogout} title="Sair">
              <LogOut size={16} />
            </IconBtn>
          </HeaderRight>
        </Header>

        {/* Loading State */}
        {loading && (
          <>
            <LoadingGrid>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-xl" style={{ background: "rgba(30,41,59,0.5)" }} />
              ))}
            </LoadingGrid>
            <Skeleton className="h-72 rounded-xl mb-5" style={{ background: "rgba(30,41,59,0.5)" }} />
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "0.75rem",
            padding: "1rem",
            color: "#fca5a5",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && data.length > 0 && (
          <>
            {/* KPIs */}
            <KPIGrid>
              <KPICard $delay={0}>
                <KPILabel><Users size={14} /> Total Atendimentos</KPILabel>
                <KPIValue>{stats.total}</KPIValue>
                <KPISub>registros analisados</KPISub>
              </KPICard>
              <KPICard $delay={1}>
                <KPILabel><BarChart3 size={14} /> Nota Média</KPILabel>
                <KPIValue>{stats.media.toFixed(2)}</KPIValue>
                <KPISub>escala 1.0 – 5.0</KPISub>
              </KPICard>
              <KPICard $delay={2}>
                <KPILabel><TrendingUp size={14} /> Nota Máxima</KPILabel>
                <KPIValue style={{ color: "#22c55e" }}>{stats.max.toFixed(1)}</KPIValue>
                <KPISub>melhor avaliação</KPISub>
              </KPICard>
              <KPICard $delay={3}>
                <KPILabel><TrendingDown size={14} /> Nota Mínima</KPILabel>
                <KPIValue style={{ color: "#ef4444" }}>{stats.min.toFixed(1)}</KPIValue>
                <KPISub>pior avaliação</KPISub>
              </KPICard>
            </KPIGrid>

            {/* Charts */}
            <ChartsRow>
              <ChartCard $delay={3}>
                <ChartTitle><BarChart3 size={16} /> Distribuição por Nota</ChartTitle>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="nota" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(139,92,246,0.08)" }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {barData.map((entry) => (
                        <Cell key={entry.nota} fill={getNotaColor(parseFloat(entry.nota))} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard $delay={4}>
                <ChartTitle><Star size={16} /> Proporção por Faixa</ChartTitle>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </ChartsRow>

            {/* Progress Bars */}
            <ProgressCard>
              <ChartTitle><TrendingUp size={16} /> Detalhamento por Faixa de Nota</ChartTitle>
              {faixaStats.map((f) => (
                <FaixaRow key={f.label}>
                  <FaixaLabel>
                    <FaixaStars $color={f.color}>
                      {"★".repeat(f.stars)}{"☆".repeat(5 - f.stars)}
                    </FaixaStars>
                    {f.label}
                    <span style={{ color: "rgba(148,163,184,0.4)", fontSize: "0.7rem" }}>
                      ({f.range})
                    </span>
                  </FaixaLabel>
                  <ProgressBarTrack>
                    <ProgressBarFill $pct={f.pct} $color={f.color} />
                  </ProgressBarTrack>
                  <FaixaPercent>{f.pct}%</FaixaPercent>
                  <FaixaCount>{f.count}</FaixaCount>
                </FaixaRow>
              ))}
            </ProgressCard>

            {/* Table */}
            <TableCard>
              <ChartTitle><Users size={16} /> Todos os Atendimentos</ChartTitle>
              <div style={{ overflowX: "auto" }}>
                <StyledTable>
                  <thead>
                    <tr>
                      <Th>ID</Th>
                      <Th
                        style={{ cursor: "pointer", userSelect: "none" }}
                        onClick={() => setSortAsc(!sortAsc)}
                      >
                        Nota {sortAsc ? <ChevronUp size={12} style={{ display: "inline" }} /> : <ChevronDown size={12} style={{ display: "inline" }} />}
                      </Th>
                      <Th>Classificação</Th>
                      <Th>Resultado</Th>
                      <Th style={{ textAlign: "center" }}>Ação</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((rec) => {
                      const nota = Number(rec.nota_atendimento);
                      return (
                        <TrClickable key={rec.id} onClick={() => setSelectedRecord(rec)}>
                          <Td style={{ fontWeight: 600, color: "rgba(148,163,184,0.6)" }}>#{rec.id}</Td>
                          <Td>
                            <NotaBadge $color={getNotaColor(nota)}>
                              <Star size={12} /> {nota.toFixed(1)}
                            </NotaBadge>
                          </Td>
                          <Td>
                            <Badge variant="outline" style={{
                              borderColor: getNotaColor(nota),
                              color: getNotaColor(nota),
                            }}>
                              {getNotaLabel(nota)}
                            </Badge>
                          </Td>
                          <Td style={{ maxWidth: 300 }}>
                            {truncate(rec.resultado_atendimento, 80)}
                          </Td>
                          <Td style={{ textAlign: "center" }}>
                            <ViewBtn onClick={(e) => { e.stopPropagation(); setSelectedRecord(rec); }}>
                              <Eye size={13} /> Ver
                            </ViewBtn>
                          </Td>
                        </TrClickable>
                      );
                    })}
                  </tbody>
                </StyledTable>
              </div>
            </TableCard>

            <Footer>
              Mayrink Digital Minds · Dashboard BI Qualidade · Dados atualizados em tempo real do Supabase
            </Footer>
          </>
        )}
      </Content>

      {/* Detail Dialog */}
      <Overlay $open={!!selectedRecord} onClick={() => setSelectedRecord(null)}>
        {selectedRecord && (
          <DialogBox onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                <NotaBadge $color={getNotaColor(Number(selectedRecord.nota_atendimento))}>
                  <Star size={12} /> {Number(selectedRecord.nota_atendimento).toFixed(1)}
                </NotaBadge>
                Atendimento #{selectedRecord.id}
              </DialogTitle>
              <CloseBtn onClick={() => setSelectedRecord(null)}>
                <X size={20} />
              </CloseBtn>
            </DialogHeader>
            <DialogBody>
              <Tabs defaultValue="resultado">
                <TabsList className="mb-4" style={{ background: "rgba(30,41,59,0.6)" }}>
                  <TabsTrigger value="resultado">Resultado</TabsTrigger>
                  <TabsTrigger value="melhoria">Melhoria</TabsTrigger>
                  <TabsTrigger value="transcricao">Transcrição</TabsTrigger>
                </TabsList>
                <TabsContent value="resultado">
                  <ScrollArea className="h-[350px] pr-3">
                    <TextBlock>{selectedRecord.resultado_atendimento || "Sem dados"}</TextBlock>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="melhoria">
                  <ScrollArea className="h-[350px] pr-3">
                    <TextBlock>{selectedRecord.melhoria_atendimento || "Sem dados"}</TextBlock>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="transcricao">
                  <ScrollArea className="h-[350px] pr-3">
                    <TextBlock>{selectedRecord.atendimento || "Sem dados"}</TextBlock>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </DialogBody>
          </DialogBox>
        )}
      </Overlay>
    </PageWrapper>
  );
}
