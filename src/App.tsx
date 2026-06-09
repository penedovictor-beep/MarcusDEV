import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Smartphone,
  Sparkles,
  Info,
  CheckCircle,
  Copy,
  AlertCircle,
  Heart,
  Droplet,
  Bell,
  Check,
} from "lucide-react";
import PhoneSimulator from "./components/PhoneSimulator";
import PromptStudio from "./components/PromptStudio";
import { PushNotification } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "prompts">("dashboard");
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: "initial-1",
      title: "🧭 Bem-vindo ao Vitalis Hub",
      body: "Este é o painel de monitoramento de saúde em tempo real do Vitalisyne. Clique acima para alternar visões ou testar recursos!",
      time: "Agora",
      type: "system",
    },
  ]);

  const handleTriggerNotification = (newNotification: PushNotification) => {
    // Add new notification to active list
    setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
  };

  const handleAutoConfigureSimulatorWater = (amount: number) => {
    // Simulate water integration callback
    handleTriggerNotification({
      id: String(Date.now()),
      title: "🌊 Configuração de Água",
      body: `Nova meta de hidratação ou log simulada: +${amount}ml adicionados.`,
      time: "Agora",
      type: "water",
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] text-slate-700 font-sans flex flex-col p-4 md:p-8 overflow-x-hidden relative select-none">
      
      {/* Background radial highlight gradient to make it look cohesive & expensive */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-500/[0.02] rounded-full blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[130px] pointer-events-none z-0"></div>

      {/* Elegant Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 z-10 relative border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-500/15">
            <Heart className="w-5 h-5 animate-pulse text-white fill-white/10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight italic flex items-center gap-2">
              VITALISYNC <span className="text-xs not-italic bg-rose-500/10 text-rose-600 font-bold border border-rose-550/20 px-2 py-0.5 rounded-full">WEB PORTAL</span>
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5 font-semibold">
              Plataforma de Monitoramento Clínico & Integrações Wearables
            </p>
          </div>
        </div>

        {/* Responsive App Nav View Switcher Tabs */}
        <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl items-center gap-1.5 w-full md:w-auto shadow-sm">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none ${
              activeTab === "dashboard"
                ? "bg-white text-slate-900 shadow border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Dashboard Web</span>
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none ${
              activeTab === "prompts"
                ? "bg-white text-slate-900 shadow border border-slate-200/50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Prompt Studio</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Simulated Smartwatch connected Status badge */}
          <div className="flex items-center bg-emerald-500/10 border border-emerald-555/20 rounded-full px-3 py-1.5 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              Smartwatch Online
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full p-0.5 pl-3.5 pr-1.5 text-xs text-slate-650">
            <span className="text-[10px] font-mono font-bold text-slate-400">USER:</span>
            <span className="font-semibold text-slate-800">Victor Penedo</span>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs select-none shadow-sm">
              VP
            </div>
          </div>
        </div>
      </header>

      {/* Main Switchable Content View */}
      <main className="flex-1 z-10 relative">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-8"
            >
              {/* Responsive Web Dashboard view replaces old phone simulator physical body to let it stretch beautifully */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Main Dashboard Panel Component: converted from simulator to website layout */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                  <PhoneSimulator
                    onTriggerNotification={handleTriggerNotification}
                    notifications={notifications}
                    setNotifications={setNotifications}
                  />
                </div>

                {/* Side alert center and active system widgets */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  
                  {/* Web Alerts Center */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-555"></span>
                        </span>
                        <span>Feed de Alertas</span>
                      </h3>
                      <button
                        onClick={() => setNotifications([])}
                        className="text-slate-450 hover:text-red-500 font-sans text-[10px] capitalize font-semibold transition-colors"
                      >
                        Limpar Todos
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto no-scrollbar pr-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-400 flex flex-col items-center gap-2">
                          <span className="text-2xl">📭</span>
                          <p>Nenhuma notificação programada ou pendente.</p>
                        </div>
                      ) : (
                        notifications.map((not) => (
                          <div
                            key={not.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-left hover:border-slate-200 transition-all duration-150"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm shrink-0 border border-slate-200 shadow-sm">
                              {not.type === "water" ? "🌊" : not.type === "medication" ? "💊" : not.type === "food" ? "🍽️" : "🧭"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{not.title}</p>
                                <span className="text-[9px] text-slate-400 shrink-0 font-mono">{not.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 leading-normal antialiased">
                                {not.body}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* System stats banner panel */}
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-left">
                    <span className="text-[9px] font-bold text-indigo-650 tracking-wider uppercase font-mono block mb-1">
                      Portal Sincronizado
                    </span>
                    <h4 className="text-xs font-bold text-indigo-900 mb-1.5">Arquitetura Híbrida de Persistência</h4>
                    <p className="text-[11px] text-slate-600 leading-normal mb-3">
                      As alterações registradas no portal são gravadas em seu banco na nuvem do Supabase assim que as tabelas forem geradas pelo SQL Editor.
                    </p>
                    <div className="flex gap-4 border-t border-indigo-100 pt-3">
                      <div>
                        <span className="text-[9px] text-slate-450 font-bold block uppercase font-mono">Tabelas</span>
                        <span className="text-xs text-indigo-850 font-mono font-bold">medications, food_logs...</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="prompts"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              <PromptStudio onAutoConfigureSimulatorWater={handleAutoConfigureSimulatorWater} />
              
              {/* Quick instructions / Information Banner */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase font-mono block mb-1">
                    Sobre a Geração de Prompts do App de Saúde
                  </span>
                  <p className="text-sm font-semibold text-slate-900 mb-2 leading-tight">
                    Como funciona a integração técnica entre Smartwatch e Notificações Push?
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    O prompt gerado configura e orienta as LLMs e desenvolvedores a usarem <strong className="text-slate-700 font-semibold">React Native + Expo</strong> para integrar <strong className="text-slate-700 font-semibold">HealthKit</strong> e <strong className="text-slate-700 font-semibold">Google Fit</strong> para batimentos cardíacos real-time, lógicas cíclicas para ingerir água/se alimentar e despertadores agendados via <strong className="text-slate-700 font-semibold">Notifee</strong> para tomar medicamentos com notificações push locais de alta confiabilidade.
                  </p>
                </div>
                
                <div className="flex shrink-0 gap-3 border-l border-slate-200 pl-0 md:pl-6">
                  <div className="text-left font-mono text-xs">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Plataformas</span>
                    <span className="text-slate-800 font-bold">iOS + Android</span>
                  </div>
                  <div className="text-left font-mono text-xs border-l border-slate-200 pl-4">
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Linguagem</span>
                    <span className="text-slate-800 font-bold">TypeScript</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant Footer */}
      <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 gap-4 z-10 relative shadow-sm">
        <div className="flex flex-wrap space-x-6 px-4">
          <span className="text-rose-600 font-bold text-xs border-b-2 border-rose-500 pb-1 cursor-pointer">
            Visão Geral
          </span>
          <span className="text-slate-450 font-medium text-xs hover:text-slate-755 transition-colors cursor-pointer">
            Especificações Expo
          </span>
          <span className="text-slate-450 font-medium text-xs hover:text-slate-755 transition-colors cursor-pointer">
            Guias Wearable
          </span>
          <span className="text-slate-450 font-medium text-xs hover:text-slate-755 transition-colors cursor-pointer">
            Exemplos Notifee
          </span>
        </div>
        <div className="text-[10px] text-slate-450 font-mono tracking-tighter">
          v2.4.0-STABLE • ANDROID_IOS_SDK_READY
        </div>
      </footer>

    </div>
  );
}
