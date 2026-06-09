import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Clipboard,
  Check,
  FileCode,
  Layers,
  Shield,
  Send,
  Loader2,
  Cpu,
  Smartphone,
  Info,
  MessageSquare,
  Bot,
} from "lucide-react";
import { PromptOutput } from "../types";

interface PromptStudioProps {
  onAutoConfigureSimulatorWater: (amount: number) => void;
}

export default function PromptStudio({ onAutoConfigureSimulatorWater }: PromptStudioProps) {
  // Selector states
  const [platform, setPlatform] = useState("iOS e Android");
  const [framework, setFramework] = useState("Expo (TypeScript / SDK 51+)");
  const [watchApi, setWatchApi] = useState("Apple HealthKit (iOS) + Google Fit (Android)");
  const [notificationApi, setNotificationApi] = useState("Notifee + expo-notifications (Híbrido)");
  const [designFlavor, setDesignFlavor] = useState("Clean e Minimalista (Interface Clara com Negativa Ampla)");
  const [extraRequirements, setExtraRequirements] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  // active tab
  const [activeTab, setActiveTab] = useState<"prompt" | "architecture" | "permissions" | "code">("prompt");
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Chat Co-pilot state of health assistant
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string }>>([
    {
      id: "chat-1",
      role: "assistant",
      text: "Olá Victor! Sou o seu Co-piloto Especialista em Wearables e IoT para Saúde. Posso sanar as suas dúvidas sobre integração Bluetooth BLE, permissões do Apple HealthKit / Google Fit, ciclos com agendamentos Notifee, ou sugerir alterações no Prompt Perfeito. Como posso te apoiar?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatSubmitting, setChatSubmitting] = useState(false);

  const suggestions = [
    "Como ler batimentos cardíacos BLE de 10 em 10 seg?",
    "Me dê um exemplo de alarme Notifee offline para remédios",
    "Quais as permissões nativas para rodar em background?",
    "Que biblioteca de gráficos usar no React Native + Expo?"
  ];

  // Result output
  const [result, setResult] = useState<PromptOutput>({
    overview: "Configure os filtros ao lado e clique em 'Gerar Prompt com IA' para customizar sua arquitetura, prompt de cópia e arquivos React Native em tempo real!",
    perfectPrompt: `PROMPT INFORMAÇÕES PADRÃO (Aguardando geração com IA):
Por favor, escreva um aplicativo React Native para monitorar a saúde. O aplicativo deve:
1. Conectar-se com Smartwatches para batimentos cardíacos.
2. Permitir registros rápidos de água e comida.
3. Disparar lembretes periódicos e agendar medicamentos com notificações push locais.
4. Manter uma estética minimalista, limpa e responsiva.`,
    architecture: `
App.tsx (Ponto de entrada nativo)
├── src/
│   ├── components/ (ProgressBar, Heartwave, WaterIntakeCard)
│   ├── screens/ (DashboardScreen, MedicineListScreen, HeartPlotScreen)
│   ├── services/ (SmartwatchSensorService.ts, PushNotificationManager.ts)
│   └── hooks/ (useHealthRecords.ts)
`,
    nativeIntegrationTips: `
- Permissões de Saúde: Adicione NSHealthShareUsageDescription no Info.plist e declarativos do Google Fit API no AndroidManifest.
- Notificações Locais: Use Notifee / Expo Notifications para programar alarmes diários offline.
`,
    snippet: `// CÓDIGO INICIAL ESTIMADO
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WellnessDashboard() {
  const [bpm] = useState(72);
  const [water] = useState(250);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visualização de Batimentos: {bpm} BPM</Text>
      <Text style={styles.title}>Água hoje: {water} ml</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 16, color: '#333' }
});`
  });

  // Cycle simulation tips to interest user during loading
  const loadingMessages = [
    "Consultando o arquiteto inteligente Gemini...",
    "Estruturando pontes nativas para Apple HealthKit...",
    "Formatando permissões Android Google Fit APIs...",
    "Organizando rotinas de agendamento de remédios Notifee...",
    "Definindo layouts responsivos com Flexbox para React Native...",
    "Refinando o Prompt Perfeito de Copiar-e-Colar...",
  ];

  const handleGenerate = async () => {
    setLoading(true);
    let stepIndex = 0;
    setLoadingStep(loadingMessages[0]);

    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % loadingMessages.length;
      setLoadingStep(loadingMessages[stepIndex]);
    }, 1500);

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          platform,
          framework,
          watchApi,
          notificationApi,
          designFlavor,
          extraRequirements,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao comunicar com o servidor.");
      }

      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, tabId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(tabId);
    setTimeout(() => {
      setCopiedStatus(null);
    }, 1500);
  };

  const handleSendChatMessage = async (msgText: string) => {
    if (!msgText.trim() || chatSubmitting) return;

    const userMsg = {
      id: String(Date.now()),
      role: "user" as const,
      text: msgText,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatSubmitting(true);

    try {
      const history = chatMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: msgText,
          history,
          currentConfig: {
            platform,
            framework,
            watchApi,
            notificationApi,
            designFlavor,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na comunicação com o assistente.");
      }

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant" as const,
          text: data.reply,
        },
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: "assistant" as const,
          text: "Ops! Sinto muito, tive um pequeno problema ao processar sua dúvida técnica. Pode tentar novamente em alguns segundos?",
        },
      ]);
    } finally {
      setChatSubmitting(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur border border-slate-200/60 p-5 rounded-3xl shadow-sm transition-all dark:bg-slate-900/40 dark:border-slate-800">
      
      {/* Title section */}
      <div className="flex items-center gap-2 pb-3 mb-5 border-b border-rose-500/10 dark:border-rose-500/10">
        <div className="p-2 bg-rose-500/10 rounded-xl">
          <Sparkles className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Oficina de Prompt e Arquitetura</h2>
          <p className="text-xs text-slate-500">Desenhe, customize e gere planos de desenvolvimento nativos React Native</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left selector options (Option Form) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-rose-500" />
              <span>Configuração Mobile</span>
            </h3>

            {/* Platform Option */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Plataforma</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="Ambas (iOS e Android)">iOS e Android (Híbrido)</option>
                <option value="Apenas iOS">Apenas iOS (Apple Ecosystem)</option>
                <option value="Apenas Android">Apenas Android (Google Ecosystem)</option>
              </select>
            </div>

            {/* Framework Option */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estrutura base / Framework</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="Expo (TypeScript / SDK 51+)">Expo framework (Recomendado)</option>
                <option value="Expo + Expo Router v3">Expo Router (Roteamento baseado em arquivos)</option>
                <option value="React Native CLI Puro (Bare Workflow)">Bare React Native (Sem Expo)</option>
              </select>
            </div>

            {/* Smartwatch Watch integration API Option */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">API de Sincronia Wearable</label>
              <select
                value={watchApi}
                onChange={(e) => setWatchApi(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="Apple HealthKit (iOS) e Google Fit (Android)">HealthKit (iOS) + Google Fit (Android)</option>
                <option value="Conexão Direta Bluetooth BLE (react-native-ble-plx)">Bluetooth BLE Direto (Smartband Genérica)</option>
                <option value="Garmin Companion SDK + WearOS Native APIs">Garmin / WearOS SDK dedicado</option>
              </select>
            </div>

            {/* Push Notifications Setup Option */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Notificações Push / Alarme</label>
              <select
                value={notificationApi}
                onChange={(e) => setNotificationApi(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="Notifee + expo-notifications (Híbrido Local e Remoto)">Notifee + expo-notifications (Offline & Online)</option>
                <option value="Apenas Notifee Local (Para lembretes cíclicos sem internet)">Lembrete com Notifee Offline (Periódico)</option>
                <option value="Firebase Cloud Messaging (FCM) + Notificações Locais">Firebase FCM (Notificação via Servidor)</option>
              </select>
            </div>

            {/* Design Type visual design guidelines */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estética Visual do App</label>
              <select
                value={designFlavor}
                onChange={(e) => setDesignFlavor(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                <option value="Clean e Minimalista (Interface Clara com Negativa Ampla)">Clean e Minimalista (Modo Claro Premium)</option>
                <option value="Dark Mode Tecnológico / Brutalista">High-Contrast Dark (Estilo Cyberpunk Neon)</option>
                <option value="Material You (Adaptável às Cores do Sistema com Formas Orgânicas)">Material You (Formas Orgânicas Android)</option>
              </select>
            </div>

            {/* Extra requirements text field */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Requisitos ou Integrações Extras</label>
              <textarea
                placeholder="Ex: Adicionar persistência local segura com MMKV, sincronização com banco de dados externo ou modo escuro automático."
                rows={3}
                value={extraRequirements}
                onChange={(e) => setExtraRequirements(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg outline-none bg-white dark:bg-slate-900 dark:border-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 resize-none font-medium"
              ></textarea>
            </div>

            {/* Big Action button trigger */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Gerando Prompt...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sincronizar e Gerar com IA</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-zinc-50 border border-slate-200/55 rounded-xl text-[10px] text-slate-400 leading-normal flex items-start gap-2 select-none dark:bg-slate-950/40 dark:border-slate-800/80">
            <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>
              <strong>Dica:</strong> Altere as opções acima e gere. Os resultados mostram um prompt projetado passo a passo e o código de exemplo. Sinta-se à vontade para alterá-los.
            </span>
          </div>
        </div>

        {/* Right workspace output containing prompt and copyable tabs */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          <AnimatePresence mode="wait">
            {loading ? (
              // Beautiful animated step loading card
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-[400px] bg-slate-50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/40 border-dashed dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold mt-4 text-slate-800 dark:text-slate-100">Criando Projeto Sob Medida</h4>
                <p className="text-xs text-slate-500 mt-2 font-mono h-4 max-w-sm">
                  {loadingStep}
                </p>
              </motion.div>
            ) : (
              // Results card
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-3 min-h-[400px]"
              >
                
                {/* Overview banner */}
                <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl">
                  <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase font-mono">Overview da Arquitetura</span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 antialiased leading-relaxed">
                    {result.overview}
                  </p>
                  {result.isFallback && (
                    <span className="mt-2 inline-block text-[9px] font-semibold text-slate-400 bg-slate-150 px-2 py-0.5 rounded dark:bg-slate-800">
                      Modo local offline habilitado · Gemini API não configurada
                    </span>
                  )}
                </div>

                {/* Tabs selection menu */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  
                  {/* Tab 1: AI Prompt */}
                  <button
                    onClick={() => setActiveTab("prompt")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      activeTab === "prompt"
                        ? "bg-rose-500 text-white border-rose-600 shadow"
                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1. Prompt Perfeito (Copiar)</span>
                  </button>

                  {/* Tab 2: Directory Architecture */}
                  <button
                    onClick={() => setActiveTab("architecture")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      activeTab === "architecture"
                        ? "bg-rose-500 text-white border-rose-600 shadow"
                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>2. Estrutura de Pastas</span>
                  </button>

                  {/* Tab 3: Native Settings Permissions */}
                  <button
                    onClick={() => setActiveTab("permissions")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      activeTab === "permissions"
                        ? "bg-rose-500 text-white border-rose-600 shadow"
                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>3. Permissões Nativas</span>
                  </button>

                  {/* Tab 4: Raw Boilerplate code */}
                  <button
                    onClick={() => setActiveTab("code")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      activeTab === "code"
                        ? "bg-rose-500 text-white border-rose-600 shadow"
                        : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>4. Trecho TSX</span>
                  </button>
                </div>

                {/* Tab workspace area contents */}
                <div className="bg-slate-950 text-slate-300 rounded-2xl relative border border-slate-800 overflow-hidden flex flex-col h-[320px]">
                  
                  {/* Top copy action row inside dark box */}
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>
                      {activeTab === "prompt" && "SUGESTÃO DE PROMPT PARA LLM / COPILOT"}
                      {activeTab === "architecture" && "ARQUITETURA DE DIRETÓRIOS SUGERIDA (EXPO)"}
                      {activeTab === "permissions" && "DICAS E CONFIGS DE PERMISSÕES PLISTS / GRADLE"}
                      {activeTab === "code" && "EXEMPLO DE CÓDIGO FONTE REACT NATIVE - REACT-NATIVE-MONITOR"}
                    </span>

                    <button
                      onClick={() => {
                        let text = "";
                        if (activeTab === "prompt") text = result.perfectPrompt;
                        else if (activeTab === "architecture") text = result.architecture;
                        else if (activeTab === "permissions") text = result.nativeIntegrationTips;
                        else if (activeTab === "code") text = result.snippet;
                        handleCopyText(text, activeTab);
                      }}
                      className="px-2.5 py-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedStatus === activeTab ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3 h-3" />
                          <span>Copiar Conteúdo</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Core scroll container */}
                  <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed whitespace-pre-wrap select-text text-left">
                    {activeTab === "prompt" && (
                      <div className="text-rose-200 antialiased font-sans flex flex-col gap-2">
                        <span className="block p-2 bg-rose-950/40 text-rose-300 rounded-lg text-xs leading-normal font-medium mb-2 border border-rose-900/30">
                          🎯 <strong>Como usar:</strong> Cole esse prompt otimizado em qualquer assistente de código de IA ou passe para seu time para iniciar o app do celular com códigos impecáveis!
                        </span>
                        <div className="font-mono text-zinc-300 text-xs">
                          {result.perfectPrompt}
                        </div>
                      </div>
                    )}
                    {activeTab === "architecture" && (
                      <span className="text-zinc-200">{result.architecture}</span>
                    )}
                    {activeTab === "permissions" && (
                      <span className="text-zinc-300 antialiased font-sans whitespace-pre-wrap leading-relaxed">
                        {result.nativeIntegrationTips}
                      </span>
                    )}
                    {activeTab === "code" && (
                      <code className="text-emerald-400 block p-1 font-mono">{result.snippet}</code>
                    )}
                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Copilot Chat Buddy */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-5 mt-2 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>CO-PILOTO IA VITALISYNC</span>
                    <span className="text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-widest font-mono select-none">
                      Conectado
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">Tire dúvidas de wearables, Notifee, BLE e aprimore o seu prompt perfeito</p>
                </div>
              </div>
            </div>

            {/* Chat Box messages history list */}
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar text-left scroll-smooth">
              {chatMessages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[90%] ${
                      isUser ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border select-none text-[9px] font-bold ${
                        isUser
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                      }`}
                    >
                      {isUser ? "VP" : <Bot className="w-3 h-3" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-[11px] leading-relaxed relative border ${
                        isUser
                          ? "bg-rose-500/[0.04] border-rose-500/15 text-slate-200 rounded-tr-none"
                          : "bg-slate-950/70 border-slate-900 text-slate-300 rounded-tl-none font-sans"
                      }`}
                    >
                      <div className="whitespace-pre-wrap select-text antialiased">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {chatSubmitting && (
                <div className="flex items-start gap-2.5 self-start">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="p-3 bg-slate-950/40 border border-slate-900 text-slate-500 text-[11px] rounded-2xl rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                    <span className="animate-pulse">Co-piloto está elaborando uma resposta...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Micro action prompt quick-suggestions */}
            <div className="flex flex-wrap gap-1.5 py-1">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendChatMessage(suggestion)}
                  disabled={chatSubmitting}
                  className="text-[9px] font-medium text-slate-400 bg-slate-950/40 border border-slate-850 hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-slate-900/60 px-2.5 py-1 rounded-xl transition-all cursor-pointer text-left inline-block disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✨ {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.trim()) {
                  handleSendChatMessage(chatInput);
                }
              }}
              className="flex gap-2 bg-slate-950/60 rounded-xl p-1.5 border border-slate-900 focus-within:border-indigo-500/40 transition-all"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatSubmitting}
                placeholder="Pergunte ao Co-piloto (ex: Como configurar permissões de localização?)"
                className="flex-1 bg-transparent border-none text-[11px] text-slate-200 outline-none px-3 py-1.5 placeholder-slate-650 disabled:text-slate-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatSubmitting}
                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Perguntar</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
