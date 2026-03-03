import { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { isAdmin, isAuthenticated } from "./auth";
import { insertAgentPromptSchema, insertAgentSchema } from "@shared/schema";
import crypto from "crypto";

// Dashboard auth - separado do Passport
const DASHBOARD_SECRET = "dotcom-bi-2024";
const DASHBOARD_USER = "admin";
const DASHBOARD_PASS = "INK3777";

function generateDashboardToken(): string {
  const payload = `dashboard-${Date.now()}-${crypto.randomBytes(16).toString("hex")}`;
  const hash = crypto.createHmac("sha256", DASHBOARD_SECRET).update(payload).digest("hex");
  return `dashboard-${hash}`;
}

// Tokens válidos em memória (suficiente para uso single-instance)
const validDashboardTokens = new Set<string>();

function isDashboardAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer dashboard-")) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  const token = authHeader.replace("Bearer ", "");
  if (!validDashboardTokens.has(token)) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
  next();
}

export function setupApiRoutes(app: Express) {
  // ===== Dashboard BI endpoints =====
  app.post("/api/dashboard/login", (req, res) => {
    const { username, password } = req.body;
    if (username === DASHBOARD_USER && password === DASHBOARD_PASS) {
      const token = generateDashboardToken();
      validDashboardTokens.add(token);
      return res.json({ token });
    }
    return res.status(401).json({ error: "Credenciais inválidas" });
  });

  app.get("/api/dashboard/qualidade", isDashboardAuth, async (req, res) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Supabase não configurado" });
      }
      const response = await fetch(
        `${supabaseUrl}/rest/v1/dados_qualidade_dotcom?select=*&order=id.asc`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      if (!response.ok) {
        const text = await response.text();
        return res.status(response.status).json({ error: "Erro ao buscar dados", details: text });
      }
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: "Erro interno ao buscar dados de qualidade" });
    }
  });

  // ===== Agent API endpoints =====
  // API routes para agentes
  app.get("/api/agents", async (req, res, next) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      res.json(agent);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents", isAdmin, async (req, res, next) => {
    try {
      const validationResult = insertAgentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const newAgent = await storage.createAgent(validationResult.data);
      res.status(201).json(newAgent);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/agents/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const validationResult = insertAgentSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const updatedAgent = await storage.updateAgent(id, validationResult.data);
      if (!updatedAgent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      res.json(updatedAgent);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/agents/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      // Verifica se existe
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      await storage.deleteAgent(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // API routes para prompts de agentes
  app.get("/api/agents/:agentId/prompts", async (req, res, next) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "ID de agente inválido" });
      }

      // Verifica se o agente existe
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      const prompts = await storage.getAgentPrompts(agentId);
      res.json(prompts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:agentId/active-prompt", async (req, res, next) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "ID de agente inválido" });
      }

      // Verifica se o agente existe
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      const prompt = await storage.getActiveAgentPrompt(agentId);
      if (!prompt) {
        return res.status(404).json({ error: "Nenhum prompt ativo encontrado para este agente" });
      }

      res.json(prompt);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:agentId/prompts", isAdmin, async (req, res, next) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "ID de agente inválido" });
      }

      // Verifica se o agente existe
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      // Inclui o agentId no corpo da requisição
      const data = { ...req.body, agentId };
      const validationResult = insertAgentPromptSchema.safeParse(data);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const newPrompt = await storage.createAgentPrompt(validationResult.data);
      res.status(201).json(newPrompt);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/agent-prompts/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const validationResult = insertAgentPromptSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const updatedPrompt = await storage.updateAgentPrompt(id, validationResult.data);
      if (!updatedPrompt) {
        return res.status(404).json({ error: "Prompt não encontrado" });
      }

      res.json(updatedPrompt);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/agent-prompts/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await storage.deleteAgentPrompt(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
}