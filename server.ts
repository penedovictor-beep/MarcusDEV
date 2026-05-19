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
