import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Droplet,
  Coffee,
  Check,
  Plus,
  Trash2,
  Bell,
  Activity,
  Smartphone,
  Watch,
  X,
  Sparkles,
  RefreshCw,
  Cloud,
  Database,
  Copy,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Medication, FoodLog, WearableStatus, PushNotification } from "../types";
import { supabase } from "../lib/supabaseClient";

// Simulated Heart Rate presets based on user activities
const HEART_PRESETS = [
  { name: "Repouso", range: [58, 66], color: "emerald", label: "Excelente" },
  { name: "Caminhada", range: [92, 104], color: "amber", label: "Moderado" },
  { name: "Cardio Intenso", range: [135, 155], color: "rose", label: "Elevado" },
  { name: "Meditação", range: [48, 55], color: "sky", label: "Ideal" },
];

interface PhoneSimulatorProps {
  onTriggerNotification: (notify: PushNotification) => void;
  notifications: PushNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<PushNotification[]>>;
}

export default function PhoneSimulator({
  onTriggerNotification,
  notifications,
  setNotifications,
}: PhoneSimulatorProps) {
  // Mobile UI States
  const [bpm, setBpm] = useState(72);
  const [activePreset, setActivePreset] = useState("Repouso");
  const [wearableState, setWearableState] = useState<WearableStatus>("Aparelho Conectado");
  const [battery, setBattery] = useState(89);

  // Supabase Sync States
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Water intake system
  const [waterIntake, setWaterIntake] = useState(1250); // ml
  const [waterGoal] = useState(2500); // ml

  // Food logs (Default seed values)
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([
    { id: "1", time: "08:15", mealType: "Café", description: "Ovo mexido, torrada integral e café puro", calories: 340 },
    { id: "2", time: "12:30", mealType: "Almoço", description: "Grelhado com arroz integral e salada verde", calories: 580 },
  ]);
  const [foodDesc, setFoodDesc] = useState("");
  const [foodCalories, setFoodCalories] = useState(300);
  const [foodType, setFoodType] = useState<"Café" | "Almoço" | "Jantar" | "Lanche">("Café");

  // Medication states
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Paracetamol", dosage: "500mg", frequency: "A cada 8 horas", time: "08:00", taken: true, takenAt: "08:03" },
    { id: "2", name: "Glucosamina", dosage: "1500mg", frequency: "1x ao dia", time: "13:00", taken: false },
    { id: "3", name: "Losartana", dosage: "50mg", frequency: "A cada 12 horas", time: "22:00", taken: false },
  ]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedTime, setNewMedTime] = useState("08:00");
  const [newMedFreq, setNewMedFreq] = useState("1x ao dia");

  // Heartbeat chart simulation (scrolling buffer for ECG visualization)
  const [chartData, setChartData] = useState<number[]>(Array(30).fill(72));

  // Time String clock
  const [currentTime, setCurrentTime] = useState("");

  // Copy SQL script tool helper
  const sqlSchemaText = `-- CADASTRO DE TABELAS NO SUPABASE (SQL EDITOR)
-- Copie e cole este script no painel "SQL Editor" do seu Supabase para testar a persistência cloud:

CREATE TABLE IF NOT EXISTS public.medications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  time TEXT,
  taken BOOLEAN DEFAULT false,
  taken_at TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.food_logs (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  description TEXT,
  calories INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.water_logs (
  id TEXT PRIMARY KEY,
  amount INTEGER DEFAULT 0,
  log_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Configurações rápidas de RLS público (leitura e escrita irrestritas para simulação):
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura anon" ON public.medications FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anon" ON public.medications FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao anon" ON public.medications FOR UPDATE USING (true);
CREATE POLICY "Permitir remocoes anon" ON public.medications FOR DELETE USING (true);

CREATE POLICY "Permitir leitura anon_food" ON public.food_logs FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anon_food" ON public.food_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir remocoes anon_food" ON public.food_logs FOR DELETE USING (true);

CREATE POLICY "Permitir leitura anon_water" ON public.water_logs FOR SELECT USING (true);
CREATE POLICY "Permitir insercao anon_water" ON public.water_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir remocoes anon_water" ON public.water_logs FOR DELETE USING (true);
`;

  // Fetch initial data from Supabase if online and tables exist
  const fetchSupabaseData = async () => {
    setSyncStatus("syncing");
    setSyncMessage("Buscando informações do Supabase...");
    try {
      // 1. Fetch medications
      const { data: dbMeds, error: medsError } = await supabase
        .from("medications")
        .select("*")
        .order("created_at", { ascending: true });

      if (medsError) throw medsError;

      // 2. Fetch food logs
      const { data: dbFood, error: foodError } = await supabase
        .from("food_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (foodError) throw foodError;

      // 3. Fetch water logs for today
      const todayStr = new Date().toISOString().split("T")[0];
      const { data: dbWater, error: waterError } = await supabase
        .from("water_logs")
        .select("*")
        .eq("log_date", todayStr);

      if (waterError) throw waterError;

      // Synchronize back to local states
      if (dbMeds && dbMeds.length > 0) {
        setMeds(dbMeds.map((m: any) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage || "",
          frequency: m.frequency || "",
          time: m.time || "08:00",
          taken: !!m.taken,
          takenAt: m.taken_at || undefined,
        })));
      }

      if (dbFood && dbFood.length > 0) {
        setFoodLogs(dbFood.map((f: any) => ({
          id: f.id,
          time: f.time,
          mealType: f.meal_type as any,
          description: f.description || "",
          calories: f.calories || 0,
        })));
      }

      if (dbWater && dbWater.length > 0) {
        const totalWater = dbWater.reduce((sum, w) => sum + (w.amount || 0), 0);
        setWaterIntake(totalWater);
      } else {
        setWaterIntake(0);
      }

      setSyncStatus("success");
      setSyncMessage("Dados sincronizados com o Supabase!");
    } catch (err: any) {
      console.warn("Could not load from Supabase - sandbox local mode remains active. Error:", err);
      setSyncStatus("error");
      setSyncMessage(err.message || "Tabelas não criadas ou erro de conexão.");
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update heart beat live with slight noise based on selected preset
  useEffect(() => {
    const handle = setInterval(() => {
      if (wearableState !== "Aparelho Conectado") {
        setBpm(0);
        return;
      }

      const preset = HEART_PRESETS.find((p) => p.name === activePreset);
      if (preset) {
        const [min, max] = preset.range;
        const targetBpm = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Smooth transition
        setBpm((current) => {
          const diff = targetBpm - current;
          const step = diff > 0 ? Math.ceil(diff / 3) : Math.floor(diff / 3);
          const nextBpm = current + step;
          
          // Update scrolling chart buffer
          setChartData((prev) => [...prev.slice(1), nextBpm]);
          
          return nextBpm;
        });
      }
    }, 1500);

    return () => clearInterval(handle);
  }, [activePreset, wearableState]);

  // Slowly drain smartwatch battery
  useEffect(() => {
    const interval = setInterval(() => {
      setBattery((b) => (b > 5 ? b - 1 : 99));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Hydration simulation notification button handler
  const triggerWaterReminderSim = () => {
    const alerts = [
      "Lembrete de Hidratação: Beba 250ml de água mineral para atingir sua meta!",
      "Hora do Gole: Que tal se levantar e se hidratar um pouco?",
      "Metas de saúde: Você está progredindo bem com os líquidos hoje!",
    ];
    const chosen = alerts[Math.floor(Math.random() * alerts.length)];
    onTriggerNotification({
      id: String(Date.now()),
      title: "🌊 Lembrete de Água",
      body: chosen,
      time: "Agora",
      type: "water",
      actionText: "Beber 250ml",
    });
  };

  // Simulates taking water right after notification action click
  const handleAutoDrink = async (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, 4000));
    
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const newWaterLogId = String(Date.now());
      const { error } = await supabase.from("water_logs").insert([
        { id: newWaterLogId, amount, log_date: todayStr }
      ]);
      if (error) throw error;
      setSyncStatus("success");
    } catch (err) {
      console.warn("Supabase water registration skipped or failed:", err);
    }
  };

  // Water increment log
  const handleAddWater = async (amount: number) => {
    setWaterIntake((current) => Math.min(current + amount, 4000));
    // Dynamic micro popup notification feedback helper
    if (Math.random() > 0.4) {
      onTriggerNotification({
        id: String(Date.now()),
        title: "💧 Hidratado!",
        body: `Você registrou +${amount}ml de água com sucesso no app.`,
        time: "Agora",
        type: "water",
      });
    }

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const newWaterLogId = String(Date.now());
      const { error } = await supabase.from("water_logs").insert([
        { id: newWaterLogId, amount, log_date: todayStr }
      ]);
      if (error) throw error;
      setSyncStatus("success");
    } catch (err) {
      console.warn("Supabase water logging failed:", err);
    }
  };

  // Add custom food
  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodDesc.trim()) return;

    const newLog: FoodLog = {
      id: String(Date.now()),
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      mealType: foodType,
      description: foodDesc.trim(),
      calories: Number(foodCalories) || 200,
    };

    setFoodLogs([newLog, ...foodLogs]);
    setFoodDesc("");
    
    onTriggerNotification({
      id: String(Date.now()),
      title: "🍽️ Refeição Registrada",
      body: `Log de ${newLog.mealType} adicionado: ${newLog.description} (${newLog.calories} kcal).`,
      time: "Agora",
      type: "food",
    });

    try {
      const { error } = await supabase.from("food_logs").insert([
        {
          id: newLog.id,
          time: newLog.time,
          meal_type: newLog.mealType,
          description: newLog.description,
          calories: newLog.calories,
        }
      ]);
      if (error) throw error;
      setSyncStatus("success");
    } catch (err) {
      console.warn("Supabase food log registration failed:", err);
    }
  };

  const handleDeleteFood = async (id: string, calories: number, type: string) => {
    setFoodLogs(foodLogs.filter((log) => log.id !== id));

    try {
      const { error } = await supabase.from("food_logs").delete().eq("id", id);
      if (error) throw error;
      setSyncStatus("success");
    } catch (err) {
      console.warn("Supabase food log deletion skipped:", err);
    }
  };

  // Medication actions
  const toggleMed = async (id: string) => {
    let updatedMed: Medication | null = null;
    setMeds(
      meds.map((med) => {
        if (med.id === id) {
          const nextState = !med.taken;
          const takenAtStr = nextState ? new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined;
          
          updatedMed = {
            ...med,
            taken: nextState,
            takenAt: takenAtStr,
          };

          if (nextState) {
            onTriggerNotification({
              id: String(Date.now()),
              title: "✅ Remédio Tomado",
              body: `Você registrou que tomou ${med.name} ${med.dosage}.`,
              time: "Agora",
              type: "medication",
            });
          }
          return updatedMed;
        }
        return med;
      })
    );

    if (updatedMed) {
      try {
        const { error } = await supabase
          .from("medications")
          .update({
            taken: (updatedMed as Medication).taken,
            taken_at: (updatedMed as Medication).takenAt || null,
          })
          .eq("id", id);
        if (error) throw error;
        setSyncStatus("success");
      } catch (err) {
        console.warn("Supabase medication status update skipped:", err);
      }
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    const newMed: Medication = {
      id: String(Date.now()),
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      frequency: newMedFreq,
      time: newMedTime,
      taken: false,
    };

    setMeds([...meds, newMed]);
    setNewMedName("");
    setNewMedDosage("");

    onTriggerNotification({
      id: String(Date.now()),
      title: "💊 Novo Alarme de Medicamento",
      body: `Alarme configurado para ${newMed.name} (${newMed.dosage}) às ${newMed.time}.`,
      time: "Agora",
      type: "medication",
    });

    try {
      const { error } = await supabase.from("medications").insert([
        {
          id: newMed.id,
          name: newMed.name,
          dosage: newMed.dosage,
          frequency: newMed.frequency,
          time: newMed.time,
          taken: false,
          taken_at: null,
        }
      ]);
      if (error) throw error;
      setSyncStatus("success");
    } catch (err) {
      console.warn("Supabase medication insertion failed:", err);
    }
  };

  const deleteMed = async (id: string) => {
    setMeds(meds.filter((m) => m.id !== id));

    try {
      const { error } = await supabase.from("medications").delete().eq("id", id);
      if (error) throw error;
      setSyncStatus("success");
    } catch (err) {
      console.warn("Supabase medication deletion failed:", err);
    }
  };

  // Simulates medication alert rings!
  const triggerMedAlarmSim = (med: Medication) => {
    onTriggerNotification({
      id: String(Date.now() + 1),
      title: `🔔 Hora do Remédio: ${med.name}`,
      body: `Atenção: Está na hora de tomar seu remédio ${med.name} (${med.dosage}) agendado para às ${med.time}. Clique para registrar.`,
      time: "Agora",
      type: "medication",
      actionText: "Disparar Marcador de Consumo",
    });
  };

  // Summary calorie calculator
  const totalCalories = foodLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const dailyCalorieGoal = 2000;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-600">
      
      {/* Top Banner Control Center */}
      <div className="w-full p-5 bg-white border border-slate-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Watch className="w-5 h-5 text-indigo-600 animate-pulse" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-none mb-1">
              Painel de Integração de Wearables
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Smartwatch Status:</span>
              <select
                value={wearableState}
                onChange={(e) => setWearableState(e.target.value as WearableStatus)}
                className="text-xs font-bold text-rose-600 bg-white border border-slate-200 rounded px-1.5 py-0.5 outline-none cursor-pointer focus:border-rose-500"
              >
                <option value="Aparelho Conectado" className="bg-white text-slate-700">🟢 Conectado (BLE Active)</option>
                <option value="Conectando..." className="bg-white text-slate-700">🟡 Pareando...</option>
                <option value="Desconectado" className="bg-white text-slate-700">🔴 Desconectado</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Smartwatch Battery Indicator */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 font-mono">
              🔋 Smartwatch: {battery}%
            </span>
            <button
              onClick={() => setBattery(100)}
              title="Recarregar Bateria"
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-650"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Supabase Status Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSyncPanel(!showSyncPanel)}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span>Conector Cloud SQL</span>
              {syncStatus === "success" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
              {syncStatus === "error" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
              {syncStatus === "syncing" && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-spin"></span>}
            </button>
          </div>
        </div>
      </div>

      {/* Supabase details expanded panel */}
      {showSyncPanel && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="w-full bg-white border border-indigo-200 p-5 rounded-2xl flex flex-col gap-4 text-left shadow-md overflow-hidden text-slate-600"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xs font-bold font-mono text-indigo-700 uppercase tracking-widest">Configuração do Banco Secundário cloud</h3>
            </div>
            <button
              onClick={fetchSupabaseData}
              disabled={syncStatus === "syncing"}
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
              <span>Sincronizar Cloud SQL</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            O portal está programado com um fallback sandbox local para que você teste à vontade. Para habilitar a escrita na nuvem do Supabase, copie o script abaixo e rode-o no seu terminal SQL.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs font-mono space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-450">DATABASE URL:</span>
                <span className="text-slate-800 break-all select-all font-semibold">https://vsggnechqtuyknekebmf.supabase.co</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">ANON KEY:</span>
                <span className="text-slate-800 truncate max-w-[150px] select-all font-semibold">sb_publishable_HsOeEfZkGh2elTo2ZWYGZw_trhuU9A3</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-450">STATUS:</span>
                <span className={`font-bold uppercase ${syncStatus === "success" ? "text-emerald-600" : "text-amber-600 animate-pulse"}`}>
                  {syncStatus === "success" ? "Sincronizado na Nuvem" : "Modo Sandbox (Tabelas pendentes)"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50/50 border border-slate-200/80 p-4 rounded-xl flex flex-col justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">Criação das Tabelas no Database Cloud</span>
                <p className="text-[11px] text-slate-500">
                  Execute o script SQL para as tabelas `medications`, `food_logs` e `water_logs` estarem integradas ao seu back-end.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex-1 py-2 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                >
                  <Copy className="w-4 h-4" />
                  <span>{sqlCopied ? "Copiado!" : "Copiar Script SQL"}</span>
                </button>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 text-xs border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Supabase Dashboard</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Responsive Bento Grid Dashboard UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Heartbeat sensor widget - Bento Card 5 cols */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Heart className={`w-4 h-4 text-rose-500 ${bpm > 0 ? "animate-pulse" : ""} fill-rose-550`} />
                <span>Sensor de Batimentos (Frequência)</span>
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold uppercase">{currentTime || "-:-"}</span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-2 text-left">
              <span className="text-6xl font-light text-slate-900 tracking-tighter">
                {bpm > 0 ? bpm : "---"}
              </span>
              <span className="text-sm font-bold text-rose-600">BPM</span>
            </div>

            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 text-left">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Sinal: {wearableState === "Aparelho Conectado" ? "Excelente (Leitura Real-Time)" : "Pausado (Smartwatch despareado)"}</span>
            </div>

            {/* Sparkline live chart display of heartbeat ECG stream */}
            <div className="h-16 w-full mt-6 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-end gap-[2px]">
              {chartData.map((val, i) => {
                const percent = Math.min(Math.max(((val - 45) / 120) * 100, 10), 95);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-rose-500/10 to-rose-500/80 hover:to-rose-600 rounded-t transition-all duration-300"
                    style={{ height: `${percent}%` }}
                    title={`BPM: ${val}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Activity preset select toggles */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider font-mono block mb-2 text-left">
              Mudar Atividade Relacionada (Simulador):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {HEART_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setActivePreset(p.name)}
                  className={`text-xs font-bold px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    activePreset === p.name
                      ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                      : "bg-slate-50 border-slate-150 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    {p.range[0]}-{p.range[1]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hydration tracking cyclical management - Bento Card 7 cols */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-indigo-500 animate-bounce" />
                <span>Registro de Hidratação Diária</span>
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold uppercase">Consumo Ideal</span>
            </div>

            <div className="flex items-baseline gap-1.5 mt-2 text-left">
              <span className="text-6xl font-light text-slate-900 tracking-tighter">
                {waterIntake >= 1000 ? `${(waterIntake / 1000).toFixed(2)}` : `${waterIntake}`}
                {waterIntake >= 1000 ? <span className="text-xl font-bold ml-1 text-indigo-600">Litros</span> : <span className="text-xl font-bold ml-1 text-indigo-600">ml</span>}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 2.50L Meta Mínima</span>
            </div>

            {/* Custom high-end interactive progress bar waves */}
            <div className="w-full bg-slate-100 h-6 rounded-2xl overflow-hidden relative border border-slate-200/60 flex items-center justify-center my-6">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full absolute left-0 bottom-0 top-0 transition-all duration-350 rounded-2xl"
                style={{ width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%` }}
              />
              <span className="z-10 text-xs font-extrabold text-indigo-950 uppercase tracking-wider font-mono">
                {Math.round((waterIntake / waterGoal) * 100)}% Consumidos
              </span>
            </div>

            {/* Hydration quick presets log triggers */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleAddWater(150)}
                className="py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <span className="text-xs">💧</span>
                <span>+150 ml</span>
              </button>
              <button
                onClick={() => handleAddWater(250)}
                className="py-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-150 text-indigo-700 text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
              >
                <span className="text-xs">🥤</span>
                <span>+250 ml</span>
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <span className="text-xs text-blue-200">🌊</span>
                <span>+500 ml</span>
              </button>
            </div>
          </div>

          {/* Test reminder triggers */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <p className="text-[11px] text-slate-500 font-medium text-left">
              Quer testar como o aplicativo móvel reage a alertas em background?
            </p>
            <button
              onClick={triggerWaterReminderSim}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 hover:text-indigo-800 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Disparar Lembrete Push</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom widgets section - meds, calorie counters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Prescription medication scheduling ledger */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <span>💊</span>
                <span>Agenda de Medicamentos do Dia</span>
              </span>
              <span className="text-[11px] font-extrabold px-2.5 py-1 bg-amber-50 border border-amber-200/60 text-amber-800 rounded-lg uppercase tracking-wide">
                {meds.filter(m => !m.taken).length} Pendentes hoje
              </span>
            </div>

            {/* List and toggle checks */}
            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto no-scrollbar pr-1">
              {meds.length === 0 ? (
                <p className="text-xs text-slate-450 py-6 text-center">Nenhum medicamento agendado.</p>
              ) : (
                meds.map((med) => (
                  <div
                    key={med.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      med.taken
                        ? "bg-slate-50/70 border-slate-100 opacity-60"
                        : "bg-amber-500/[0.02]/30 border-slate-200/80 shadow-sm"
                     }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMed(med.id)}
                        className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          med.taken
                            ? "bg-emerald-555 border-emerald-666 text-white bg-emerald-500"
                            : "border-slate-300 bg-white text-slate-400 hover:border-amber-500"
                        }`}
                      >
                        {med.taken && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <div className="text-left">
                        <p className={`text-xs font-bold leading-none mb-1 ${med.taken ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {med.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Dosagem: <span className="text-slate-700 font-semibold">{med.dosage}</span> · Horário: <span className="font-semibold text-amber-650 tracking-wide font-mono">{med.time}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => triggerMedAlarmSim(med)}
                        title="Simular Notificação do Medicamento"
                        className="p-1 px-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Notificar</span>
                      </button>
                      <button
                        onClick={() => deleteMed(med.id)}
                        title="Remover Registro"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New medication alarm forms */}
          <form onSubmit={handleAddMed} className="p-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col gap-3 mt-4 text-left">
            <span className="text-[10px] font-bold text-slate-450 tracking-wider uppercase font-mono block">Cadastrar Novo Medicamento Clínico:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Nome do Remédio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ácido Fólico"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-amber-500 placeholder-slate-400 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Fórmula / Dosagem</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 50mg - 1 comprimido"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-amber-500 placeholder-slate-400 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400">Horário Agendado</label>
                <input
                  type="time"
                  required
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-mono font-semibold focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Nova Agenda</span>
              </button>
            </div>
          </form>
        </div>

        {/* Nutritional meal logging widget */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 flex flex-col justify-between transition-all">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-emerald-500" />
                <span>Registro Alimentar & Dieta</span>
              </span>
              <div className="text-right">
                <span className="text-xs text-slate-450">Meta Calórica: </span>
                <span className="text-xs font-bold font-mono text-emerald-600">{totalCalories} / {dailyCalorieGoal} kcal</span>
              </div>
            </div>

            {/* Calories visual progress gauge ring */}
            <div className="space-y-1 text-left">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold">
                <span>PROGRESSO DIÁRIO</span>
                <span>{Math.round((totalCalories / dailyCalorieGoal) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/80">
                <div
                  className="bg-gradient-to-r from-emerald-555 to-emerald-444 h-full rounded-full transition-all duration-300 bg-emerald-500"
                  style={{ width: `${Math.min((totalCalories / dailyCalorieGoal) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* List meal records */}
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto no-scrollbar pr-1">
              {foodLogs.length === 0 ? (
                <p className="text-xs text-slate-450 py-4 text-center">Nenhum log inserido hoje.</p>
              ) : (
                foodLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-150 hover:border-slate-200 transition-all duration-150">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded font-sans uppercase tracking-wide">
                          {log.mealType}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 line-clamp-1">
                        {log.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-black font-mono text-slate-700 whitespace-nowrap">
                        {log.calories} kcal
                      </span>
                      <button
                        onClick={() => handleDeleteFood(log.id, log.calories, log.mealType)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Deletar refeição"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Food adding form */}
          <form onSubmit={handleAddFood} className="p-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col gap-3 mt-4 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-450 tracking-wider uppercase font-mono block">Logar Nova Refeição Ativa:</span>
              
              <div className="flex gap-1 font-sans">
                {(["Café", "Almoço", "Jantar", "Lanche"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFoodType(type)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      foodType === type
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-slate-250 text-slate-550 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="Ex: Omelete de clara e ricota"
                value={foodDesc}
                onChange={(e) => setFoodDesc(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-555 focus:border-emerald-500 font-semibold placeholder-slate-400"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  max="1500"
                  placeholder="Kcal"
                  value={foodCalories}
                  onChange={(e) => setFoodCalories(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-850 outline-none font-mono font-semibold focus:border-emerald-500 text-slate-800"
                />
                <button
                  type="submit"
                  className="px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all font-mono uppercase tracking-wider cursor-pointer shadow-sm animate-pulse"
                >
                  Reg
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
