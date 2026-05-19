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
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: "initial-1",
      title: "🧭 Bem-vindo ao Vitalis Hub",
      body: "Este é o painel de geração de prompts e simulação do app de saúde. Clique acima para gerar seu projeto ou interaja ao lado!",
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
    <div className="min-h-screen w-full bg-[#0a0a0b] text-slate-300 font-sans flex flex-col p-4 md:p-8 overflow-x-hidden relative select-none">
      
      {/* Background radial highlight gradient to make it look cohesive & expensive */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Elegant Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-rose-500/10">
            <Heart className="w-5 h-5 animate-pulse text-white fill-white/10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight italic">
              VITALISYNC
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
              Monitoramento de Saúde em Tempo Real & Gerador de Prompts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Simulated Smartwatch connected Status badge */}
          <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Smartwatch Conectado
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full p-1 pl-3.5 pr-1.5 text-xs text-slate-300">
            <span className="text-[10px] font-mono font-bold text-slate-500">USER:</span>
            <span className="font-semibold text-white">Victor Penedo</span>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs select-none shadow">
              VP
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start z-10 relative">
        
        {/* LEFT COMPONENT COLUMN: PromptStudio (Oficina de Prompts e Arquitetura técnica) */}
        <section className="xl:col-span-8 flex flex-col gap-6">
          <PromptStudio onAutoConfigureSimulatorWater={handleAutoConfigureSimulatorWater} />
          
          {/* Quick interactive guide / Information Banner */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <span className="text-[10px] font-bold text-rose-500 tracking-wider uppercase font-mono block mb-1">
                Sobre a Geração de Prompts do App de Saúde
              </span>
              <p className="text-sm font-medium text-white mb-2 leading-tight">
                Como funciona a integração técnica entre Smartwatch e Notificações Push?
              </p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                O prompt gerado configura e orienta as LLMs e desenvolvedores a usarem <strong className="text-slate-300 font-semibold">React Native + Expo</strong> para integrar <strong className="text-slate-300 font-semibold">HealthKit</strong> e <strong className="text-slate-300 font-semibold">Google Fit</strong> para batimentos cardíacos real-time, lógicas cíclicas para ingerir água/se alimentar e despertadores agendados via <strong className="text-slate-300 font-semibold">Notifee</strong> para tomar medicamentos com notificações push locais de alta confiabilidade.
              </p>
            </div>
            
            <div className="flex shrink-0 gap-3 border-l border-slate-800/80 pl-0 md:pl-6">
              <div className="text-left font-mono text-xs">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Plataformas</span>
                <span className="text-white font-bold">iOS + Android</span>
              </div>
              <div className="text-left font-mono text-xs border-l border-slate-800/50 pl-4">
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Linguagem</span>
                <span className="text-white font-bold">TypeScript</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COMPONENT COLUMN: Physical React Native Phone Simulator */}
        <section className="xl:col-span-4 flex flex-col items-center gap-6">
          
          <div className="w-full text-center xl:text-left">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center justify-center xl:justify-start gap-1.5 mb-2">
              <Smartphone className="w-4 h-4 text-rose-500" />
              <span>Simulador em Tempo Real</span>
            </h2>
            <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto xl:mx-0">
              Interaja diretamente com a tela responsiva simulando o app mobile. Você também pode disparar alertas específicos de remédio ou água e marcar como concluído!
            </p>
          </div>

          <PhoneSimulator
            onTriggerNotification={handleTriggerNotification}
            notifications={notifications}
            setNotifications={setNotifications}
          />
          
          {/* Debug / Action notification history inside Elegant Dark */}
          <div className="w-full max-w-sm bg-slate-900/30 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex justify-between items-center">
              <span>Histórico de Notificações Ativas</span>
              <button
                onClick={() => setNotifications([])}
                className="text-slate-400 hover:text-red-400 font-sans text-[10px] capitalize font-medium transition-colors"
              >
                Limpar
              </button>
            </h3>

            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-600">
                  Nenhuma notificação enviada ainda.
                </div>
              ) : (
                notifications.map((not) => (
                  <div
                    key={not.id}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-850 flex items-start gap-2 text-left"
                  >
                    <span className="text-xs">
                      {not.type === "water" ? "🌊" : not.type === "medication" ? "💊" : not.type === "food" ? "🍽️" : "🧭"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="text-[11px] font-bold text-slate-200 truncate">{not.title}</p>
                        <span className="text-[8px] text-slate-500">{not.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed truncate">
                        {not.body}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </section>

      </main>

      {/* Elegant Footer */}
      <footer className="mt-12 flex flex-col sm:flex-row justify-between items-center bg-slate-900/40 backdrop-blur border border-white/5 rounded-2xl p-4 gap-4 z-10 relative">
        <div className="flex flex-wrap space-x-6 px-4">
          <span className="text-white font-medium text-xs border-b-2 border-rose-500 pb-1 cursor-pointer">
            Visão Geral
          </span>
          <span className="text-slate-500 font-medium text-xs hover:text-slate-300 transition-colors cursor-pointer">
            Especificações Expo
          </span>
          <span className="text-slate-500 font-medium text-xs hover:text-slate-300 transition-colors cursor-pointer">
            Guias Wearable
          </span>
          <span className="text-slate-500 font-medium text-xs hover:text-slate-300 transition-colors cursor-pointer">
            Exemplos Notifee
          </span>
        </div>
        <div className="text-[10px] text-slate-600 font-mono tracking-tighter">
          v2.4.0-STABLE • ANDROID_IOS_SDK_READY
        </div>
      </footer>

    </div>
  );
}
