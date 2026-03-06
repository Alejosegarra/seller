/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Settings, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Save,
  ChevronRight,
  Info,
  Star,
  Maximize2,
  Layers,
  Zap,
  FileText,
  MessageSquare,
  ArrowRightLeft,
  RefreshCw,
  Sparkles,
  Sun,
  Monitor,
  ShieldCheck,
  CloudUpload,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './lib/supabase';

// --- CONFIGURACIÓN INICIAL DEL CATÁLOGO ---
const INITIAL_CATALOGO = {
  "Monofocales Stock": {
    "materiales": [
      { "id": "ms1", "nombre": "Mineral de Stock", "precio": 12000, "indice": 1.52, "calidad": 2, "rangos": [{ esf: [4, -4], cil: 2 }], "beneficios": ["Resistente a rayas", "Claridad óptica natural"] },
      { "id": "ms2", "nombre": "Orgánico Stock", "precio": 15000, "indice": 1.50, "calidad": 2, "rangos": [{ esf: [4, -4], cil: 2 }], "beneficios": ["Liviano", "Económico", "Fácil de teñir"] },
      { "id": "ms3", "nombre": "Klear (1.56 + AR)", "precio": 22000, "indice": 1.56, "calidad": 3, "rangos": [{ esf: [6, -6], cil: 2 }], "beneficios": ["Estética mejorada", "Incluye Antirreflex", "Más delgado que 1.50"] },
      { "id": "ms4", "nombre": "Klear Blue Cut (1.56 + AR Blue)", "precio": 28000, "indice": 1.56, "calidad": 3, "rangos": [{ esf: [6, -6], cil: 2 }], "beneficios": ["Protección pantallas", "Filtro azul integrado", "Incluye AR"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "ms5", "nombre": "Policarbonato Stock", "precio": 25000, "indice": 1.59, "calidad": 3, "rangos": [{ esf: [4, -6], cil: 2 }], "beneficios": ["Ultra resistente", "Protección UV 100%", "Ideal para niños"], "ofreceBlue": true, "precioBlue": 8000 },
      { "id": "ms6", "nombre": "Poli Lite (Poli + AR)", "precio": 32000, "indice": 1.59, "calidad": 4, "rangos": [{ esf: [4, -6], cil: 2 }], "beneficios": ["Resistente + Antirreflex", "Seguridad y claridad"], "ofreceBlue": true, "precioBlue": 8000 },
      { "id": "ms7", "nombre": "Blue x Lite (1.6 + AR Blue)", "precio": 45000, "indice": 1.60, "calidad": 4, "rangos": [{ esf: [6, -8], cil: 2 }], "beneficios": ["Alto índice", "Protección Blue", "Estética superior"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "ms8", "nombre": "Transitions Stock (Gris)", "precio": 55000, "indice": 1.50, "calidad": 4, "rangos": [{ esf: [4, -4], cil: 2 }], "beneficios": ["Fotosensible", "Comodidad todo el día"] }
    ],
    "tratamientos": [
      { "id": "t1", "nombre": "Sin adicionales", "precio": 0 }
    ]
  },
  "Monofocales Lab": {
    "materiales": [
      { "id": "ml1", "nombre": "1.49 Org Bco", "precio": 18000, "indice": 1.49, "rangos": [{ esf: [6, -10], cil: 6 }], "beneficios": ["Laboratorio estándar"], "tratamientosPermitidos": ["tr1", "tr2"] },
      { "id": "ml2", "nombre": "1.50 Polarizado (G/V/M)", "precio": 42000, "indice": 1.50, "beneficios": ["Elimina reflejos", "Ideal conducción/pesca"], "tratamientosPermitidos": ["tr1"] },
      { "id": "ml3", "nombre": "1.50 Xperio (G/M)", "precio": 58000, "indice": 1.50, "beneficios": ["Polarizado premium Essilor"], "tratamientosPermitidos": ["tr1"] },
      { "id": "ml4", "nombre": "1.56 Bco Blue Cut", "precio": 35000, "indice": 1.56, "rangos": [{ esf: [6, -10], cil: 6 }], "beneficios": ["Protección digital lab"], "tratamientosPermitidos": ["tr1", "tr2", "tr5"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "ml5", "nombre": "Poli Tallado Digital", "precio": 48000, "indice": 1.59, "rangos": [{ esf: [6, -10], cil: 6 }], "beneficios": ["Visión HD personalizada"], "tratamientosPermitidos": ["tr1", "tr2", "tr3", "tr4", "tr5"], "ofreceBlue": true, "precioBlue": 12000 },
      { "id": "ml6", "nombre": "1.60 Bco Digital", "precio": 55000, "indice": 1.60, "rangos": [{ esf: [6, -10], cil: 6 }], "beneficios": ["Estética + Precisión"], "tratamientosPermitidos": ["tr1", "tr2", "tr3", "tr4", "tr5"], "ofreceBlue": true, "precioBlue": 15000 },
      { "id": "ml7", "nombre": "1.67 Blanco Lab", "precio": 75000, "indice": 1.67, "rangos": [{ esf: [8, -11], cil: 6 }], "beneficios": ["Muy delgado", "Ideal altas dioptrías"], "tratamientosPermitidos": ["tr1", "tr2", "tr3", "tr4", "tr5"], "ofreceBlue": true, "precioBlue": 18000 },
      { "id": "ml8", "nombre": "1.74 Tallado Digital", "precio": 120000, "indice": 1.74, "rangos": [{ esf: [18, -21], cil: 6 }], "beneficios": ["Máxima delgadez tecnológica"], "tratamientosPermitidos": ["tr1", "tr3", "tr4"] }
    ],
    "tratamientos": [
      { "id": "tr1", "nombre": "Sin AR", "precio": 0 },
      { "id": "tr2", "nombre": "Antirreflex Trio UV", "precio": 12000 },
      { "id": "tr3", "nombre": "Crizal Sapphire HR", "precio": 38000 },
      { "id": "tr4", "nombre": "Crizal Prevencia", "precio": 42000 },
      { "id": "tr5", "nombre": "Crizal Rock Blue UV", "precio": 35000 }
    ]
  },
  "Eyezen": {
    "materiales": [
      { "id": "ez1", "nombre": "Orma / Blue UV", "precio": 168000, "indice": 1.50, "beneficios": ["Relajación visual", "Filtro azul", "Ideal menores 40"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "ez2", "nombre": "Orma Transit Gris", "precio": 481600, "indice": 1.50, "beneficios": ["Relajación + Transitions"] },
      { "id": "ez3", "nombre": "Orma Transit 7 Colores", "precio": 548800, "indice": 1.50, "beneficios": ["Estilo + Relajación"] },
      { "id": "ez4", "nombre": "Airwear / Blue", "precio": 179200, "indice": 1.59, "beneficios": ["Liviano + Relajación"] },
      { "id": "ez5", "nombre": "Airw Transit Gris/Café", "precio": 537600, "indice": 1.59, "beneficios": ["Resistencia + Fotosensible"] },
      { "id": "ez6", "nombre": "Stylis Blue 1.67", "precio": 324800, "indice": 1.67, "beneficios": ["Delgado + Relajación"] },
      { "id": "ez7", "nombre": "Stylis Trans Gris/Café", "precio": 851200, "indice": 1.67, "beneficios": ["Máxima gama Eyezen"] }
    ],
    "tratamientos": [
      { "id": "t1", "nombre": "Incluido en precio", "precio": 0 }
    ]
  },
  "Ocupacionales": {
    "materiales": [
      { "id": "oc1", "nombre": "Kodak Ocupacional", "precio": 95000, "indice": 1.50, "beneficios": ["Cerca e Intermedio", "Ideal oficina/lectura"] },
      { "id": "oc2", "nombre": "Interview (Orgánico)", "precio": 78000, "indice": 1.50, "beneficios": ["Degresivo 0.80/1.30"] },
      { "id": "oc3", "nombre": "Interview (Poli)", "precio": 92000, "indice": 1.59, "beneficios": ["Resistente + Degresivo"] },
      { "id": "oc4", "nombre": "Digitime Varilux", "precio": 145000, "indice": 1.50, "beneficios": ["Digital premium", "Near/Mid selection"] },
      { "id": "oc5", "nombre": "Tablet 1.56 Blue Cut", "precio": 65000, "indice": 1.56, "beneficios": ["Económico Ocupacional"] }
    ],
    "tratamientos": [
      { "id": "t1", "nombre": "Sin adicionales", "precio": 0 },
      { "id": "t2", "nombre": "AR Trio UV", "precio": 12000 }
    ]
  },
  "Control Miopía": {
    "materiales": [
      { "id": "cm1", "nombre": "Mycon (Rodenstock) 1.50", "precio": 185000, "indice": 1.50, "rangos": [{ esf: [6, -10], cil: 6 }], "beneficios": ["Control progresión miopía"] },
      { "id": "cm2", "nombre": "Mycon (Rodenstock) 1.60", "precio": 225000, "indice": 1.60, "rangos": [{ esf: [6, -10], cil: 6 }], "beneficios": ["Control miopía + Delgado"] },
      { "id": "cm3", "nombre": "Myopilux Lite (Airwear)", "precio": 155000, "indice": 1.59, "beneficios": ["Especial para niños"] },
      { "id": "cm4", "nombre": "Myopilux Plus (Stylis)", "precio": 210000, "indice": 1.67, "beneficios": ["Máxima estética niños"] }
    ],
    "tratamientos": [
      { "id": "t1", "nombre": "Sin adicionales", "precio": 0 }
    ]
  },
  "Monofocales Rango Extendido": {
    "materiales": [
      { "id": "re1", "nombre": "Klear Blue C Rango Ext.", "precio": 38000, "indice": 1.56, "rangos": [{ esf: [0, -10], cil: 4 }], "beneficios": ["Altas miopías stock", "Protección Blue"] },
      { "id": "re2", "nombre": "1.6 Blue XLite AR Rango Ext.", "precio": 52000, "indice": 1.60, "rangos": [{ esf: [0, -10], cil: 4 }], "beneficios": ["Solo negativos", "Rango extendido"] },
      { "id": "re3", "nombre": "1.67 Blue X Lite AR Xtra Hard", "precio": 68000, "indice": 1.67, "rangos": [{ esf: [6, -15], cil: 4 }], "beneficios": ["Resistencia extrema", "Rango hasta -15.00"] }
    ],
    "tratamientos": [
      { "id": "t1", "nombre": "Incluido", "precio": 0 }
    ]
  },
  "Multifocales": {
    "materiales": [
      // VARILUX X DESIGN
      { "id": "vx1", "nombre": "Varilux X Design Orma Smart Blue", "precio": 350000, "indice": 1.50, "gama": "Premium", "tallado": "Digital Freeform", "campos": { lejos: 5, inter: 5, cerca: 5 }, "beneficios": ["Máxima libertad visual", "Tecnología Xtend", "Sin movimientos de cabeza"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "vx2", "nombre": "Varilux X Design Airwear Smart Blue", "precio": 385000, "indice": 1.59, "gama": "Premium", "tallado": "Digital Freeform", "campos": { lejos: 5, inter: 5, cerca: 5 }, "beneficios": ["Resistente y liviano", "Máximo confort"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "vx3", "nombre": "Varilux X Design Stylis 1.67 Smart Blue", "precio": 480000, "indice": 1.67, "gama": "Premium", "tallado": "Digital Freeform", "campos": { lejos: 5, inter: 5, cerca: 5 }, "beneficios": ["Estética ultra delgada", "Visión instantánea", "Máximo confort"], "incluyeBlue": true, "ofreceBlue": true },
      
      // VARILUX PHYSIO
      { "id": "vp1", "nombre": "Varilux Physio Orma Smart Blue", "precio": 280000, "indice": 1.50, "gama": "Alta", "tallado": "Digital W.A.V.E. 2", "campos": { lejos: 5, inter: 4, cerca: 5 }, "beneficios": ["Visión en alta resolución", "Contraste mejorado", "Excelente en baja luz"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "vp2", "nombre": "Varilux Physio Airwear Smart Blue", "precio": 310000, "indice": 1.59, "gama": "Alta", "tallado": "Digital W.A.V.E. 2", "campos": { lejos: 5, inter: 4, cerca: 5 }, "beneficios": ["Resistencia + Nitidez", "Ideal vida activa"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "vp3", "nombre": "Varilux Physio Stylis 1.67 Smart Blue", "precio": 395000, "indice": 1.67, "gama": "Alta", "tallado": "Digital W.A.V.E. 2", "campos": { lejos: 5, inter: 4, cerca: 5 }, "beneficios": ["Delgado y nítido"], "incluyeBlue": true, "ofreceBlue": true },
      
      // VARILUX COMFORT MAX
      { "id": "vc1", "nombre": "Varilux Comfort Max Orma Smart Blue", "precio": 220000, "indice": 1.50, "gama": "Media-Alta", "tallado": "Digital Comfort", "campos": { lejos: 4, inter: 4, cerca: 4 }, "beneficios": ["Flexibilidad postural", "Adaptación natural", "Visión relajada todo el día"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "vc2", "nombre": "Varilux Comfort Max Airwear Smart Blue", "precio": 255000, "indice": 1.59, "gama": "Media-Alta", "tallado": "Digital Comfort", "campos": { lejos: 4, inter: 4, cerca: 4 }, "beneficios": ["Protección y confort"], "incluyeBlue": true, "ofreceBlue": true },
      
      // KODAK
      { "id": "ko1", "nombre": "Kodak Unique DRO (Poli Blue)", "precio": 185000, "indice": 1.59, "gama": "Media", "tallado": "Digital Vision", "campos": { lejos: 4, inter: 3, cerca: 4 }, "beneficios": ["Tecnología DRO", "Visión periférica clara"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "ko2", "nombre": "Kodak Precise (Poli Blue)", "precio": 145000, "indice": 1.59, "gama": "Media", "tallado": "Digital Precise", "campos": { lejos: 4, inter: 3, cerca: 3 }, "beneficios": ["Visión natural", "Fácil adaptación"], "incluyeBlue": true, "ofreceBlue": true },
      
      // SILVER DIGITAL
      { "id": "sd1", "nombre": "Silver Digital Milling 1.56 Blue Cut", "precio": 125000, "indice": 1.56, "gama": "Económica Digital", "tallado": "Digital Milling", "campos": { lejos: 3, inter: 3, cerca: 3 }, "beneficios": ["Tallado digital preciso", "Garantía de adaptación", "Precio competitivo"], "incluyeBlue": true, "ofreceBlue": true },
      { "id": "sd2", "nombre": "Silver Digital Milling 1.67 Blue Cut", "precio": 175000, "indice": 1.67, "gama": "Económica Digital", "tallado": "Digital Milling", "campos": { lejos: 3, inter: 3, cerca: 3 }, "beneficios": ["Delgado y digital"], "incluyeBlue": true, "ofreceBlue": true },
      
      // ESPACE PLUS
      { "id": "ep1", "nombre": "Espace Plus Policarbonato", "precio": 95000, "indice": 1.59, "gama": "Entrada", "tallado": "Tradicional", "campos": { lejos: 3, inter: 2, cerca: 3 }, "beneficios": ["Marca Essilor", "Calidad garantizada", "Económico"] },
      { "id": "ep2", "nombre": "Espace Plus Orgánico", "precio": 75000, "indice": 1.50, "gama": "Entrada", "tallado": "Tradicional", "campos": { lejos: 3, inter: 2, cerca: 3 }, "beneficios": ["Opción más económica"] }
    ],
    "tratamientos": [
      { "id": "t1", "nombre": "Sin adicionales", "precio": 0 },
      { "id": "t2", "nombre": "Crizal Sapphire HR", "precio": 45000 },
      { "id": "t3", "nombre": "Crizal Prevencia", "precio": 48000 }
    ]
  },
  "Otros / Servicios": {
    "materiales": [
      { "id": "ot1", "nombre": "RayBan G15 B6", "precio": 45000, "indice": 1.52, "beneficios": ["Cristal original G15"] },
      { "id": "ot2", "nombre": "RayBan Polarizado", "precio": 65000, "indice": 1.52, "beneficios": ["Máxima protección solar"] },
      { "id": "ot3", "nombre": "Teñido Uniforme", "precio": 8000, "indice": 1.50, "beneficios": ["Color a elección"] },
      { "id": "ot4", "nombre": "Teñido Degradee", "precio": 12000, "indice": 1.50, "beneficios": ["Estética degradee"] },
      { "id": "ot5", "nombre": "Filtro Especial (Amarillo/Rojo)", "precio": 15000, "indice": 1.50, "beneficios": ["Uso específico"] }
    ],
    "tratamientos": [
      { "id": "tr1", "nombre": "Sin adicionales", "precio": 0 },
      { "id": "tr2", "nombre": "Sacar AR y Rehacer", "precio": 18000 },
      { "id": "tr3", "nombre": "Prisma por ojo", "precio": 5000 },
      { "id": "tr4", "nombre": "Pulido de bordes", "precio": 3500 },
      { "id": "tr5", "nombre": "Facetado Orgánico", "precio": 6000 }
    ]
  }
};

// --- DICCIONARIO DE BENEFICIOS PARA TOOLTIPS ---
const BENEFIT_DESCRIPTIONS: Record<string, string> = {
  "Resistente a rayas": "Capa endurecida que protege la superficie del lente contra el desgaste diario.",
  "Claridad óptica natural": "Material con alto número de Abbe que minimiza las aberraciones cromáticas.",
  "Liviano": "Reduce el peso total de los anteojos, ideal para el uso prolongado.",
  "Económico": "Opción accesible con buena relación costo-beneficio.",
  "Fácil de teñir": "Permite una coloración uniforme para lentes de sol personalizados.",
  "Estética mejorada": "Lentes más planos y delgados que mejoran la apariencia del rostro.",
  "Incluye Antirreflex": "Elimina reflejos molestos y mejora la transparencia del lente.",
  "Más delgado que 1.50": "Reducción de espesor notable comparado con el material estándar.",
  "Protección pantallas": "Filtra la luz azul-violeta nociva emitida por dispositivos digitales.",
  "Filtro azul integrado": "El material mismo bloquea la luz azul sin necesidad de recubrimientos adicionales.",
  "Ultra resistente": "Material prácticamente irrompible, recomendado para seguridad y deportes.",
  "Protección UV 100%": "Bloquea el 100% de los rayos UVA y UVB para proteger la salud ocular.",
  "Ideal para niños": "Combina ligereza con máxima resistencia a impactos.",
  "Seguridad y claridad": "Protección ocular superior con excelente calidad visual.",
  "Alto índice": "Material de alta densidad que permite lentes mucho más delgados.",
  "Estética superior": "Máxima delgadez y ligereza para graduaciones altas.",
  "Fotosensible": "Se oscurece con el sol y se aclara en interiores automáticamente.",
  "Comodidad todo el día": "Adaptación visual constante a diferentes condiciones de luz.",
  "Laboratorio estándar": "Procesado con precisión en laboratorios ópticos tradicionales.",
  "Elimina reflejos": "Bloquea el resplandor de superficies horizontales como agua o asfalto.",
  "Ideal conducción/pesca": "Mejora el contraste y la seguridad en actividades al aire libre.",
  "Polarizado premium Essilor": "Tecnología Xperio para colores más vibrantes y protección total.",
  "Protección digital lab": "Tallado digital con optimización para el uso de dispositivos.",
  "Visión HD personalizada": "Lentes tallados punto por punto para una nitidez superior.",
  "Estética + Precisión": "Combinación de delgadez y tecnología digital avanzada.",
  "Muy delgado": "Reducción significativa de espesor para miopías o hipermetropías altas.",
  "Ideal altas dioptrías": "Recomendado para graduaciones donde el espesor es una preocupación crítica.",
  "Máxima delgadez tecnológica": "El material más delgado disponible en el mercado óptico.",
  "Relajación visual": "Tecnología que reduce el esfuerzo ocular al leer o usar el celular.",
  "Filtro azul": "Protección contra la fatiga visual digital.",
  "Ideal menores 40": "Diseñado para prevenir el cansancio visual en adultos jóvenes.",
  "Resistencia + Fotosensible": "Durabilidad extrema con tecnología Transitions.",
  "Delgado + Relajación": "Estética y confort visual en un solo lente.",
  "Máxima gama Eyezen": "Lo último en tecnología para la vida digital.",
  "Cerca e Intermedio": "Optimizado para distancias de oficina y lectura.",
  "Ideal oficina/lectura": "Amplio campo visual para tareas de escritorio.",
  "Degresivo 0.80/1.30": "Variación de potencia suave para diferentes distancias de cerca.",
  "Digital premium": "Máxima personalización para el entorno de trabajo.",
  "Económico Ocupacional": "Solución accesible para presbicia en el trabajo.",
  "Control progresión miopía": "Diseño especial que ayuda a frenar el avance de la miopía en niños.",
  "Control miopía + Delgado": "Eficacia clínica con estética mejorada.",
  "Especial para niños": "Adaptado a la fisionomía y actividades infantiles.",
  "Máxima estética niños": "Lentes delgados y resistentes para los más pequeños.",
  "Altas miopías stock": "Disponibilidad inmediata para graduaciones elevadas.",
  "Solo negativos": "Diseñado específicamente para la corrección de miopía.",
  "Rango extendido": "Cubre graduaciones que normalmente requieren laboratorio.",
  "Resistencia extrema": "Máxima durabilidad para usuarios exigentes.",
  "Rango hasta -15.00": "Solución para miopías muy elevadas.",
  "Máxima libertad visual": "Visión fluida en todas las distancias sin restricciones.",
  "Tecnología Xtend": "Optimización de la visión al alcance de los brazos.",
  "Sin movimientos de cabeza": "Campos visuales tan amplios que no requieren buscar el foco.",
  "Resistente y liviano": "Material Airwear para un uso confortable y seguro.",
  "Máximo confort": "Adaptación inmediata y visión sin esfuerzo.",
  "Estética ultra delgada": "Lentes invisibles incluso en graduaciones altas.",
  "Visión instantánea": "Enfoque rápido al cambiar de distancia.",
  "Visión en alta resolución": "Mayor contraste y nitidez en cualquier condición de luz.",
  "Contraste mejorado": "Colores más vivos y detalles más definidos.",
  "Excelente en baja luz": "Mejor desempeño visual al atardecer o en interiores oscuros.",
  "Ideal vida activa": "Resistencia a impactos para deportistas y personas dinámicas.",
  "Delgado y nítido": "Claridad visual con espesor reducido.",
  "Flexibilidad postural": "Permite ver bien en posturas naturales y relajadas.",
  "Adaptación natural": "Curva de aprendizaje mínima para nuevos usuarios.",
  "Visión relajada todo el día": "Reduce la fatiga al final de la jornada.",
  "Protección y confort": "Cuidado ocular con la garantía Varilux.",
  "Tecnología DRO": "Digital Ray-Path Optimization para una visión periférica superior.",
  "Visión periférica clara": "Minimiza las distorsiones laterales típicas de los multifocales.",
  "Visión natural": "Transiciones suaves entre lejos, intermedio y cerca.",
  "Fácil adaptación": "Diseño equilibrado para una transición sencilla al multifocal.",
  "Tallado digital preciso": "Precisión micrométrica en la superficie del lente.",
  "Garantía de adaptación": "Respaldo total para asegurar tu comodidad visual.",
  "Precio competitivo": "Tecnología digital al alcance de todos.",
  "Delgado y digital": "Estética y tecnología a un precio accesible.",
  "Marca Essilor": "Calidad respaldada por el líder mundial en lentes.",
  "Calidad garantizada": "Durabilidad y desempeño óptico confiable.",
  "Opción más económica": "La puerta de entrada al mundo de los multifocales.",
  "Cristal original G15": "El clásico color verde de Ray-Ban en cristal mineral.",
  "Máxima protección solar": "Lentes polarizados para una visión sin reflejos al sol.",
  "Color a elección": "Personaliza tus lentes con el tono que prefieras.",
  "Estética degradee": "Tinte gradual que combina estilo y funcionalidad.",
  "Incluye AR": "Viene con tratamiento antirreflejante de serie para una visión más nítida.",
  "Resistente + Antirreflex": "Combina la dureza del material con la eliminación de reflejos.",
  "Protección Blue": "Bloquea la luz azul nociva de dispositivos electrónicos.",
  "Relajación + Transitions": "Lentes que descansan la vista y se adaptan a la luz solar.",
  "Estilo + Relajación": "Combina colores de moda con tecnología de descanso visual.",
  "Liviano + Relajación": "Máximo confort por su bajo peso y tecnología anti-fatiga.",
  "Resistente + Degresivo": "Material duradero con diseño para distancias de oficina.",
  "Near/Mid selection": "Optimización específica para visión de cerca e intermedia.",
  "Uso específico": "Filtros terapéuticos o para actividades deportivas concretas."
};

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- COMPONENTES EXTERNOS ---
const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
};

const renderStars = (val) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={10} 
        className={i < val ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
      />
    ))}
  </div>
);

const renderThicknessIndex = (indice) => {
  const level = indice >= 1.74 ? 5 : indice >= 1.67 ? 4 : indice >= 1.6 ? 3 : indice >= 1.56 ? 2 : 1;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 w-6 rounded-full ${i < level ? "bg-indigo-500" : "bg-slate-200"}`} 
          />
        ))}
      </div>
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
        Índice de Delgadez: {level}/5
      </span>
    </div>
  );
};

const InputReceta = ({ label, ojo, campo, value, onChange, step = "0.25", min, max }: { label: string, ojo: string, campo: string, value: any, onChange: (ojo: string, campo: string, val: string) => void, step?: string, min?: string, max?: string }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (campo === 'eje') {
      let num = parseInt(val);
      if (num < 0) val = "0";
      if (num > 180) val = "180";
    }
    onChange(ojo, campo, val);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</label>
      <input 
        type="number" 
        step={step}
        min={min}
        max={max}
        value={value === null || value === undefined || isNaN(value) ? "" : value}
        onChange={handleChange}
        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
      />
    </div>
  );
};

export default function App() {
  // --- ESTADOS ---
  const [catalogo, setCatalogo] = useState(INITIAL_CATALOGO);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [presupuestos, setPresupuestos] = useState<any[]>([]);

  // --- EFECTOS ---
  const fetchPresupuestos = async () => {
    try {
      const { data, error } = await supabase
        .from('presupuestos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      console.log("Presupuestos recuperados:", data?.length || 0);
      setPresupuestos(data || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  useEffect(() => {
    fetchCatalogo();
    fetchPresupuestos();
    fetchSucursales();
  }, []);

  const fetchSucursales = async () => {
    try {
      const { data, error } = await supabase
        .from('sucursales')
        .select('*')
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      if (data && data.length > 0) {
        setSucursales(data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const fetchCatalogo = async () => {
    setIsSyncing(true);
    try {
      const { data: categories, error: catError } = await supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true });

      if (catError) throw catError;

      const newCatalogo: any = {};

      for (const cat of categories) {
        const { data: materials, error: matError } = await supabase
          .from('materiales')
          .select('*')
          .eq('categoria_nombre', cat.nombre);
        
        if (matError) throw matError;

        const { data: treatments, error: tratError } = await supabase
          .from('tratamientos')
          .select('*')
          .eq('categoria_nombre', cat.nombre);

        if (tratError) throw tratError;

        newCatalogo[cat.nombre] = {
          materiales: materials.map(m => ({
            ...m,
            id: m.id,
            rangos: m.rangos || [],
            beneficios: m.beneficios || [],
            sinGarantia: m.sin_garantia,
            incluyeBlue: m.incluye_blue,
            ofreceBlue: m.ofrece_blue,
            precioBlue: m.precio_blue,
            tratamientosPermitidos: m.tratamientos_permitidos || []
          })),
          tratamientos: treatments.map(t => ({
            ...t,
            id: t.id
          }))
        };
      }

      if (Object.keys(newCatalogo).length > 0) {
        setCatalogo(newCatalogo);
        // Set default selection from cloud data
        const firstCat = Object.keys(newCatalogo)[0];
        if (newCatalogo[firstCat]?.materiales.length > 0) {
          setCategoriaSel(firstCat);
          setMaterialSelId(newCatalogo[firstCat].materiales[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching catalog:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const savePresupuesto = async (sucursalOverride?: any) => {
    const sucursal = sucursalOverride || sucursalSel;
    if (!sucursal) {
      alert("Por favor, selecciona una sucursal antes de guardar el presupuesto.");
      setShowSucursalModal(true);
      return;
    }

    setIsSyncing(true);
    try {
      const { error } = await supabase.from('presupuestos').insert([{
        sucursal_id: sucursal.id,
        sucursal_nombre: sucursal.nombre,
        cliente_nombre: cliente.nombre,
        cliente_contacto: cliente.contacto,
        vendedor: vendedor,
        categoria_nombre: categoriaSel,
        material_nombre: materialActual?.nombre,
        tratamiento_nombre: tratamientoActual?.nombre,
        costo_armazon: costoArmazon,
        detalle_armazon: detalleArmazon,
        descuento_valor: descuento,
        descuento_tipo: tipoDescuento,
        descuento_condicion: condicionDescuento,
        precio_final: precioFinal,
        receta: receta
      }]);

      if (error) throw error;
      fetchPresupuestos(); // Actualizar la lista local
      return true;
    } catch (error) {
      console.error("Error saving budget:", error);
      // alert("Error al guardar el presupuesto.");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const Logo = () => (
    <div className="flex items-center gap-2">
      <div className="bg-indigo-600 p-1.5 rounded-lg">
        <Eye className="text-white" size={24} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter text-slate-800">SCHELLHAS</span>
        <span className="text-[8px] font-bold tracking-[0.2em] text-indigo-600 uppercase">Óptica & Contactología</span>
      </div>
    </div>
  );

  const saveCatalogo = async () => {
    setIsSyncing(true);
    try {
      // 1. Clear existing materials, treatments and sucursales
      await supabase.from('materiales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('tratamientos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('sucursales').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // 3. Insert new data
      // Sucursales
      const sucsToInsert = sucursales.map(s => {
        const { id, created_at, ...rest } = s as any;
        return rest;
      });
      if (sucsToInsert.length > 0) {
        const { error: sErr } = await supabase.from('sucursales').insert(sucsToInsert);
        if (sErr) throw sErr;
      }

      for (const [catName, data] of Object.entries(catalogo)) {
        const materialsToInsert = (data as any).materiales.map(m => {
          const { id, created_at, sinGarantia, incluyeBlue, ofreceBlue, precioBlue, tratamientosPermitidos, ...rest } = m;
          return { 
            ...rest, 
            categoria_nombre: catName,
            sin_garantia: sinGarantia || false,
            incluye_blue: incluyeBlue || false,
            ofrece_blue: ofreceBlue || false,
            precio_blue: precioBlue || 0,
            tratamientos_permitidos: tratamientosPermitidos || []
          };
        });

        const treatmentsToInsert = (data as any).tratamientos.map(t => {
          const { id, created_at, ...rest } = t;
          return { ...rest, categoria_nombre: catName };
        });

        if (materialsToInsert.length > 0) {
          const { error: mErr } = await supabase.from('materiales').insert(materialsToInsert);
          if (mErr) throw mErr;
        }

        if (treatmentsToInsert.length > 0) {
          const { error: tErr } = await supabase.from('tratamientos').insert(treatmentsToInsert);
          if (tErr) throw tErr;
        }
      }

      setLastSync(new Date().toLocaleTimeString());
      alert("Catálogo sincronizado con éxito en la nube.");
      fetchCatalogo(); // Refresh to get new IDs
      fetchSucursales();
    } catch (error: any) {
      console.error("Error saving catalog:", error);
      const errorMsg = error?.message || error?.details || "Error desconocido";
      alert(`Error al sincronizar: ${errorMsg}. Revisa que todas las categorías existan en la base de datos.`);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Selección actual
  const [categoriaSel, setCategoriaSel] = useState("Monofocales Stock");
  const [materialSelId, setMaterialSelId] = useState("");
  const [tratamientoSelId, setTratamientoSelId] = useState("");
  
  // Armazón
  const [costoArmazon, setCostoArmazon] = useState(0);
  const [detalleArmazon, setDetalleArmazon] = useState("");

  // Comparación
  const [compararCon, setCompararCon] = useState<any>(null);
  const [showComparator, setShowComparator] = useState(false);

  // Asistente IA
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Filtro de Luz Azul
  const [filtroBlueActivo, setFiltroBlueActivo] = useState(false);

  // Sucursales
  const [sucursales, setSucursales] = useState([
    { id: '1', nombre: 'Sucursal Central', direccion: 'Av. Principal 123', telefono: '4444-5555' },
    { id: '2', nombre: 'Sucursal Norte', direccion: 'Calle Norte 456', telefono: '4444-6666' },
    { id: '3', nombre: 'Sucursal Sur', direccion: 'Ruta Sur Km 10', telefono: '4444-7777' }
  ]);
  const [sucursalSel, setSucursalSel] = useState<any>(null);
  const [showSucursalModal, setShowSucursalModal] = useState(false);

  // Simulador de Tratamientos
  const [showSimulador, setShowSimulador] = useState(true);
  const [simulacionActiva, setSimulacionActiva] = useState<string | null>(null);
  const [vistaEspesor, setVistaEspesor] = useState<'perfil' | 'superior'>('perfil');

  // Descuentos y Promociones
  const [descuento, setDescuento] = useState(0);
  const [tipoDescuento, setTipoDescuento] = useState<'porcentaje' | 'monto'>('porcentaje');
  const [condicionDescuento, setCondicionDescuento] = useState("Efectivo");

  // Información del Cliente
  const [cliente, setCliente] = useState({ nombre: "", contacto: "" });
  const [vendedor, setVendedor] = useState("");

  // Armazón
  // (Removed duplicate)

  // Receta
  const [receta, setReceta] = useState({
    od: { esf: 0, cil: 0, eje: 0 },
    oi: { esf: 0, cil: 0, eje: 0 },
    add: 0,
    altura: 0 // Para ocupacionales
  });

  // --- DERIVADOS ---
  const materialActual = useMemo(() => {
    return catalogo[categoriaSel].materiales.find(m => m.id === materialSelId);
  }, [catalogo, categoriaSel, materialSelId]);

  const tratamientoActual = useMemo(() => {
    return catalogo[categoriaSel].tratamientos.find(t => t.id === tratamientoSelId);
  }, [catalogo, categoriaSel, tratamientoSelId]);

  const tratamientosFiltrados = useMemo(() => {
    const todos = catalogo[categoriaSel].tratamientos;
    if (!materialActual || !materialActual.tratamientosPermitidos || materialActual.tratamientosPermitidos.length === 0) return todos;
    return todos.filter(t => materialActual.tratamientosPermitidos.includes(t.id));
  }, [catalogo, categoriaSel, materialActual]);

  const precioFinal = useMemo(() => {
    const pMat = materialActual?.precio || 0;
    const pTrat = tratamientoActual?.precio || 0;
    const pArm = parseFloat(costoArmazon.toString()) || 0;
    const pBlue = (filtroBlueActivo && materialActual?.ofreceBlue && !materialActual?.incluyeBlue) ? (materialActual?.precioBlue || 8000) : 0;
    const subtotal = pMat + pTrat + pArm + pBlue;
    
    if (tipoDescuento === 'porcentaje') {
      return subtotal - (subtotal * (descuento / 100));
    } else {
      return Math.max(0, subtotal - descuento);
    }
  }, [materialActual, tratamientoActual, costoArmazon, descuento, tipoDescuento, filtroBlueActivo]);

  const requiereLaboratorio = useMemo(() => {
    const check = (ojo, nombreOjo) => {
      const esf = parseFloat(ojo.esf) || 0;
      const cil = Math.abs(parseFloat(ojo.cil)) || 0;
      
      const rangos = materialActual?.rangos || [{ esf: [6, -10], cil: 2.00 }];
      
      // Si cae en CUALQUIER rango, está bien (no requiere lab)
      const fitsInRange = rangos.some(r => {
        const [maxEsf, minEsf] = r.esf;
        const maxCil = r.cil;
        return esf <= maxEsf && esf >= minEsf && cil <= maxCil;
      });

      if (!fitsInRange) {
        return [`Graduación ${nombreOjo} fuera de los rangos estándar del material`];
      }
      
      return [];
    };

    const reasonsOD = check(receta.od, "OD");
    const reasonsOI = check(receta.oi, "OI");
    
    return [...reasonsOD, ...reasonsOI];
  }, [receta, materialActual]);

  const recomendaciones = useMemo(() => {
    if (!categoriaSel) return [];
    
    const materiales = catalogo[categoriaSel].materiales;
    const maxPower = Math.max(
      Math.abs(parseFloat(receta.od.esf) || 0) + (Math.abs(parseFloat(receta.od.cil) || 0)),
      Math.abs(parseFloat(receta.oi.esf) || 0) + (Math.abs(parseFloat(receta.oi.cil) || 0))
    );

    // Función para verificar si una graduación entra en los rangos de un material
    const fits = (mat) => {
      const checkOjo = (ojo) => {
        const esf = parseFloat(ojo.esf) || 0;
        const cil = Math.abs(parseFloat(ojo.cil)) || 0;
        const rangos = mat.rangos || [{ esf: [6, -10], cil: 2.00 }];
        return rangos.some(r => esf <= r.esf[0] && esf >= r.esf[1] && cil <= r.cil);
      };
      return checkOjo(receta.od) && checkOjo(receta.oi);
    };

    const matsValidos = materiales.filter(fits).sort((a, b) => a.precio - b.precio);
    if (matsValidos.length === 0) return [];

    const results = [];

    const getExplicacion = (mat, tag) => {
      const isBlue = mat.nombre.toLowerCase().includes('blue') || mat.beneficios.some(b => b.toLowerCase().includes('blue'));
      const isPhoto = mat.nombre.toLowerCase().includes('transitions') || mat.nombre.toLowerCase().includes('photo');
      const isDigital = mat.nombre.toLowerCase().includes('digital');
      const isHighIndex = mat.indice >= 1.6;
      
      let text = "";
      
      if (tag === "Esencial") {
        text = "Opción económica que cubre tu graduación con calidad óptica garantizada.";
        if (isHighIndex) text += " Sorprendente delgadez para este rango de precio.";
      } else if (tag === "Recomendado") {
        if (maxPower < 2.5) {
          text = "Equilibrio ideal. ";
          if (isBlue) text += "Protección integrada contra luz azul de pantallas para reducir la fatiga visual. ";
          else text += "Recomendado por su excelente claridad y confort visual diario. ";
        } else if (maxPower < 5) {
          text = `Material de índice ${mat.indice} con mayor resistencia. Ofrece un espesor reducido ideal para tu graduación media, mejorando la estética. `;
        } else {
          text = `Lente de alto índice (${mat.indice}) diseñado específicamente para graduaciones altas. Reduce significativamente el peso y el grosor del cristal. `;
        }
      } else if (tag === "Premium") {
        text = "La máxima tecnología para tus ojos. ";
        if (isDigital) text += "Tallado digital de alta precisión para una visión nítida en todos los ángulos. ";
        if (isPhoto) text += "Tecnología fotosensible que se adapta a la luz solar automáticamente. ";
        if (isBlue) text += "Filtro selectivo de luz azul nociva. ";
        text += "Ofrece el mejor confort visual y una estética inmejorable.";
      }
      
      return text;
    };

    // 1. OPCIÓN ESENCIAL (La más barata que sirve)
    const esencial = matsValidos[0];
    results.push({ ...esencial, tag: "Esencial", color: "slate", explicacion: getExplicacion(esencial, "Esencial") });

    // 2. OPCIÓN RECOMENDADA (Equilibrio estética/precio)
    let reco;
    if (maxPower < 2.5) {
      // Para bajas, algo con AR o Blue
      reco = matsValidos.find(m => m.nombre.toLowerCase().includes('blue') || m.nombre.toLowerCase().includes('ar')) || matsValidos[Math.min(1, matsValidos.length - 1)];
    } else if (maxPower < 5) {
      // Para medias, Poli o 1.60
      reco = matsValidos.find(m => m.indice >= 1.59 && m.indice <= 1.61) || matsValidos[Math.floor(matsValidos.length / 2)];
    } else {
      // Para altas, 1.67
      reco = matsValidos.find(m => m.indice >= 1.67) || matsValidos[matsValidos.length - 1];
    }

    if (reco && reco.id !== results[0].id) {
      results.push({ ...reco, tag: "Recomendado", color: "indigo", explicacion: getExplicacion(reco, "Recomendado") });
    }

    // 3. OPCIÓN PREMIUM (Mejor tecnología/estética)
    const premium = matsValidos.find(m => m.nombre.toLowerCase().includes('digital') || m.indice >= 1.67 || m.nombre.toLowerCase().includes('transitions')) || matsValidos[matsValidos.length - 1];
    if (premium && !results.some(r => r.id === premium.id)) {
      results.push({ ...premium, tag: "Premium", color: "amber", explicacion: getExplicacion(premium, "Premium") });
    }

    // Si solo hay 1 o 2, rellenar con lo que haya
    while (results.length < 3 && matsValidos.length > results.length) {
      const next = matsValidos.find(m => !results.some(r => r.id === m.id));
      if (next) results.push({ ...next, tag: "Opción", color: "slate", explicacion: getExplicacion(next, "Opción") });
      else break;
    }

    return results.slice(0, 3);
  }, [receta, categoriaSel, catalogo]);

  // --- EFECTOS ---
  useEffect(() => {
    // Resetear selecciones al cambiar categoría
    setMaterialSelId(catalogo[categoriaSel].materiales[0]?.id || "");
    setTratamientoSelId(catalogo[categoriaSel].tratamientos[0]?.id || "");
    setFiltroBlueActivo(false);
  }, [categoriaSel, catalogo]);

  useEffect(() => {
    // Sincronizar estado del filtro blue al cambiar material
    if (materialActual?.incluyeBlue) {
      setFiltroBlueActivo(true);
    } else if (!materialActual?.ofreceBlue) {
      setFiltroBlueActivo(false);
    }
  }, [materialActual]);

  // --- MANEJADORES ---
  // --- ASISTENTE IA ---
  const askAI = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      const prompt = `Actúa como un experto óptico. El cliente tiene la siguiente receta: OD: ${JSON.stringify(receta.od)}, OI: ${JSON.stringify(receta.oi)}. 
      El catálogo actual es: ${JSON.stringify(catalogo)}. 
      Pregunta del cliente: ${aiQuery}. 
      Responde de forma profesional, breve y persuasiva, recomendando la mejor opción del catálogo para su salud visual y estética.`;
      
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      setAiResponse(response.text || "No pude generar una respuesta.");
    } catch (error) {
      console.error(error);
      setAiResponse("Error al conectar con el asistente de IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- EXPORTACIÓN PDF ---
  const exportToPDF = (sucursal: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text("Óptica Schellhas", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Presupuesto Óptico de Precisión", 20, 26);
    doc.text(new Date().toLocaleDateString(), 160, 20);

    // Sucursal Info
    if (sucursal) {
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`${sucursal.nombre}`, 20, 31);
      doc.text(`${sucursal.direccion} | Tel: ${sucursal.telefono}`, 20, 35);
    }

    // Cliente y Vendedor
    let currentY = 45;
    if (cliente.nombre || cliente.contacto || vendedor) {
      doc.setFontSize(11);
      doc.setTextColor(50);
      if (cliente.nombre) {
        doc.text(`Cliente: ${cliente.nombre}`, 20, currentY);
        currentY += 6;
      }
      if (cliente.contacto) {
        doc.text(`Contacto: ${cliente.contacto}`, 20, currentY);
        currentY += 6;
      }
      if (vendedor) {
        doc.text(`Vendedor: ${vendedor}`, 20, currentY);
        currentY += 6;
      }
      currentY += 4;
    }

    // Receta
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Receta del Paciente", 20, currentY);
    
    const recetaData = [
      ["Ojo", "Esfera", "Cilindro", "Eje"],
      ["Derecho (OD)", receta.od.esf, receta.od.cil, receta.od.eje],
      ["Izquierdo (OI)", receta.oi.esf, receta.oi.cil, receta.oi.eje]
    ];
    if (receta.add) recetaData.push(["Adición", receta.add, "-", "-"]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [recetaData[0]],
      body: recetaData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Detalle Presupuesto
    const lastTable = (doc as any).lastAutoTable;
    const startY = (lastTable ? lastTable.finalY : currentY + 30) + 15;
    doc.text("Detalle del Presupuesto", 20, startY);

    const detalleData = [
      ["Concepto", "Descripción", "Precio"],
      ["Lente", `${categoriaSel} - ${materialActual?.nombre} (${materialActual?.gama || 'Estándar'})`, formatCurrency(materialActual?.precio || 0)],
      ["Tratamiento", tratamientoActual?.nombre || "Sin adicionales", formatCurrency(tratamientoActual?.precio || 0)],
      ["Armazón", "Seleccionado en local", formatCurrency(costoArmazon)]
    ];

    if (!materialActual?.sinGarantia) {
      detalleData.push(["Garantía", materialActual?.garantia || (materialActual?.indice >= 1.6 ? '2 Años Premium' : '1 Año Estándar'), "-"]);
    }

    if (descuento > 0) {
      const subtotal = (materialActual?.precio || 0) + (tratamientoActual?.precio || 0) + costoArmazon + ((filtroBlueActivo && materialActual?.ofreceBlue && !materialActual?.incluyeBlue) ? (materialActual?.precioBlue || 8000) : 0);
      const descCalculado = tipoDescuento === 'porcentaje' ? (subtotal * (descuento / 100)) : descuento;
      const descLabel = tipoDescuento === 'porcentaje' ? `${descuento}%` : formatCurrency(descuento);
      detalleData.push(["Descuento", `${descLabel} (${condicionDescuento || 'General'})`, `-${formatCurrency(descCalculado)}`]);
    }

    detalleData.push(["TOTAL", "", formatCurrency(precioFinal)]);

    autoTable(doc, {
      startY: startY + 5,
      head: [detalleData[0]],
      body: detalleData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }, // Slate-800
      columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
    });

    // Beneficios
    const lastTable2 = (doc as any).lastAutoTable;
    const benefitsY = (lastTable2 ? lastTable2.finalY : startY + 50) + 15;
    doc.setFontSize(12);
    doc.text("Beneficios de su elección:", 20, benefitsY);
    doc.setFontSize(10);
    materialActual?.beneficios.forEach((b, i) => {
      doc.text(`• ${b}`, 25, benefitsY + 7 + (i * 6));
    });

    doc.save(`Presupuesto_OptiQuote_${new Date().getTime()}.pdf`);
  };

  const handleRecetaChange = (ojo, campo, valor) => {
    setReceta(prev => {
      // Si el campo es de primer nivel (como add o altura)
      if (ojo === campo) {
        return { ...prev, [ojo]: valor === "" ? "" : parseFloat(valor) };
      }
      // Si es un campo anidado (od.esf, oi.cil, etc)
      return {
        ...prev,
        [ojo]: { ...prev[ojo], [campo]: valor === "" ? "" : parseFloat(valor) }
      };
    });
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setIsAdminAuthenticated(false);
      setAdminPasswordInput("");
    } else {
      setIsAdmin(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Logo />
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Cotizador Inteligente</h1>
              <p className="text-slate-400 text-xs font-medium">Versión Profesional 2.5</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {sucursalSel && (
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sucursal Activa</span>
                <span className="text-sm font-bold text-indigo-600">{sucursalSel.nombre}</span>
              </div>
            )}
            <button 
              onClick={handleAdminToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${isAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm'}`}
            >
              <Settings size={18} />
              {isAdmin ? 'Cerrar Admin' : 'Administrar'}
            </button>
          </div>
        </header>

        {isAdmin ? (
          !isAdminAuthenticated ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
              <p className="text-slate-500 text-sm mb-8">Ingresa la contraseña para administrar el catálogo</p>
              
              <div className="space-y-4">
                <input 
                  type="password"
                  placeholder="••••"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adminPasswordInput === '1887' && setIsAdminAuthenticated(true)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-center text-2xl tracking-[0.5em] font-black focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    if (adminPasswordInput === '1887') {
                      setIsAdminAuthenticated(true);
                    } else {
                      alert("Contraseña Incorrecta");
                    }
                  }}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Ingresar al Panel
                </button>
                <button 
                  onClick={() => setIsAdmin(false)}
                  className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
                >
                  Volver al Cotizador
                </button>
              </div>
            </motion.div>
          ) : (
            <AdminPanel 
              catalogo={catalogo} 
              setCatalogo={setCatalogo} 
              onSave={saveCatalogo} 
              isSyncing={isSyncing} 
              lastSync={lastSync}
              sucursales={sucursales}
              setSucursales={setSucursales}
              presupuestos={presupuestos}
              onRefreshPresupuestos={fetchPresupuestos}
            />
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUMNA IZQUIERDA: RECETA Y SELECCIÓN */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* SECCIÓN RECETA */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
              >
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <Eye className="text-indigo-500" size={20} />
                  <h2 className="text-lg font-semibold text-slate-800">Receta del Paciente</h2>
                </div>

                {/* SECCIÓN CLIENTE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-50">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Nombre del Cliente</label>
                    <input 
                      type="text" 
                      value={cliente.nombre}
                      onChange={(e) => setCliente(prev => ({ ...prev, nombre: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Contacto (Tel/Email)</label>
                    <input 
                      type="text" 
                      value={cliente.contacto}
                      onChange={(e) => setCliente(prev => ({ ...prev, contacto: e.target.value }))}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ej: 11 2345-6789"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Vendedor</label>
                    <input 
                      type="text" 
                      value={vendedor}
                      onChange={(e) => setVendedor(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Nombre del vendedor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* OJO DERECHO */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Ojo Derecho (OD)</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <InputReceta label="Esfera" ojo="od" campo="esf" value={receta.od.esf} onChange={handleRecetaChange} />
                      <InputReceta label="Cilindro" ojo="od" campo="cil" value={receta.od.cil} onChange={handleRecetaChange} />
                      <InputReceta label="Eje" ojo="od" campo="eje" value={receta.od.eje} onChange={handleRecetaChange} step="1" min="0" max="179" />
                    </div>
                  </div>

                  {/* OJO IZQUIERDO */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Ojo Izquierdo (OI)</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <InputReceta label="Esfera" ojo="oi" campo="esf" value={receta.oi.esf} onChange={handleRecetaChange} />
                      <InputReceta label="Cilindro" ojo="oi" campo="cil" value={receta.oi.cil} onChange={handleRecetaChange} />
                      <InputReceta label="Eje" ojo="oi" campo="eje" value={receta.oi.eje} onChange={handleRecetaChange} step="1" min="0" max="179" />
                    </div>
                  </div>
                </div>

                  {/* ADICIÓN Y ALTURA (Dinámico según categoría) */}
                  {(categoriaSel === "Bifocales" || categoriaSel === "Multifocales" || categoriaSel === "Ocupacionales" || categoriaSel === "Control Miopía") && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 pt-6 border-t border-slate-50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputReceta label="Adición (ADD)" ojo="add" campo="add" value={receta.add} onChange={handleRecetaChange} />
                        {categoriaSel === "Ocupacionales" && (
                          <InputReceta label="Altura Pupilar" ojo="altura" campo="altura" value={receta.altura} onChange={handleRecetaChange} />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* COSTO ARMAZÓN */}
                  <div className="mt-6 pt-6 border-t border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Detalle del Armazón</label>
                        <input 
                          type="text" 
                          value={detalleArmazon}
                          onChange={(e) => setDetalleArmazon(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="Ej: Ray-Ban Aviator / Propio"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Costo Armazón ($)</label>
                        <input 
                          type="number" 
                          value={costoArmazon || ""}
                          onChange={(e) => setCostoArmazon(parseFloat(e.target.value) || 0)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="Ej: 45000"
                        />
                      </div>
                    </div>
                  </div>

                {/* ALERTA DE RANGO */}
                <AnimatePresence>
                  {requiereLaboratorio.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                      <div>
                        <p className="text-amber-800 font-bold text-sm uppercase">⚠️ REQUIERE CONSULTA A LABORATORIO (Fuera de Rango)</p>
                        <ul className="mt-2 space-y-1">
                          {requiereLaboratorio.map((reason, idx) => (
                            <li key={idx} className="text-amber-700 text-xs flex items-center gap-1">
                              <ChevronRight size={12} /> {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              {/* SECCIÓN SELECCIÓN DE LENTE */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
              >
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                  <Calculator className="text-indigo-500" size={20} />
                  <h2 className="text-lg font-semibold text-slate-800">Configuración del Lente</h2>
                </div>

                <div className="space-y-6">
                  {/* CATEGORÍA */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Tipo de Lente</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(catalogo).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategoriaSel(cat)}
                          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${categoriaSel === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* RECOMENDACIONES INTELIGENTES */}
                  <AnimatePresence>
                    {recomendaciones.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 pt-6 border-t border-slate-50"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="text-amber-500" size={16} />
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recomendaciones para esta Receta</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {recomendaciones.map((rec) => (
                            <button
                              key={rec.id}
                              onClick={() => setMaterialSelId(rec.id)}
                              className={`relative p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-full ${materialSelId === rec.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                            >
                              <div className={`absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter text-white shadow-sm ${rec.color === 'indigo' ? 'bg-indigo-600' : rec.color === 'amber' ? 'bg-amber-500' : 'bg-slate-500'}`}>
                                {rec.tag}
                              </div>
                              <div className="mb-2">
                                {renderThicknessIndex(rec.indice)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{rec.nombre}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                                  {rec.explicacion}
                                </p>
                              </div>
                              <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-end">
                                <span className="text-[10px] font-bold text-slate-400">Índice {rec.indice}</span>
                                <span className="text-sm font-black text-indigo-600">{formatCurrency(rec.precio)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* MATERIAL */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-slate-400 uppercase">Material / Índice</label>
                      
                      {/* TOGGLE FILTRO BLUE */}
                      {materialActual?.ofreceBlue && (
                        <motion.div 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100"
                        >
                          <Monitor size={14} className="text-indigo-600" />
                          <span className="text-[10px] font-bold text-indigo-700 uppercase">Filtro Luz Azul</span>
                          <button 
                            onClick={() => !materialActual?.incluyeBlue && setFiltroBlueActivo(!filtroBlueActivo)}
                            className={`w-8 h-4 rounded-full relative transition-all ${filtroBlueActivo ? 'bg-indigo-600' : 'bg-slate-300'} ${materialActual?.incluyeBlue ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <motion.div 
                              animate={{ x: filtroBlueActivo ? 16 : 2 }}
                              className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </motion.div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {catalogo[categoriaSel].materiales.map(mat => (
                        <div
                          key={mat.id}
                          onClick={() => setMaterialSelId(mat.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setMaterialSelId(mat.id); }}
                          role="button"
                          tabIndex={0}
                          className={`flex justify-between items-center p-4 rounded-xl border-2 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 ${materialSelId === mat.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-bold ${materialSelId === mat.id ? 'text-indigo-700' : 'text-slate-700'}`}>{mat.nombre}</p>
                              {mat.gama && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-black uppercase tracking-tighter">
                                  {mat.gama}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] text-slate-400 font-bold">{formatCurrency(mat.precio)}</p>
                              <div className="h-3 w-[1px] bg-slate-200"></div>
                              {renderThicknessIndex(mat.indice)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompararCon(mat);
                                setShowComparator(true);
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Comparar"
                            >
                              <ArrowRightLeft size={16} />
                            </button>
                            {materialSelId === mat.id && <CheckCircle2 className="text-indigo-600" size={20} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TRATAMIENTO */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Tratamiento Adicional</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tratamientosFiltrados.map(trat => (
                        <button
                          key={trat.id}
                          onClick={() => setTratamientoSelId(trat.id)}
                          className={`flex justify-between items-center p-4 rounded-xl border-2 transition-all ${tratamientoSelId === trat.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                          <div className="text-left">
                            <p className={`text-sm font-bold ${tratamientoSelId === trat.id ? 'text-indigo-700' : 'text-slate-700'}`}>{trat.nombre}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-slate-400">+{formatCurrency(trat.precio)}</p>
                              {trat.precio > 20000 && (
                                <span className="text-[8px] text-emerald-600 font-bold flex items-center gap-0.5">
                                  <Zap size={8} /> Alta Resistencia
                                </span>
                              )}
                            </div>
                          </div>
                          {tratamientoSelId === trat.id && <CheckCircle2 className="text-indigo-600" size={20} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* COLUMNA DERECHA: RESULTADOS Y COMPARADOR */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* PRECIO FINAL */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">Presupuesto Estimado</p>
                  <h3 className="text-5xl font-black tracking-tighter mb-4">
                    {formatCurrency(precioFinal)}
                  </h3>
                  <div className="flex flex-col gap-3 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Cristales:</span>
                      <span className="font-bold">{formatCurrency((materialActual?.precio || 0) + (tratamientoActual?.precio || 0))}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Armazón:</span>
                      <span className="font-bold">{formatCurrency(costoArmazon)}</span>
                    </div>
                    {descuento > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-400">
                        <span>Descuento ({tipoDescuento === 'porcentaje' ? `${descuento}%` : formatCurrency(descuento)}):</span>
                        <span className="font-bold">-{formatCurrency(tipoDescuento === 'porcentaje' ? (((materialActual?.precio || 0) + (tratamientoActual?.precio || 0) + costoArmazon + ((filtroBlueActivo && materialActual?.ofreceBlue && !materialActual?.incluyeBlue) ? (materialActual?.precioBlue || 8000) : 0)) * (descuento / 100)) : descuento)}</span>
                      </div>
                    )}
                    
                    {/* SECCIÓN DESCUENTO */}
                    <div className="mt-4 pt-4 border-t border-slate-800">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Descuento</span>
                            <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
                              <button 
                                onClick={() => setTipoDescuento('porcentaje')}
                                className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${tipoDescuento === 'porcentaje' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                              >
                                %
                              </button>
                              <button 
                                onClick={() => setTipoDescuento('monto')}
                                className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${tipoDescuento === 'monto' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                              >
                                $
                              </button>
                            </div>
                          </div>
                          <input 
                            type="number"
                            value={descuento || ""}
                            onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white text-right font-bold focus:outline-none focus:border-indigo-500"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Motivo / Condición</span>
                          <input 
                            type="text"
                            value={condicionDescuento}
                            onChange={(e) => setCondicionDescuento(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                            placeholder="Ej: Efectivo, Prepaga OSDE..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <button 
                        onClick={() => setShowSucursalModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <FileText size={18} />
                        Guardar y Exportar PDF
                      </button>
                      
                      <button 
                        onClick={async () => {
                          const success = await savePresupuesto();
                          if (success) alert("Presupuesto guardado con éxito.");
                        }}
                        disabled={isSyncing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isSyncing ? (
                          <RefreshCw size={18} className="animate-spin" />
                        ) : (
                          <CloudUpload size={18} />
                        )}
                        Guardar Presupuesto en la Nube
                      </button>
                    </div>
                  </div>
                </div>
                {/* Decoración fondo */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
              </motion.div>

              {/* GARANTÍA Y PESO (RECOMENDACIÓN) */}
              <div className="grid grid-cols-2 gap-4">
                {!materialActual?.sinGarantia && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Garantía</p>
                      <p className="text-xs font-bold text-slate-700">
                        {materialActual?.garantia || (materialActual?.indice >= 1.6 ? '2 Años Premium' : '1 Año Estándar')}
                      </p>
                    </div>
                  </div>
                )}
                <div className={`${materialActual?.sinGarantia ? 'col-span-2' : ''} bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3`}>
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Peso Estimado</p>
                    <p className="text-xs font-bold text-slate-700">
                      {materialActual?.indice >= 1.67 ? 'Ultra Liviano' : materialActual?.indice >= 1.6 ? 'Liviano' : 'Estándar'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ASISTENTE IA */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <Sparkles className="text-indigo-500" size={18} />
                    Asistente Inteligente
                  </h3>
                  <button 
                    onClick={() => setShowAI(!showAI)}
                    className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                  >
                    {showAI ? 'Cerrar' : 'Abrir'}
                  </button>
                </div>
                
                {showAI && (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea 
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Ej: ¿Qué lente me recomiendas para mi receta y uso de oficina?"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs min-h-[80px] focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button 
                        onClick={askAI}
                        disabled={isAiLoading}
                        className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isAiLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <MessageSquare size={16} />}
                      </button>
                    </div>
                    {aiResponse && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed"
                      >
                        {aiResponse}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* SIMULADOR DE TRATAMIENTOS INTERACTIVO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <Eye className="text-indigo-500" size={18} />
                    Simulador de Tratamientos
                  </h3>
                  <button 
                    onClick={() => setShowSimulador(!showSimulador)}
                    className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                  >
                    {showSimulador ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {showSimulador && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden mb-6 group">
                        {/* Imagen base (Paisaje con reflejos) */}
                        <img 
                          src="https://picsum.photos/seed/view/800/450" 
                          alt="Simulación" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Capa de Reflejos (Sin AR) */}
                        <AnimatePresence>
                          {simulacionActiva !== 'ar' && simulacionActiva !== 'polarized' && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.4 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/40 pointer-events-none"
                            />
                          )}
                        </AnimatePresence>

                        {/* Capa Blue Light (Filtro Sutil) */}
                        <AnimatePresence>
                          {simulacionActiva === 'blue' && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.2 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-amber-200/40 pointer-events-none mix-blend-multiply flex items-center justify-center"
                            >
                              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30 text-center">
                                <span className="text-white font-black text-xs uppercase tracking-widest drop-shadow-lg">Filtro de Luz Azul Activo</span>
                                <p className="text-white/80 text-[8px] font-bold mt-1">Bloqueo de espectro nocivo</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Capa Transitions (Oscurecimiento) */}
                        <AnimatePresence>
                          {simulacionActiva === 'photo' && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.65 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-slate-900 pointer-events-none"
                            />
                          )}
                        </AnimatePresence>

                        {/* Capa Polarizado (Eliminación de reflejos horizontales) */}
                        <AnimatePresence>
                          {simulacionActiva === 'polarized' && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-slate-800 pointer-events-none flex items-center justify-center"
                            >
                              <div className="bg-emerald-500/20 backdrop-blur-sm p-4 rounded-2xl border border-emerald-500/30 text-center">
                                <span className="text-emerald-400 font-black text-xs uppercase tracking-widest drop-shadow-lg">Polarizado Activo</span>
                                <p className="text-emerald-400/80 text-[8px] font-bold mt-1">Elimina reflejos de superficies</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full">
                          {simulacionActiva === 'ar' ? 'Con Antirreflex' : 
                           simulacionActiva === 'blue' ? 'Con Filtro Azul' :
                           simulacionActiva === 'photo' ? 'Fotosensible Activo' : 
                           simulacionActiva === 'polarized' ? 'Polarizado Activo' : 'Visión Estándar'}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        <button 
                          onClick={() => setSimulacionActiva(null)}
                          className={`p-2 rounded-lg border text-center transition-all ${simulacionActiva === null ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                        >
                          <div className="text-[10px] font-bold">Base</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('ar')}
                          className={`p-2 rounded-lg border text-center transition-all ${simulacionActiva === 'ar' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                        >
                          <ShieldCheck size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">AR</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('blue')}
                          className={`p-2 rounded-lg border text-center transition-all ${simulacionActiva === 'blue' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                        >
                          <Monitor size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">Blue</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('photo')}
                          className={`p-2 rounded-lg border text-center transition-all ${simulacionActiva === 'photo' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                        >
                          <Sun size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">Photo</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('polarized')}
                          className={`p-2 rounded-lg border text-center transition-all ${simulacionActiva === 'polarized' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}
                        >
                          <Zap size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">Polar</div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* COMPARADOR DE ESPESORES MEJORADO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <Layers className="text-indigo-500" size={18} />
                    Comparador de Espesores
                  </h3>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setVistaEspesor('perfil')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${vistaEspesor === 'perfil' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      PERFIL
                    </button>
                    <button 
                      onClick={() => setVistaEspesor('superior')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${vistaEspesor === 'superior' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      SUPERIOR
                    </button>
                  </div>
                </div>
                
                <div className="space-y-6 py-2">
                  {vistaEspesor === 'perfil' ? (
                    <div className="grid grid-cols-2 gap-6">
                      {/* Referencia 1.50 */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase text-center tracking-wider">Lente Estándar (1.50)</p>
                        <div className="h-24 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 relative overflow-hidden">
                          <div className="w-[24px] h-20 bg-slate-200/40 border-x-[12px] border-slate-300/60 rounded-[40%] relative">
                            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-slate-300/30"></div>
                          </div>
                          <div className="absolute bottom-2 text-[8px] font-bold text-slate-400">GROSOR BASE</div>
                        </div>
                      </div>
                      
                      {/* Selección Actual */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-indigo-500 uppercase text-center tracking-wider">Tu Selección ({materialActual?.indice.toFixed(2)})</p>
                        <div className="h-24 flex items-center justify-center bg-indigo-50/30 rounded-2xl border border-indigo-100 relative overflow-hidden">
                          <motion.div 
                            animate={{ 
                              width: `${Math.max(10, (2.1 - (materialActual?.indice || 1.5)) * 40)}px`,
                              borderLeftWidth: `${Math.max(2, (2.1 - (materialActual?.indice || 1.5)) * 20)}px`,
                              borderRightWidth: `${Math.max(2, (2.1 - (materialActual?.indice || 1.5)) * 20)}px`
                            }}
                            className="h-20 bg-indigo-400/20 border-indigo-500/40 rounded-[40%] relative transition-all duration-500"
                          >
                            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-indigo-500/20"></div>
                          </motion.div>
                          <div className="absolute bottom-2 text-[8px] font-bold text-indigo-500">
                            {materialActual?.indice > 1.5 ? 'MÁS DELGADO' : 'MISMO GROSOR'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {/* Referencia Superior */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase text-center tracking-wider">Vista Superior (1.50)</p>
                        <div className="h-24 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 relative">
                          {/* Marco de anteojo */}
                          <div className="w-24 h-12 border-2 border-slate-300 rounded-sm relative flex items-center justify-center">
                            {/* Lente sobresaliendo */}
                            <div className="absolute -top-2 -bottom-2 w-16 bg-slate-200/60 border-x-4 border-slate-300/80 rounded-sm"></div>
                          </div>
                          <div className="absolute bottom-1 text-[7px] font-bold text-slate-400">SOBRESALE DEL MARCO</div>
                        </div>
                      </div>

                      {/* Selección Superior */}
                      <div className="space-y-3">
                        <p className="text-[9px] font-bold text-indigo-500 uppercase text-center tracking-wider">Vista Superior ({materialActual?.indice.toFixed(2)})</p>
                        <div className="h-24 flex items-center justify-center bg-indigo-50/30 rounded-2xl border border-indigo-100 relative">
                          <div className="w-24 h-12 border-2 border-indigo-300 rounded-sm relative flex items-center justify-center">
                            <motion.div 
                              animate={{ 
                                top: `-${Math.max(0, (2.1 - (materialActual?.indice || 1.5)) * 12)}px`,
                                bottom: `-${Math.max(0, (2.1 - (materialActual?.indice || 1.5)) * 12)}px`,
                                borderLeftWidth: `${Math.max(1, (2.1 - (materialActual?.indice || 1.5)) * 6)}px`,
                                borderRightWidth: `${Math.max(1, (2.1 - (materialActual?.indice || 1.5)) * 6)}px`
                              }}
                              className="absolute w-16 bg-indigo-400/30 border-indigo-500/50 rounded-sm transition-all duration-500"
                            />
                          </div>
                          <div className="absolute bottom-1 text-[7px] font-bold text-indigo-500">
                            {materialActual?.indice >= 1.67 ? 'QUEDA DENTRO DEL MARCO' : 'REDUCCIÓN ESTÉTICA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Panel de Datos Comparativos */}
                  <div className="bg-slate-900 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${materialActual?.indice >= 1.67 ? 'bg-emerald-400' : materialActual?.indice >= 1.59 ? 'bg-blue-400' : 'bg-slate-500'}`}></div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Calificación Estética</span>
                      </div>
                      <span className="text-xs font-black text-white px-2 py-0.5 bg-white/10 rounded">
                        {materialActual?.indice >= 1.74 ? 'EXCELENTE' : materialActual?.indice >= 1.67 ? 'MUY BUENA' : materialActual?.indice >= 1.59 ? 'BUENA' : 'ESTÁNDAR'}
                      </span>
                    </div>
                    
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((materialActual?.indice - 1.4) / (1.8 - 1.4)) * 100}%` }}
                        className={`h-full ${materialActual?.indice >= 1.67 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-500">REDUCCIÓN DE GROSOR:</span>
                      <span className="text-emerald-400">
                        {materialActual?.indice > 1.5 ? `${((1 - (2.1 - materialActual.indice) / (2.1 - 1.5)) * 100).toFixed(0)}% más fino` : '0% (Base)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Índice</p>
                      <p className="text-lg font-black text-slate-700">{materialActual?.indice.toFixed(2)}</p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Peso</p>
                      <p className="text-lg font-black text-slate-700">-{((materialActual?.indice - 1.5) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Estética</p>
                      <div className="mt-1">{renderThicknessIndex(materialActual?.indice)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIMULADOR DE CAMPO VISUAL (Solo Multifocales) */}
              {categoriaSel === "Multifocales" && materialActual?.campos && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                >
                  <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 flex items-center gap-2">
                    <Maximize2 className="text-indigo-500" size={18} />
                    Amplitud de Visión
                  </h3>

                  <div className="space-y-4">
                    {['lejos', 'inter', 'cerca'].map((zona) => (
                      <div key={zona} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{zona === 'inter' ? 'Intermedia' : zona}</span>
                          {renderStars(materialActual.campos[zona])}
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(materialActual.campos[zona] / 5) * 100}%` }}
                            className="h-full bg-indigo-500"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1">
                        <Zap size={14} />
                        Tecnología de Tallado
                      </div>
                      <p className="text-[11px] text-indigo-700 leading-relaxed">
                        Este lente utiliza un tallado <span className="font-bold">{materialActual.tallado}</span>, lo que reduce las distorsiones laterales y facilita la adaptación inmediata.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* BENEFICIOS TÉCNICOS */}
              <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6">
                <h3 className="text-sm font-bold text-indigo-900 uppercase mb-4">Ficha Técnica de Beneficios</h3>
                <ul className="space-y-3">
                  {materialActual?.beneficios.map((ben, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-indigo-800">
                      <CheckCircle2 size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                      {BENEFIT_DESCRIPTIONS[ben] ? (
                        <Tooltip text={BENEFIT_DESCRIPTIONS[ben]}>
                          <span className="cursor-help border-b border-dotted border-indigo-300">{ben}</span>
                        </Tooltip>
                      ) : (
                        <span>{ben}</span>
                      )}
                    </li>
                  ))}
                  {tratamientoActual && tratamientoActual.precio > 0 && (
                    <li className="flex items-start gap-3 text-sm text-indigo-800 font-semibold">
                      <CheckCircle2 size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                      <span>Incluye: {tratamientoActual.nombre}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* RESUMEN PARA EL CLIENTE */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-emerald-900 uppercase mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-emerald-600" />
                  ¿Por qué elegir esta opción?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-emerald-700 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Calidad Visual Superior</p>
                      <p className="text-[10px] text-emerald-700 leading-relaxed">
                        {materialActual?.gama === 'Premium' 
                          ? "Tecnología de última generación que ofrece una visión nítida y natural sin distorsiones."
                          : "Excelente equilibrio entre claridad y costo para una visión confortable."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-emerald-700 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Protección y Durabilidad</p>
                      <p className="text-[10px] text-emerald-700 leading-relaxed">
                        {tratamientoActual?.precio > 30000 
                          ? "Tratamiento de alta resistencia que protege tus ojos y prolonga la vida útil de tus lentes."
                          : "Protección básica contra reflejos y rayas para el uso diario."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="mt-12 text-center text-slate-400 text-xs">
          <p>© 2026 Óptica Schellhas - Sistema de Gestión de Ventas v2.5</p>
        </footer>
      </div>

      {/* MODAL COMPARADOR LADO A LADO */}
      <AnimatePresence>
        {showComparator && compararCon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComparator(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ArrowRightLeft className="text-indigo-600" />
                  Comparador Lado a Lado
                </h2>
                <button onClick={() => setShowComparator(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 divide-x divide-slate-100">
                {/* OPCIÓN 1 (Actual) */}
                <div className="p-8 space-y-6">
                  <div className="bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase px-2 py-1 rounded w-fit">Opción Actual</div>
                  <h3 className="text-2xl font-black text-slate-800">{materialActual?.nombre}</h3>
                  <p className="text-3xl font-black text-indigo-600">{formatCurrency(materialActual?.precio || 0)}</p>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-bold uppercase">Índice</span>
                      <span className="text-sm font-bold text-slate-700">{materialActual?.indice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-bold uppercase">Estética</span>
                      {renderThicknessIndex(materialActual?.indice)}
                    </div>
                    {materialActual?.campos && (
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 font-bold uppercase">Campo Visual</span>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Lejos: {materialActual.campos.lejos}</span>
                          <span>Inter: {materialActual.campos.inter}</span>
                          <span>Cerca: {materialActual.campos.cerca}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* OPCIÓN 2 (Comparar) */}
                <div className="p-8 space-y-6 bg-slate-50/50">
                  <div className="bg-amber-50 text-amber-600 text-[10px] font-bold uppercase px-2 py-1 rounded w-fit">Alternativa</div>
                  <h3 className="text-2xl font-black text-slate-800">{compararCon.nombre}</h3>
                  <p className="text-3xl font-black text-amber-600">{formatCurrency(compararCon.precio)}</p>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-bold uppercase">Índice</span>
                      <span className="text-sm font-bold text-slate-700">{compararCon.indice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-bold uppercase">Estética</span>
                      {renderThicknessIndex(compararCon?.indice)}
                    </div>
                    {compararCon.campos && (
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 font-bold uppercase">Campo Visual</span>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Lejos: {compararCon.campos.lejos}</span>
                          <span>Inter: {compararCon.campos.inter}</span>
                          <span>Cerca: {compararCon.campos.cerca}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => {
                      setMaterialSelId(compararCon.id);
                      setShowComparator(false);
                    }}
                    className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-900 transition-all mt-8"
                  >
                    Seleccionar esta opción
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL SELECCIÓN DE SUCURSAL */}
      <AnimatePresence>
        {showSucursalModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSucursalModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ArrowRightLeft className="text-indigo-600" />
                  Seleccionar Sucursal
                </h2>
                <button onClick={() => setShowSucursalModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-500 mb-4">Selecciona la sucursal que aparecerá en el presupuesto PDF:</p>
                {sucursales.map(suc => (
                  <button
                    key={suc.id}
                    onClick={() => {
                      exportToPDF(suc);
                      setShowSucursalModal(false);
                    }}
                    className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                  >
                    <p className="font-bold text-slate-800 group-hover:text-indigo-700">{suc.nombre}</p>
                    <p className="text-[10px] text-slate-400">{suc.direccion}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTE PANEL DE ADMINISTRACIÓN ---
function AdminPanel({ 
  catalogo, 
  setCatalogo, 
  onSave, 
  isSyncing, 
  lastSync,
  sucursales,
  setSucursales,
  presupuestos,
  onRefreshPresupuestos
}: { 
  catalogo: any, 
  setCatalogo: any, 
  onSave: () => void, 
  isSyncing: boolean, 
  lastSync: string | null,
  sucursales: any[],
  setSucursales: (s: any[]) => void,
  presupuestos: any[],
  onRefreshPresupuestos: () => void
}) {
  const [activeTab, setActiveTab] = useState("Monofocales Stock");
  const [showSucursalesAdmin, setShowSucursalesAdmin] = useState(false);
  const [showPresupuestos, setShowPresupuestos] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  const addCategory = () => {
    if (newCatName && !catalogo[newCatName]) {
      const newCatalogo = { ...catalogo };
      newCatalogo[newCatName] = { materiales: [], tratamientos: [] };
      setCatalogo(newCatalogo);
      setActiveTab(newCatName);
      setNewCatName("");
      setShowAddCat(false);
    }
  };

  const removeCategory = (cat: string) => {
    const newCatalogo = { ...catalogo };
    delete newCatalogo[cat];
    setCatalogo(newCatalogo);
    const remainingCats = Object.keys(newCatalogo);
    if (remainingCats.length > 0) {
      setActiveTab(remainingCats[0]);
    }
    setCatToDelete(null);
  };

  const updateItem = (cat, type, id, field, value) => {
    const newCatalogo = { ...catalogo };
    const items = newCatalogo[cat][type];
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      let parsedValue = value;
      if (field === 'precio' || field === 'indice') {
        parsedValue = value === "" ? 0 : parseFloat(value);
        if (isNaN(parsedValue)) parsedValue = 0;
      }
      items[index][field] = parsedValue;
      setCatalogo(newCatalogo);
    }
  };

  const addItem = (cat, type) => {
    const newCatalogo = { ...catalogo };
    const newItem = type === 'materiales' 
      ? { id: Date.now().toString(), nombre: "Nuevo Material", precio: 0, indice: 1.5, beneficios: ["Beneficio 1"] }
      : { id: Date.now().toString(), nombre: "Nuevo Tratamiento", precio: 0 };
    newCatalogo[cat][type].push(newItem);
    setCatalogo(newCatalogo);
  };

  const removeItem = (cat, type, id) => {
    const newCatalogo = { ...catalogo };
    newCatalogo[cat][type] = newCatalogo[cat][type].filter(i => i.id !== id);
    setCatalogo(newCatalogo);
  };

  const toggleTratamiento = (cat, matId, tratId) => {
    const newCatalogo = { ...catalogo };
    const material = newCatalogo[cat].materiales.find(m => m.id === matId);
    if (material) {
      if (!material.tratamientosPermitidos) {
        // Si no existe, lo inicializamos con todos los actuales menos el que queremos quitar? 
        // O mejor, si no existe significa "todos". Al marcar uno, empezamos a restringir.
        material.tratamientosPermitidos = catalogo[cat].tratamientos.map(t => t.id);
      }
      
      if (material.tratamientosPermitidos.includes(tratId)) {
        material.tratamientosPermitidos = material.tratamientosPermitidos.filter(id => id !== tratId);
      } else {
        material.tratamientosPermitidos = [...material.tratamientosPermitidos, tratId];
      }
      setCatalogo(newCatalogo);
    }
  };

  const suggestBenefitsWithAI = async (catName: string, matId: string) => {
    const mat = catalogo[catName].materiales.find(m => m.id === matId);
    if (!mat) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Como experto óptico, sugiere 3 beneficios cortos (máximo 4 palabras cada uno) para un lente con las siguientes características:
      Nombre: ${mat.nombre}
      Índice de Refracción: ${mat.indice}
      Categoría: ${catName}
      Gama: ${mat.gama || 'No especificada'}
      
      Responde ÚNICAMENTE con un array JSON de strings. Ejemplo: ["Ligero", "Alta transparencia", "Protección UV"]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "[]";
      const match = text.match(/\[.*\]/s);
      if (match) {
        const suggested = JSON.parse(match[0]);
        updateItem(catName, 'materiales', matId, 'beneficios', suggested);
      }
    } catch (error) {
      console.error("Error sugiriendo beneficios:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
    >
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-indigo-600" />
          Panel de Control de Precios y Catálogo
        </h2>
      </div>

      <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => {
            setShowPresupuestos(true);
            setShowSucursalesAdmin(false);
            onRefreshPresupuestos();
          }}
          className={`px-8 py-4 text-sm font-bold transition-all shrink-0 whitespace-nowrap ${showPresupuestos ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Presupuestos
        </button>
        {Object.keys(catalogo).map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveTab(cat);
              setShowSucursalesAdmin(false);
              setShowPresupuestos(false);
            }}
            className={`px-8 py-4 text-sm font-bold transition-all shrink-0 whitespace-nowrap ${activeTab === cat && !showSucursalesAdmin && !showPresupuestos ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => {
            setShowSucursalesAdmin(true);
            setShowPresupuestos(false);
          }}
          className={`px-8 py-4 text-sm font-bold transition-all shrink-0 whitespace-nowrap ${showSucursalesAdmin ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Sucursales
        </button>
        <button
          onClick={() => setShowAddCat(true)}
          className="px-4 py-4 text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center shrink-0"
          title="Agregar Categoría"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* MODAL AGREGAR CATEGORÍA */}
      <AnimatePresence>
        {showAddCat && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-4">Nueva Categoría de Lente</h3>
              <input 
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Monofocales Rango Extendido"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddCat(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={addCategory}
                  className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Agregar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ELIMINAR CATEGORÍA */}
      <AnimatePresence>
        {catToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm"
            >
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold">¿Eliminar Categoría?</h3>
              </div>
              <p className="text-slate-500 text-sm mb-6">
                Estás por eliminar <b>"{catToDelete}"</b>. Se borrarán todos los materiales y tratamientos asociados. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCatToDelete(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => removeCategory(catToDelete)}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-8">
        {showPresupuestos ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Historial de Presupuestos</h3>
              <button 
                onClick={onRefreshPresupuestos}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sucursal / Vendedor</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {presupuestos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No hay presupuestos registrados</td>
                      </tr>
                    ) : (
                      presupuestos.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-700">{new Date(p.created_at).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-400">{new Date(p.created_at).toLocaleTimeString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg inline-block mb-1">{p.sucursal_nombre}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Vend: {p.vendedor || 'S/N'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-700">{p.cliente_nombre || 'S/N'}</p>
                            <p className="text-[10px] text-slate-400">{p.cliente_contacto || '-'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-slate-700">{p.material_nombre}</p>
                            <p className="text-[10px] text-slate-400">{p.categoria_nombre} + {p.tratamiento_nombre || 'Sin Trat.'}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-slate-800">{formatCurrency(p.precio_final)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : showSucursalesAdmin ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Gestión de Sucursales</h3>
              <button 
                onClick={() => setSucursales([...sucursales, { id: Date.now().toString(), nombre: 'Nueva Sucursal', direccion: '', telefono: '' }])}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-xs font-bold"
              >
                <Plus size={16} /> Agregar Sucursal
              </button>
            </div>
            <div className="space-y-4">
              {sucursales.map(suc => (
                <div key={suc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold"
                      value={suc.nombre}
                      onChange={(e) => {
                        const newSuc = sucursales.map(s => s.id === suc.id ? { ...s, nombre: e.target.value } : s);
                        setSucursales(newSuc);
                      }}
                      placeholder="Nombre de Sucursal"
                    />
                    <button 
                      onClick={() => setSucursales(sucursales.filter(s => s.id !== suc.id))}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                      value={suc.direccion}
                      onChange={(e) => {
                        const newSuc = sucursales.map(s => s.id === suc.id ? { ...s, direccion: e.target.value } : s);
                        setSucursales(newSuc);
                      }}
                      placeholder="Dirección"
                    />
                    <input 
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                      value={suc.telefono}
                      onChange={(e) => {
                        const newSuc = sucursales.map(s => s.id === suc.id ? { ...s, telefono: e.target.value } : s);
                        setSucursales(newSuc);
                      }}
                      placeholder="Teléfono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Categoría: {activeTab}</h3>
              <button 
                onClick={() => setCatToDelete(activeTab)}
                className="text-red-400 hover:text-red-600 flex items-center gap-1 text-xs font-bold"
              >
                <Trash2 size={16} /> Eliminar Categoría
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* MATERIALES */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Materiales</h3>
            <button onClick={() => addItem(activeTab, 'materiales')} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-xs font-bold">
              <Plus size={16} /> Agregar
            </button>
          </div>
          <div className="space-y-4">
            {catalogo[activeTab].materiales.map(mat => (
              <div key={mat.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold"
                    value={mat.nombre}
                    onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'nombre', e.target.value)}
                  />
                  <button onClick={() => removeItem(activeTab, 'materiales', mat.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400">Precio Base ($)</label>
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                        value={isNaN(mat.precio) ? "" : mat.precio}
                        onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'precio', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400">Calidad (1-5 Estrellas)</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => updateItem(activeTab, 'materiales', mat.id, 'calidad', star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              size={16} 
                              className={star <= (mat.calidad || 3) ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400">Índice Refracción</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                        value={isNaN(mat.indice) ? "" : mat.indice}
                        onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'indice', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400">Gama / Categoría</label>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                        value={mat.gama || ""}
                        onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'gama', e.target.value)}
                      >
                        <option value="">Sin especificar</option>
                        <option value="Económica">Económica</option>
                        <option value="Estándar">Estándar</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Beneficios (Separados por coma)</label>
                      <button 
                        onClick={() => suggestBenefitsWithAI(activeTab, mat.id)}
                        className="text-[8px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded"
                      >
                        <Sparkles size={10} /> SUGERIR CON IA
                      </button>
                    </div>
                    <input 
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                      value={(mat.beneficios || []).join(', ')}
                      onChange={(e) => {
                        const benefits = e.target.value.split(',').map(b => b.trim()).filter(b => b !== "");
                        updateItem(activeTab, 'materiales', mat.id, 'beneficios', benefits);
                      }}
                      placeholder="Ej: Resistente, Liviano, Filtro Azul"
                    />
                  </div>

                {/* RANGOS DE GRADUACIÓN */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Rangos de Graduación</label>
                    <button 
                      onClick={() => {
                        const currentRangos = mat.rangos || [{ esf: [6, -10], cil: 2 }];
                        const newRangos = [...currentRangos, { esf: [6, -10], cil: 2 }];
                        updateItem(activeTab, 'materiales', mat.id, 'rangos', newRangos);
                      }}
                      className="text-[8px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={10} /> AGREGAR RANGO
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(mat.rangos || [{ esf: [6, -10], cil: 2 }]).map((r, idx) => (
                      <div key={idx} className="p-2 bg-white border border-slate-100 rounded-lg relative group">
                        {mat.rangos && mat.rangos.length > 1 && (
                          <button 
                            onClick={() => {
                              const newRangos = mat.rangos.filter((_, i) => i !== idx);
                              updateItem(activeTab, 'materiales', mat.id, 'rangos', newRangos);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X size={10} />
                          </button>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[8px] text-slate-400 block mb-0.5">Esf Máx (+)</label>
                            <input 
                              type="number"
                              step="0.25"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              value={r.esf?.[0] ?? 6}
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                const newRangos = [...(mat.rangos || [{ esf: [6, -10], cil: 2 }])];
                                newRangos[idx] = { ...r, esf: [val, r.esf?.[1] ?? -10] };
                                updateItem(activeTab, 'materiales', mat.id, 'rangos', newRangos);
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-slate-400 block mb-0.5">Esf Mín (-)</label>
                            <input 
                              type="number"
                              step="0.25"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              value={r.esf?.[1] ?? -10}
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                const newRangos = [...(mat.rangos || [{ esf: [6, -10], cil: 2 }])];
                                newRangos[idx] = { ...r, esf: [r.esf?.[0] ?? 6, val] };
                                updateItem(activeTab, 'materiales', mat.id, 'rangos', newRangos);
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-slate-400 block mb-0.5">Cil Máx</label>
                            <input 
                              type="number"
                              step="0.25"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              value={r.cil ?? 2}
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                const newRangos = [...(mat.rangos || [{ esf: [6, -10], cil: 2 }])];
                                newRangos[idx] = { ...r, cil: val };
                                updateItem(activeTab, 'materiales', mat.id, 'rangos', newRangos);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selección de Tratamientos Permitidos */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-2">Tratamientos Permitidos</label>
                  <div className="flex flex-wrap gap-2">
                    {catalogo[activeTab].tratamientos.map(trat => {
                      const isChecked = !mat.tratamientosPermitidos || mat.tratamientosPermitidos.includes(trat.id);
                      return (
                        <button
                          key={trat.id}
                          onClick={() => toggleTratamiento(activeTab, mat.id, trat.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${isChecked ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-400'}`}
                        >
                          {trat.nombre}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 italic">* Si todos están marcados (o ninguno), se muestran todos por defecto.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRATAMIENTOS */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Tratamientos</h3>
            <button onClick={() => addItem(activeTab, 'tratamientos')} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-xs font-bold">
              <Plus size={16} /> Agregar
            </button>
          </div>
          <div className="space-y-4">
            {catalogo[activeTab].tratamientos.map(trat => (
              <div key={trat.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-sm font-bold"
                    value={trat.nombre}
                    onChange={(e) => updateItem(activeTab, 'tratamientos', trat.id, 'nombre', e.target.value)}
                  />
                  <button onClick={() => removeItem(activeTab, 'tratamientos', trat.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400">Precio Adicional ($)</label>
                  <input 
                    type="number"
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                    value={isNaN(trat.precio) ? "" : trat.precio}
                    onChange={(e) => updateItem(activeTab, 'tratamientos', trat.id, 'precio', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    )}
  </div>

      <div className="bg-slate-900 p-6 flex justify-end items-center gap-4">
        <p className="text-slate-400 text-xs mr-auto flex items-center gap-2">
          <Info size={14} />
          {lastSync ? `Última sincronización: ${lastSync}` : 'Los cambios se aplican instantáneamente en la sesión actual.'}
        </p>
        <button 
          onClick={onSave}
          disabled={isSyncing}
          className={`bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSyncing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <CloudUpload size={18} />
          )}
          {isSyncing ? 'Sincronizando...' : 'Sincronizar con la Nube'}
        </button>
      </div>
    </motion.div>
  );
}
