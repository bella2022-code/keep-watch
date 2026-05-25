/**
 * Theme system · hand-curated color palettes
 *
 * Each theme is an intentional combination of contrasting/harmonious
 * colors — like Pokémon Red/Blue versions: same elements, completely
 * different feel. Themes change actual rendering colors (Mouse body,
 * scene backgrounds) — not overlay tints.
 *
 * If you want a mood overlay (warm/cool/sepia tint over everything),
 * use the Background section instead — those are atmospheric overlays.
 */

import { useSettingsStore } from '../store/settingsStore';
import type { Theme } from '../store/settingsStore';

export type { Theme };

export interface ThemePalette {
  // Mouse character
  mouseBody: string;
  mouseBelly: string;
  mouseBack: string;
  // Mouse Cage
  cageWall: string;
  cageWallShadow: string;
  cageFloor: string;
  cageBox: string;
  cageBoxTop: string;
  cageBoxSeam: string;
  // Fish Tank
  tankWaterTop: string;
  tankWaterBottom: string;
  tankSand: string;
  tankSandShadow: string;
  // Astronaut Space
  spaceCabin: string;
  spaceFloor: string;
  spaceFloorShadow: string;
  // Officer Room
  roomWall: string;
  roomFloor: string;
  roomSeam: string;
}

const THEMES: Record<Theme, ThemePalette> = {
  // ========================================================================
  // CLASSIC · the original — warm wood + cream mouse
  // ========================================================================
  classic: {
    mouseBody: '#F4EFE6',
    mouseBelly: '#EADCCD',
    mouseBack: 'rgba(122, 116, 128, 0.18)',
    cageWall: '#6B4528',
    cageWallShadow: '#5A3920',
    cageFloor: '#8B5E3C',
    cageBox: '#A07853',
    cageBoxTop: '#7D5A3D',
    cageBoxSeam: '#8B6A48',
    tankWaterTop: '#7AAFBF',
    tankWaterBottom: '#3F6C7A',
    tankSand: '#C7AC7F',
    tankSandShadow: '#A88B5C',
    spaceCabin: '#1B2233',
    spaceFloor: '#262C3D',
    spaceFloorShadow: '#0E121C',
    roomWall: '#F4EFE6',
    roomFloor: '#A89478',
    roomSeam: '#7D5A3D',
  },

  // ========================================================================
  // CHEESE & SKY · yellow cheese mouse on blue sky walls
  // ========================================================================
  cheese_sky: {
    mouseBody: '#F4D86C',           // bright cheese yellow
    mouseBelly: '#E0B840',
    mouseBack: 'rgba(180, 130, 30, 0.22)',
    cageWall: '#5B9BD5',            // sky blue wall
    cageWallShadow: '#3D7DB8',
    cageFloor: '#F4F0D8',           // cream floor (cloud)
    cageBox: '#A8D0F0',             // light blue cardboard
    cageBoxTop: '#6FA8DC',
    cageBoxSeam: '#88BDE8',
    tankWaterTop: '#F4D86C',        // golden water
    tankWaterBottom: '#A88030',
    tankSand: '#3D7DB8',            // BLUE sand for contrast
    tankSandShadow: '#2D5F94',
    spaceCabin: '#2A4A7E',          // navy blue
    spaceFloor: '#1F3860',
    spaceFloorShadow: '#10203F',
    roomWall: '#B8D8F0',            // sky walls
    roomFloor: '#F4D86C',           // golden floor
    roomSeam: '#A88030',
  },

  // ========================================================================
  // MINT CHOCO · green mint mouse on chocolate brown
  // ========================================================================
  mint_choco: {
    mouseBody: '#B8E0C8',           // mint green mouse
    mouseBelly: '#8FC8A5',
    mouseBack: 'rgba(50, 90, 60, 0.22)',
    cageWall: '#3A2018',            // dark chocolate wall
    cageWallShadow: '#221008',
    cageFloor: '#5C3520',           // chocolate floor
    cageBox: '#7A4530',             // milk chocolate box
    cageBoxTop: '#4A2818',
    cageBoxSeam: '#6B3C28',
    tankWaterTop: '#8AD0AA',        // mint water
    tankWaterBottom: '#4A8060',
    tankSand: '#3A2018',            // chocolate "sand"
    tankSandShadow: '#221008',
    spaceCabin: '#1F1208',          // very dark choco
    spaceFloor: '#2D1810',
    spaceFloorShadow: '#0F0804',
    roomWall: '#E8D8C0',            // cream walls (vanilla)
    roomFloor: '#5C3520',           // choco floor
    roomSeam: '#3A2018',
  },

  // ========================================================================
  // SAKURA · pink mouse in cherry blossom world
  // ========================================================================
  sakura: {
    mouseBody: '#F8C8D8',           // sakura pink mouse
    mouseBelly: '#E89BAA',
    mouseBack: 'rgba(160, 80, 100, 0.20)',
    cageWall: '#A86878',            // dusty rose wall
    cageWallShadow: '#854F5C',
    cageFloor: '#E0B0BC',           // pale pink floor
    cageBox: '#D8909A',             // pink cardboard
    cageBoxTop: '#B07080',
    cageBoxSeam: '#C8808E',
    tankWaterTop: '#F4D8E0',        // cherry blossom water
    tankWaterBottom: '#C880A0',
    tankSand: '#F8E8D8',            // cream sand
    tankSandShadow: '#D4BDA8',
    spaceCabin: '#4A1F30',          // dark cherry
    spaceFloor: '#5F2A40',
    spaceFloorShadow: '#2A0F1A',
    roomWall: '#F8E8E8',            // pale pink walls
    roomFloor: '#E0B0BC',           // pink floor
    roomSeam: '#A86878',
  },
};

export function getCurrentPalette(): ThemePalette {
  const t = useSettingsStore.getState().theme;
  return THEMES[t] || THEMES.classic;
}

export function getPalette(theme: Theme): ThemePalette {
  return THEMES[theme] || THEMES.classic;
}
