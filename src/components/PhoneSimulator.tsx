import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { Medication, FoodLog, WearableStatus, PushNotification } from "../types";

// Simulated Heart Rate presets based on user activities
const HEART_PRESETS = [
  { name: "Repouso", range: [58, 66], color: "text-emerald-500 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/40" },
  { name: "Caminhada", range: [92, 104], color: "text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40" },
  { name: "Cardio Intenso", range: [135, 155], color: "text-rose-500 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40" },
  { name: "Meditação", range: [48, 55], color: "text-sky-500 bg-sky-50 border-sky-100 dark:bg-sky-950/20 dark:border-sky-900/40" },
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

  // Water intake system
  const [waterIntake, setWaterIntake] = useState(1250); // ml
  const [waterGoal] = useState(2500); // ml

  // Food logs
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([
    { id: "1", time: "08:15", mealType: "Café", description: "Ovo mexido, torrada integral e café pura", calories: 340 },
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

  // Heartbeat chart simulation (scrolling buffer)
  const [chartData, setChartData] = useState<number[]>(Array(24).fill(72));

  // Time String clock
  const [currentTime, setCurrentTime] = useState("");

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
  const handleAutoDrink = (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, 4000));
  };

  // Water increment log
  const handleAddWater = (amount: number) => {
    setWaterIntake((current) => Math.min(current + amount, 4000));
    // Dynamic micro popup notification feedback helper
    if (Math.random() > 0.4) {
      onTriggerNotification({
        id: String(Date.now()),
        title: "💧 Hidratado!",
        body: `Você registrou +${amount}ml de água com sucesso.`,
        time: "Agora",
        type: "water",
      });
    }
  };

  // Add custom food
  const handleAddFood = (e: React.FormEvent) => {
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
  };

  const handleDeleteFood = (id: string, calories: number, type: string) => {
    setFoodLogs(foodLogs.filter((log) => log.id !== id));
  };

  // Medication actions
  const toggleMed = (id: string) => {
    setMeds(
      meds.map((med) => {
        if (med.id === id) {
          const nextState = !med.taken;
          if (nextState) {
            // Toast notify
            onTriggerNotification({
              id: String(Date.now()),
              title: "✅ Remédio Tomado",
              body: `Você registrou que tomou ${med.name} ${med.dosage}.`,
              time: "Agora",
              type: "medication",
            });
            return {
              ...med,
              taken: true,
              takenAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            };
          }
          return { ...med, taken: false, takenAt: undefined };
        }
        return med;
      })
    );
  };

  const handleAddMed = (e: React.FormEvent) => {
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
  };

  const deleteMed = (id: string) => {
    setMeds(meds.filter((m) => m.id !== id));
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

  return (
    <div id="phone-container" className="flex flex-col items-center">
      
      {/* Simulation Devices Status bar / Controller */}
      <div className="w-full max-w-sm mb-4 px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shadow-sm transition-all">
        <div className="flex items-center gap-1.5 font-medium">
          <Watch className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>Status do Relógio:</span>
          <select
            value={wearableState}
            onChange={(e) => setWearableState(e.target.value as WearableStatus)}
            className="font-semibold bg-transparent border-none text-rose-400 focus:outline-none cursor-pointer"
          >
            <option value="Aparelho Conectado" className="bg-slate-950 text-slate-300">Conectado (Smartwatch)</option>
            <option value="Conectando..." className="bg-slate-950 text-slate-300">Buscando pareamento...</option>
            <option value="Desconectado" className="bg-slate-950 text-slate-300">Despareado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-full font-mono text-[10px] items-center flex gap-1 text-slate-300">
            🔋 {battery}%
          </span>
          <button
            onClick={() => setBattery(100)}
            title="Recarregar"
            className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-450 hover:text-white"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Interactive Mobile Device Simulator Frame */}
      <div className="w-full max-w-sm bg-slate-950 p-3.5 rounded-[44px] shadow-2xl border-4 border-slate-800/80 relative overflow-hidden ring-4 ring-slate-900/10">
        
        {/* Device Ear Speaker Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-40 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-800 rounded-full mb-1"></div>
        </div>

        {/* Live Device Top Notification banner overlay */}
        <div className="absolute top-8 left-3 right-3 z-50 pointer-events-none">
          <AnimatePresence>
            {notifications.slice(0, 1).map((not) => (
              <motion.div
                key={not.id}
                initial={{ opacity: 0, y: -50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="w-full bg-white/95 dark:bg-slate-900/95 shadow-xl rounded-2xl p-3.5 border border-slate-200/80 pointer-events-auto dark:border-slate-800 flex flex-col gap-2 cursor-pointer"
                onClick={() => {
                  // If it has action, simulate immediate fulfillment
                  if (not.actionText) {
                    if (not.type === "water") {
                      handleAutoDrink(250);
                    } else if (not.type === "medication") {
                      // Find first untaken medication of the name and mark it as checked
                      const activeMed = meds.find((m) => not.body.includes(m.name) && !m.taken);
                      if (activeMed) toggleMed(activeMed.id);
                    }
                  }
                  // Remove from banner
                  setNotifications((prev) => prev.filter((item) => item.id !== not.id));
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔔</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {not.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{not.time}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 antialiased leading-relaxed">
                  {not.body}
                </p>
                {not.actionText && (
                  <button className="w-full text-center py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold transition-colors mt-1">
                    {not.actionText} (Toque para Agir)
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full bg-[#0d0d0f] rounded-[32px] overflow-hidden min-h-[640px] flex flex-col relative text-slate-300">
          
          {/* Internal Mobile Status Bar */}
          <div className="px-5 pt-3 pb-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-500 tracking-tight bg-[#0d0d0f]/90 border-b border-slate-900/60 backdrop-blur z-20">
            <span>{currentTime || "12:00"}</span>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>LTE</span>
              <span className="text-emerald-500">⬤</span>
            </div>
          </div>

          {/* Core App View (Scrollable layout) */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-4 pt-1 flex flex-col gap-4">
            
            {/* Health Hub Title */}
            <div className="flex items-center justify-between mt-3 px-1">
              <div>
                <span className="text-[10px] text-slate-500 tracking-wider font-mono font-bold uppercase">Vitalis App</span>
                <h1 className="text-xl font-semibold tracking-tight text-white italic">VITALISYNC</h1>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[10px] text-slate-400 font-medium font-mono uppercase">Smartwatch</span>
              </div>
            </div>

            {/* Smartwatch Real-time Heart Rate Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
              
              {/* Pulse animation bg */}
              <div className="absolute top-4 right-4 flex items-center justify-center">
                <span className="absolute w-7 h-7 bg-red-500/10 rounded-full animate-ping"></span>
                <Heart className={`w-5 h-5 text-rose-500 ${bpm > 0 ? "animate-pulse" : ""} fill-rose-500`} />
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                  Frequência Cardíaca
                </span>
                
                <div className="flex items-baseline">
                  <span className="text-5xl font-light text-white transition-all duration-300">
                    {bpm > 0 ? bpm : "---"}
                  </span>
                  <span className="text-sm font-medium text-rose-500 ml-1.5">BPM</span>
                </div>

                <div className="text-[10px] text-slate-500 font-medium mt-1.5 select-none flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-450" />
                  <span>Sinal do Sensor: {wearableState === "Aparelho Conectado" ? "Excelente" : "Ausente"}</span>
                </div>
              </div>

              {/* Real-time Scrolling ECG Wave graphic simulation */}
              <div className="h-12 w-full mt-3 overflow-hidden flex items-end gap-[2px]">
                {chartData.map((val, i) => {
                  const percent = Math.min(Math.max(((val - 45) / 120) * 100, 10), 95);
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-rose-500/20 hover:bg-rose-500/60 rounded-t transition-all duration-200"
                      style={{ height: `${percent}%` }}
                      title={`BPM: ${val}`}
                    />
                  );
                })}
              </div>

              {/* Heart Preset State Switcher right inside the simulator */}
              <div className="mt-3.5 pt-3 border-t border-slate-800">
                <span className="text-[9px] text-slate-500 font-bold tracking-wider uppercase block mb-1.5 font-mono">
                  Atividade do Monitor:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {HEART_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setActivePreset(p.name)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded-lg border text-left transition-all flex items-center justify-between ${
                        activePreset === p.name
                          ? "bg-rose-500 border-rose-600 text-white"
                          : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-[8px] opacity-75 font-mono">
                        {p.range[0]}-{p.range[1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cyclical Hydration Hydrated Alarm Wave */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col">
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2 block">Hidratação</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-light text-white">
                      {waterIntake >= 1000 ? `${(waterIntake / 1000).toFixed(1)}L` : `${waterIntake}ml`}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ 2.5L</span>
                  </div>
                </div>
                <Droplet className="w-5 h-5 text-indigo-500 animate-bounce" />
              </div>

              {/* Progress liquid wave bar */}
              <div className="w-full bg-slate-950 h-5 rounded-full overflow-hidden relative border border-slate-850 flex items-center justify-center my-1.5">
                <div
                  className="bg-indigo-600 h-full absolute left-0 bottom-0 top-0 transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min((waterIntake / waterGoal) * 100, 100)}%` }}
                />
                
                {/* Micro waveform overlay glassmorphism */}
                <div className="w-full h-full absolute inset-0 bg-gradient-to-t from-indigo-600/20 to-transparent animate-wave"></div>
                
                <span className="z-10 text-[9px] font-bold text-slate-200">
                  {Math.round((waterIntake / waterGoal) * 100)}% Consumido
                </span>
              </div>

              {/* Logging and reminder buttons */}
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => handleAddWater(150)}
                  className="flex-1 py-1.5 bg-slate-800/40 hover:bg-slate-850 text-indigo-400 border border-slate-755 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center"
                >
                  +150ml
                </button>
                <button
                  onClick={() => handleAddWater(250)}
                  className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-550/20 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center"
                >
                  +250ml
                </button>
                <button
                  onClick={() => handleAddWater(500)}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center justify-center shadow-sm"
                >
                  +500ml
                </button>
              </div>

              {/* Hydration alert sim trigger */}
              <button
                type="button"
                onClick={triggerWaterReminderSim}
                className="mt-3 py-1.5 w-full border border-indigo-500/20 border-dashed text-indigo-400 hover:bg-indigo-950/20 rounded-lg text-[10px] font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Simular Lembrete de Água Push</span>
              </button>
            </div>

            {/* Medication Reminders Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Remédios do Dia</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded-md">
                  {meds.filter(m => !m.taken).length} Pendentes
                </span>
              </div>

              {/* Med alarm list */}
              <div className="flex flex-col gap-2">
                {meds.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">Nenhum remédio cadastrado no momento.</p>
                ) : (
                  meds.map((med) => (
                    <div
                      key={med.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        med.taken
                          ? "bg-slate-950/40 border-slate-900 opacity-60"
                          : "bg-amber-500/5 border-amber-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMed(med.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            med.taken
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : "border-slate-700 bg-slate-950 text-slate-300"
                          }`}
                        >
                          {med.taken && <Check className="w-3 h-3 text-emerald-500" />}
                        </button>
                        <div className="text-left">
                          <p className={`text-xs font-bold leading-tight ${med.taken ? "line-through text-slate-500" : "text-slate-200"}`}>
                            {med.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {med.dosage} · <span className="font-semibold text-amber-500 tracking-wide font-mono">{med.time}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => triggerMedAlarmSim(med)}
                          title="Simular Alarme de Remédio"
                          className="p-1 text-amber-500 hover:bg-slate-800 rounded transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMed(med.id)}
                          title="Remover"
                          className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Med Inline Form */}
              <form onSubmit={handleAddMed} className="p-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 flex flex-col gap-2">
                <span className="text-[9px] font-bold text-slate-550 tracking-wide uppercase font-mono">Cadastrar Novo Remédio:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vitamina D"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] text-white outline-none font-medium focus:border-amber-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Dosagem (ex: 1 cápsula)"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] text-white outline-none font-medium focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="time"
                    required
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] text-white outline-none font-mono font-semibold focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar Alarme</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Food logs & Nutritional targets */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Registro de Alimentação</span>
                <div className="text-[10px] font-mono font-bold text-slate-300">
                  {totalCalories} / {dailyCalorieGoal} kcal
                </div>
              </div>

              {/* Progress gauge */}
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((totalCalories / dailyCalorieGoal) * 100, 100)}%` }}
                />
              </div>

              {/* List added logs */}
              <div className="flex flex-col gap-1.5">
                {foodLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-950/30 border border-slate-850">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                          {log.mealType}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                        {log.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold font-mono text-slate-300">
                        {log.calories} kcal
                      </span>
                      <button
                        onClick={() => handleDeleteFood(log.id, log.calories, log.mealType)}
                        className="text-slate-555 hover:text-rose-450 transition-colors cursor-pointer"
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <form onSubmit={handleAddFood} className="p-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                  <span>Adicionar Comida:</span>
                  <div className="flex gap-1.5 font-sans">
                    {(["Café", "Almoço", "Jantar", "Lanche"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFoodType(type)}
                        className={`px-1.5 py-0.5 rounded text-[8px] transition-all cursor-pointer ${
                          foodType === type
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-705"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maçã ou salada"
                    value={foodDesc}
                    onChange={(e) => setFoodDesc(e.target.value)}
                    className="flex-1 px-2 py-1 bg-slate-950 border border-slate-805 rounded text-[10px] text-white outline-none font-medium focus:border-emerald-500"
                  />
                  <input
                    type="number"
                    max="1505"
                    placeholder="Kcal"
                    value={foodCalories}
                    onChange={(e) => setFoodCalories(Number(e.target.value))}
                    className="w-16 px-2 py-1 bg-slate-950 border border-slate-805 rounded text-[10px] text-white outline-none font-mono font-semibold focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded transition-all cursor-pointer"
                  >
                    Log
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Simulated App Navigation bar at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-11 bg-[#0d0d0f]/95 backdrop-blur border-t border-slate-900/80 flex items-center justify-around text-slate-500 z-10 px-6">
            <button className="text-rose-500 flex flex-col items-center cursor-pointer">
              <Activity className="w-4 h-4" />
              <span className="text-[7.5px] font-bold mt-0.5">Métricas</span>
            </button>
            <button className="hover:text-indigo-400 transition-colors flex flex-col items-center cursor-pointer" onClick={() => handleAddWater(250)}>
              <Droplet className="w-4 h-4" />
              <span className="text-[7.5px] font-medium mt-0.5">Beber Água</span>
            </button>
            <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center -translate-y-2 border-2 border-[#0d0d0f] shadow-md cursor-pointer">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <button className="hover:text-indigo-400 transition-colors flex flex-col items-center cursor-pointer">
              <Coffee className="w-4 h-4" />
              <span className="text-[7.5px] font-medium mt-0.5">Alimentar</span>
            </button>
            <button className="hover:text-emerald-400 transition-colors flex flex-col items-center cursor-pointer" onClick={() => triggerWaterReminderSim()}>
              <Bell className="w-4 h-4" />
              <span className="text-[7.5px] font-medium mt-0.5">Notificar</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
