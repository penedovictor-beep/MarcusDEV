import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI reference to prevent crashes on startups with missing keys
let aiInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Healthy state endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Prompt generator assistant using Gemini
app.post("/api/generate-prompt", async (req, res): Promise<any> => {
  const {
    platform = "iOS e Android",
    framework = "Expo (React Native Starter)",
    watchApi = "HealthKit (iOS) e Google Fit (Android)",
    notificationApi = "Notifee + Firebase Push Notifications",
    designFlavor = "Clean, Minimalista, Altamente Responsivo",
    extraRequirements = "",
  } = req.body;

  try {
    const ai = getGenAI();
    const systemPrompt = `Você é um Engenheiro de Software Mobile e Arquiteto de Soluções especialista em React Native e Wearables.
Seu objetivo é gerar instruções detalhadas, arquiteturas de projeto estruturadas e PROMPTS de engenharia de software de alta precisão que o usuário possa copiar e utilizar em ferramentas de desenvolvimento (ou outros chats de IA) para construir o aplicativo completo.

Retorne um objeto JSON bem formatado contendo os seguintes campos obrigatórios:
1. "overview": Uma visão geral do projeto baseada nas escolhas do usuário.
2. "perfectPrompt": Um prompt de IA extremamente detalhado e otimizado (no formato texto que o usuário possa copiar diretamente) explicando o que o desenvolvedor quer criar, para que outra inteligência de IA crie o código do app perfeitamente.
3. "architecture": Um resumo estruturado de arquivos e pastas sugeridos para esse app React Native/Expo.
4. "nativeIntegrationTips": Dicas essenciais em português para integrar o smartwatch escolhido (${watchApi}) e lidar com permissões nativas ou Bluetooth BLE nas plataformas selecionadas (${platform}).
5. "snippet": Um trecho de código em TypeScript exemplificando a integração básica de monitoramento de batimento cardíaco ou as regras de push notification correspondentes.

Responda sempre em português do Brasil de forma limpa, técnica e inspiradora.`;

    const userPrompt = `Gere os prompts de IA de alta performance e arquitetura técnica para a seguinte configuração:
- Plataforma Alvo: ${platform}
- Framework Principal: ${framework}
- Integração de Smartwatch: ${watchApi}
- Sistema de Notificações / Lembretes: ${notificationApi}
- Estilo e Design: ${designFlavor}
- Requisitos Adicionais do Usuário: ${extraRequirements || "Nenhum adicional"}

O aplicativo precisa exibir batimentos cardíacos simulados ou reais do smartwatch, alertar para beber água ciclicamente, lembrar de se alimentar nos horários corretos, e emitir alertas/notificações push confiáveis para lembrar de tomar remédios com verificação de conformidade.

Retorne no formato JSON exigido na instrução do sistema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Resposta vazia do modelo Gemini.");
    }

    const data = JSON.parse(responseText.trim());
    return res.json(data);

  } catch (error: any) {
    console.error("Erro ao gerar prompt com Gemini:", error);
    
    // Fallback gracioso para visualização offline / sem chave de API
    const fallbackData = {
      isFallback: true,
      overview: `Este é um modelo de arquitetura gerado localmente devido à falta da chave Gemini no ambiente de desenvolvimento.`,
      perfectPrompt: `Escreva um aplicativo React Native completo usando Expo para ${platform}. O aplicativo deve:
1. Conectar-se com Smartwatches via ${watchApi} para ler batimentos cardíacos em tempo real e mostrá-los em uma tela limpa e elegante de batimentos da saúde.
2. Implementar lembretes periódicos de hidratação (Beber Água) com controle de progresso e envio de notificações push via ${notificationApi}.
3. Agendar alarmes diários para ingestão de alimentos saudáveis (Alimentação).
4. Possuir um sistema inteligente de controle de medicamentos (Tomar Remédios) que lembre o usuário nos horários corretos de dosagem, aceitando confirmações de consumo.
5. Manter uma estética ${designFlavor}.`,
      architecture: `
App.tsx (Ponto de entrada nativo)
├── src/
│   ├── components/ (Custom UI Cards, ProgressBar, SimulatedWatch, CustomButton)
│   ├── screens/ (Dashboard, HeartRateTracker, WaterTracker, MedicationAlarms)
│   ├── services/ (SmartwatchService.ts, PushNotificationService.ts)
│   └── store/ (useHealthStore.ts - Estado integrado com persistência local)
`,
      nativeIntegrationTips: `
1. Permissões de Saúde: Certifique-se de configurar e declarar os esquemas plist / AndroidManifest para usar HealthKit ou Google Fit.
2. Conectividade Bluetooth: Use react-native-ble-plx se o smartwatch requerer uma conexão BLE personalizada sem APIs do sistema.
3. Notificações Confiáveis: Use Notifee para agendar lembretes locais repetitivos de hora em hora (água) mesmo quando o app estiver offline.
`,
      snippet: `// Trecho base de monitoramento e push local (React Native / Expo)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function HeartRateMonitor() {
  const [pulse, setPulse] = useState(72);

  useEffect(() => {
    // Simulação do sensor BLE / Smartwatch
    const interval = setInterval(() => {
      setPulse(p => p + Math.floor(Math.random() * 5) - 2);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Frequência Cardíaca</Text>
      <Text style={styles.pulse}>{pulse} BPM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, backgroundColor: '#ffffff', borderRadius: 16 },
  title: { fontSize: 16, color: '#64748b' },
  pulse: { fontSize: 32, fontWeight: 'bold', color: '#ef4444', marginTop: 8 }
});`
    };

    return res.json(fallbackData);
  }
});

// Chat assistant endpoint using Gemini to help build excellent prompts
app.post("/api/chat-assistant", async (req, res): Promise<any> => {
  const { message, history = [], currentConfig = {} } = req.body;

  if (!message) {
    return res.status(400).json({ error: "A mensagem é obrigatória." });
  }

  try {
    const ai = getGenAI();
    const systemInstruction = `Você é o Co-piloto de IA do VitaliSync, um tutor inteligente especializado em desenvolvimento de software mobile focado em saúde, IoT, wearables (smartwatches) e push notifications.
O usuário Victor Penedo está projetando um aplicativo de saúde (Vitalis App/VitaliSync) com as seguintes configurações atuais:
- Plataforma: ${currentConfig.platform || "iOS e Android"}
- Framework: ${currentConfig.framework || "Expo"}
- Smartwatch API: ${currentConfig.watchApi || "HealthKit/Google Fit"}
- Notificações: ${currentConfig.notificationApi || "Notifee"}
- Estilo: ${currentConfig.designFlavor || "Clean & Minimalista"}

Ajude o usuário nas suas dúvidas, explique conceitos técnicos de conexão BLE, como contornar restrições de consumo de bateria em segundo plano no Android, regras de negócios para cálculos de hidratação progressiva e como estruturar essas orientações no prompt perfeito de IA.
Mantenha suas respostas claras, ricas em dicas de codificação usando TypeScript e React Native, amigáveis e focadas no sucesso do desenvolvedor. Responda em português brasileiro.`;

    // Map history elements into Gemini API structure
    const formattedContents = history.map((item: any) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.text || item.content }],
    }));

    // Add current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      },
    });

    const reply = response.text || "Desculpe, não consegui formular uma resposta.";
    return res.json({ reply });

  } catch (error: any) {
    console.error("Erro no chat assistant com Gemini:", error);

    // Fallback response in Portuguese when API key is offline or errors out
    let reply = "";
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes("bluetooth") || lowerMsg.includes("wearable") || lowerMsg.includes("relogio") || lowerMsg.includes("relógio")) {
      reply = `**[Modo Simulação local]** Para integrar conexões Bluetooth e wearables no Expo, você deve usar a biblioteca \`react-native-ble-plx\` ou as APIs oficiais expostas pelas plataformas:
1. **iOS (CoreBluetooth / HealthKit):** Requer inserção de chaves específicas de privacidade no seu \`app.json\` do Expo (como \`NSBluetoothAlwaysUsageDescription\`).
2. **Android:** Necessita de permissões em tempo de execução para \`ACCESS_FINE_LOCATION\`, \`BLUETOOTH_CONNECT\` e \`BLUETOOTH_SCAN\` a partir da API 31+.
Gostaria que eu adaptasse o prompt perfeito para focar em suporte Bluetooth avançado de baixa energia (BLE)?`;
    } else if (lowerMsg.includes("notific") || lowerMsg.includes("push") || lowerMsg.includes("alarm")) {
      reply = `**[Modo Simulação local]** Excelente ponto! Em aplicativos de saúde de alta fidelidade para idosos ou remédios, alarmes locais baseados em cronômetros que resistam ao reinício do aparelho são vitais:
- No Android, use as APIs de **Notificações de Alarme Exatas (\`AndroidExactAlarms\`)** com Notifee, garantindo que o Android OS não mate a tarefa por otimização de bateria.
- No iOS, notificações agendadas são tratadas localmente pelo \`UNUserNotificationCenter\` com alta precisão sob agendamento cíclico diário.`;
    } else if (lowerMsg.includes("ia") || lowerMsg.includes("inteligência") || lowerMsg.includes("ajuda") || lowerMsg.includes("prompt")) {
      reply = `**[Modo Simulação local]** Para que sua IA construa o App com perfeição, você deve adicionar ao seu prompt instruções claras sobre persistência e gerenciamento de estados:
1. **Estilo arquitetal robusto:** Prefira separar serviços nativos (\`services/HealthKitService.ts\`, \`services/PushService.ts\`) de hooks visuais.
2. **Definições rígidas de Tipo:** Certifique-se de instruir a outra IA a gerar interfaces completas em TypeScript (\`types.ts\`) para modelagem de remédios, logs alimentares e medições de batimento cardíaco.`;
    } else {
      reply = `**[Modo Simulação local]** Olá! Entendi sua dúvida sobre o desenvolvimento do app VitaliSync.
Aqui estão 3 recomendações excelentes se você estiver usando **${currentConfig.framework || "Expo"}**:
1. **Foco em Hooks de Estado:** Mantenha um hook robusto para sincronizar as metas diárias de hidratação (como \`useWaterTracker\`).
2. **Integração Real-Time:** Planeje um serviço ou saga de escuta contínua de BPM (batimentos por minuto) simulados enquanto o sensor de smartwatch estiver conectado.
3. **Persistência Segura:** Armazene os logs de remédios e consumo de líquidos via \`expo-secure-store\` para melhor eficiência.

Como posso te ajudar a refinar o seu prompt ou código agora?`;
    }

    return res.json({ reply });
  }
});

// Configure Vite middleware or static serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running and listening at http://0.0.0.0:${PORT}`);
  });
}

setupVite();
