/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { SceneOptions } from "../types";

const IDENTITY_AND_REALISM_RULES = `
**HYPER-REALISM & DERMATOLOGICAL FIDELITY PROTOCOL**

1.  **IDENTITY LOCK:** Preserve facial structure, moles, scars, and bone structure.
2.  **SKIN BIOLOGY:** Render individual pores, fine lines, and natural skin oils. ABSOLUTELY NO "beauty filters" or smoothing.
3.  **PHOTOGRAPHIC QUALITY:** Mimic 85mm portrait lens. Apply subtle organic film grain. Use subsurface scattering for skin glow.
`;

const fileToPart = async (file: File) => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    return { inlineData: { mimeType: mimeMatch![1], data: arr[1] } };
};

const handleApiResponse = (response: GenerateContentResponse): string => {
    if (response.promptFeedback?.blockReason) throw new Error(`Bloqueio: ${response.promptFeedback.blockReason}`);
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error("Resposta inválida da IA.");
};

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateModelImage = async (userImage: File): Promise<string> => {
    const ai = getAiClient();
    const userPart = await fileToPart(userImage);
    const prompt = `${IDENTITY_AND_REALISM_RULES}\n**TASK:** Transform subject into a Neutral Studio Model. White background.`;
    const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [userPart, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    return handleApiResponse(res);
};

export const generateVirtualTryOnImage = async (modelUrl: string, garment: File, color?: string): Promise<string> => {
    const ai = getAiClient();
    const modelData = modelUrl.split(',')[1];
    const modelPart = { inlineData: { mimeType: "image/png", data: modelData } };
    const garmentPart = await fileToPart(garment);
    const colorInstr = color ? `\n**COLOR OVERRIDE:** Change garment to ${color}.` : "";
    const prompt = `${IDENTITY_AND_REALISM_RULES}\n**TASK:** Virtual Try-On. Fit garment to model body perfectly. ${colorInstr}`;
    const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [modelPart, garmentPart, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    return handleApiResponse(res);
};

export const generatePoseVariation = async (imageUrl: string, pose: string): Promise<string> => {
    const ai = getAiClient();
    const data = imageUrl.split(',')[1];
    const part = { inlineData: { mimeType: "image/png", data } };
    const prompt = `${IDENTITY_AND_REALISM_RULES}\n**POSE TASK:** Regenerate same person in pose: "${pose}".`;
    const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [part, { text: prompt }] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    return handleApiResponse(res);
};
