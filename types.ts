/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface WardrobeItem {
  id: string;
  name: string;
  url: string;
}

export interface OutfitLayer {
  garment: WardrobeItem | null; // null representa a camada base (modelo)
  poseImages: Record<string, string>; // Mapeia instrução de pose para URL da imagem
  color?: string; // Cor personalizada aplicada à peça
}

export interface SceneOptions {
  replaceSubject: boolean;
  poseHint?: string;
  expressionHint?: string;
}
