/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Calculator, 
  Settings, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Save,
  Search,
  ChevronRight,
  Info,
  Star,
  Maximize2,
  Layers,
  Zap,
  FileText,
  MessageSquare,
  MessageCircle,
  ArrowRightLeft,
  RefreshCw,
  Sparkles,
  Sun,
  Monitor,
  ShieldCheck,
  CloudUpload,
  X,
  Users,
  Download,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './lib/supabase';

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
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
    .format(val)
    .replace(/\u00a0/g, ' ');
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
  const level = indice >= 1.67 ? 5 : indice >= 1.6 ? 4 : indice >= 1.56 ? 3 : indice >= 1.53 ? 2 : 1;
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

const InputReceta = ({ label, ojo, campo, value, onChange, readOnly = false }: { label: string, ojo: string, campo: string, value: any, onChange: (ojo: string, campo: string, val: string) => void, readOnly?: boolean }) => {
  const [localValue, setLocalValue] = useState(value?.toString() || "");

  useEffect(() => {
    setLocalValue(value?.toString() || "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    let val = e.target.value;
    
    // Permitir solo números, puntos, comas y signos iniciales
    if (campo === 'eje') {
      val = val.replace(/[^0-9]/g, '');
      if (parseInt(val) > 180) val = "180";
    } else {
      val = val.replace(/[^0-9.,+-]/g, '');
      // Asegurar que el signo solo esté al principio
      if (val.length > 1) {
        const firstChar = val[0];
        const rest = val.slice(1).replace(/[+-]/g, '');
        val = firstChar + rest;
      }
    }
    
    setLocalValue(val);
    onChange(ojo, campo, val);
  };

  const handleBlur = () => {
    if (readOnly || localValue === "") return;
    
    if (campo !== 'eje') {
      let num = parseFloat(localValue.replace(',', '.'));
      if (!isNaN(num)) {
        // Formatear a 2 decimales con signo
        const sign = num > 0 ? "+" : num < 0 ? "" : "";
        const formatted = sign + num.toFixed(2);
        setLocalValue(formatted);
        onChange(ojo, campo, formatted);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</label>
      <input 
        type="text" 
        inputMode={campo === 'eje' ? "numeric" : "decimal"}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        placeholder={campo === 'eje' ? "0°" : "0.00"}
        className={`bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${readOnly ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      />
    </div>
  );
};

const AnnouncementBar = ({ announcement }: { announcement: any }) => {
  if (!announcement || !announcement.is_active) return null;

  const isUrgent = announcement.priority === 'urgent';

  return (
    <div className={`${isUrgent ? 'bg-red-600' : 'bg-indigo-600'} text-white py-2 px-4 overflow-hidden relative z-50`}>
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
        {isUrgent ? <AlertTriangle size={16} className="animate-pulse" /> : <Sparkles size={16} />}
        <div className="whitespace-nowrap overflow-hidden">
          <motion.p
            animate={{ x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm font-bold uppercase tracking-wider inline-block"
          >
            {announcement.content}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  // --- ESTADOS ---
  const [catalogo, setCatalogo] = useState<any>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(true);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState<{ id?: number, content: string, is_active: boolean, priority: string } | null>(null);

  // --- EFECTOS ---
  const fetchPresupuestos = async () => {
    try {
      console.log("Iniciando fetch de presupuestos...");
      const { data, error } = await supabase
        .from('presupuestos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error en fetchPresupuestos:", error);
        throw error;
      }
      console.log("Presupuestos recuperados exitosamente:", data?.length || 0);
      setPresupuestos(data || []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  useEffect(() => {
    fetchCatalogo();
    fetchPresupuestos();
    fetchSucursales();
    fetchCondicionesPago();
    fetchAnnouncement();

    // Suscripción en tiempo real para notificaciones
    const channel = supabase
      .channel('announcements_changes')
      .on('postgres_changes', { event: '*', table: 'announcements', schema: 'public' }, (payload) => {
        if (payload.new) {
          setAnnouncement(payload.new as any);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.warn("No se pudo cargar la notificación, es posible que la tabla no exista aún.");
        return;
      }
      if (data) {
        setAnnouncement(data);
      }
    } catch (error) {
      console.error("Error fetching announcement:", error);
    }
  };

  const saveAnnouncement = async (newAnnouncement: any) => {
    try {
      const { id, ...rest } = newAnnouncement;
      let error;
      if (id) {
        const { error: err } = await supabase
          .from('announcements')
          .update(rest)
          .eq('id', id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('announcements')
          .insert([rest]);
        error = err;
      }

      if (error) throw error;
      setAnnouncement(newAnnouncement);
      alert("Notificación guardada con éxito.");
      fetchAnnouncement();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Error al guardar la notificación.");
    }
  };

  const fetchCondicionesPago = async () => {
    try {
      const { data, error } = await supabase
        .from('condiciones_pago')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        // Si la tabla no existe o hay error, mantenemos los defaults
        console.warn("No se pudieron cargar las condiciones de pago, usando defaults.");
        return;
      }
      if (data && data.length > 0) {
        setCondicionesPago(data.map(d => d.nombre));
      }
    } catch (error) {
      console.error("Error fetching payment conditions:", error);
    }
  };

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

  const resetForm = () => {
    setCliente({ nombre: "", contacto: "" });
    setVendedor("");
    setReceta({
      od: { esf: 0, cil: 0, eje: 0 },
      oi: { esf: 0, cil: 0, eje: 0 },
      add: 0,
      altura: 0
    });
    setMaterialSelId("");
    setTratamientoSelId("");
    setCostoArmazon(0);
    setDetalleArmazon("");
    setDescuento(0);
    setTipoDescuento('porcentaje');
    setCondicionDescuento("Efectivo");
    setFiltroBlueActivo(false);
    setCompararCon(null);
    setShowComparator(false);
    setConceptos([]);
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
        receta: { ...receta, conceptos: conceptos }
      }]);

      if (error) {
        console.error("Supabase Error:", error);
        alert(`Error al guardar: ${error.message}\nVerifica que la tabla 'presupuestos' exista con las columnas correctas.`);
        throw error;
      }
      fetchPresupuestos(); // Actualizar la lista local
      return true;
    } catch (error: any) {
      console.error("Error saving budget:", error);
      if (!error.message) alert("Error de conexión con la base de datos.");
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  const sendToWhatsApp = () => {
    if (!cliente.contacto) {
      alert("Por favor, ingresa un número de contacto para el cliente.");
      return;
    }

    if (!sucursalSel) {
      alert("Por favor, selecciona una sucursal para incluir los datos de contacto en el mensaje.");
      setShowSucursalModal(true);
      return;
    }

    // Limpiar el número (quitar espacios, guiones, etc)
    const phone = cliente.contacto.replace(/\D/g, '');
    
    const message = `*Óptica SCHELLHAS*\n\n` +
      `Hola *${cliente.nombre || 'cliente'}*, te adjuntamos el presupuesto por un total de *${formatCurrency(precioFinal)}*\n\n` +
      `Podés ver el detalle del mismo abajo. Si tenés alguna duda o consulta, solo respondé a este mensaje.\n\n` +
      `Sucursal: ${sucursalSel.direccion || 'Córdoba 1185'}\n` +
      `¡Te esperamos!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const Logo = () => (
    <div className="flex items-center gap-3">
      <div className="bg-black px-6 py-3 rounded-sm shadow-xl">
        <span className="text-3xl font-serif font-medium tracking-[0.15em] text-white">SCHELLHAS</span>
      </div>
    </div>
  );

  const saveCatalogo = async (catalogoOverride?: any) => {
    // Evitar que se guarde un objeto de evento de React por error
    if (catalogoOverride && catalogoOverride.nativeEvent) {
      catalogoOverride = undefined;
    }
    const targetCatalogo = catalogoOverride || catalogo;
    if (!targetCatalogo || Object.keys(targetCatalogo).length === 0) return;
    setIsSyncing(true);
    try {
      // 1. Clear existing materials, treatments and sucursales
      // Usamos filtros que aseguren borrar todo independientemente del tipo de ID
      await supabase.from('materiales').delete().not('id', 'is', null);
      await supabase.from('tratamientos').delete().not('id', 'is', null);
      await supabase.from('sucursales').delete().not('id', 'is', null);
      
      try {
        // Borramos categorías que ya no existen en el catálogo actual
        const currentCatNames = Object.keys(targetCatalogo);
        if (currentCatNames.length > 0) {
          await supabase.from('categorias').delete().not('nombre', 'in', currentCatNames);
        } else {
          await supabase.from('categorias').delete().not('id', 'is', null);
        }
      } catch (e) {
        console.warn("Error clearing categories:", e);
      }
      
      try {
        await supabase.from('condiciones_pago').delete().not('id', 'is', null);
      } catch (e) {
        console.warn("Error clearing payment conditions:", e);
      }

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

      // Categorías (usamos upsert para evitar errores de duplicados y actualizar orden)
      const catsToInsert = Object.keys(targetCatalogo).map((name, index) => ({
        nombre: name,
        orden: index
      }));
      if (catsToInsert.length > 0) {
        const { error: cErr } = await supabase.from('categorias').upsert(catsToInsert, { onConflict: 'nombre' });
        if (cErr) throw cErr;
      }

      // Condiciones de Pago
      if (condicionesPago.length > 0) {
        const condsToInsert = condicionesPago.map(c => ({ nombre: c }));
        try {
          const { error: cErr } = await supabase.from('condiciones_pago').upsert(condsToInsert, { onConflict: 'nombre' });
          if (cErr) console.warn("Error saving payment conditions:", cErr);
        } catch (e) {
          console.warn("Error saving payment conditions:", e);
        }
      }

      for (const [catName, data] of Object.entries(targetCatalogo)) {
        const catData = data as any;
        const materialsToInsert = (catData.materiales || []).map((m: any) => {
          const { id, created_at, sinGarantia, incluyeBlue, ofreceBlue, precioBlue, tratamientosPermitidos, ...rest } = m;
          return { 
            ...rest, 
            categoria_nombre: catName,
            sin_garantia: sinGarantia || false,
            incluye_blue: incluyeBlue || false,
            ofrece_blue: ofreceBlue || false,
            precio_blue: precioBlue || 0,
            tratamientos_permitidos: tratamientosPermitidos || [],
            garantia: m.garantia || ""
          };
        });

        const treatmentsToInsert = (catData.tratamientos || []).map((t: any) => {
          const { id, created_at, ...rest } = t;
          return { ...rest, categoria_nombre: catName, garantia: t.garantia || "" };
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
    { id: '1', nombre: 'Sucursal Central', direccion: 'Av. Principal 123', telefono: '4444-5555', qr_code: '' },
    { id: '2', nombre: 'Sucursal Norte', direccion: 'Calle Norte 456', telefono: '4444-6666', qr_code: '' },
    { id: '3', nombre: 'Sucursal Sur', direccion: 'Ruta Sur Km 10', telefono: '4444-7777', qr_code: '' }
  ]);
  const [sucursalSel, setSucursalSel] = useState<any>(null);
  const [showSucursalModal, setShowSucursalModal] = useState(false);

  // Condiciones de Pago
  const [condicionesPago, setCondicionesPago] = useState<string[]>(["Efectivo", "Debito", "6 Cuotas s/i", "Prepaga OSDE", "Prepaga Swiss"]);

  // Simulador de Tratamientos
  const [showSimulador, setShowSimulador] = useState(true);
  const [enlargedSim, setEnlargedSim] = useState<'beneficios' | 'espesor' | 'amplitud' | null>(null);
  const [modoCliente, setModoCliente] = useState(false);
  const simuladorRef = useRef<HTMLDivElement>(null);
  const [simulacionActiva, setSimulacionActiva] = useState<string | null>(null);
  const [colorFoto, setColorFoto] = useState<'gris' | 'marron' | 'verde'>('gris');
  const [vistaEspesor, setVistaEspesor] = useState<'perfil' | 'perfil_marco'>('perfil');
  const [sliderPos, setSliderPos] = useState(50);
  const [disenoSel, setDisenoSel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Descuentos y Promociones
  const [descuento, setDescuento] = useState(0);
  const [tipoDescuento, setTipoDescuento] = useState<'porcentaje' | 'monto'>('porcentaje');
  const [condicionDescuento, setCondicionDescuento] = useState("Efectivo");

  // Información del Cliente
  const [cliente, setCliente] = useState({ nombre: "", contacto: "" });
  const [vendedor, setVendedor] = useState("");
  const [conceptos, setConceptos] = useState<any[]>([]);

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
    return catalogo[categoriaSel]?.materiales?.find((m: any) => m.id === materialSelId);
  }, [catalogo, categoriaSel, materialSelId]);

  const tratamientoActual = useMemo(() => {
    return catalogo[categoriaSel]?.tratamientos?.find((t: any) => t.id === tratamientoSelId);
  }, [catalogo, categoriaSel, tratamientoSelId]);

  const tratamientosFiltrados = useMemo(() => {
    const todos = catalogo[categoriaSel]?.tratamientos || [];
    if (!materialActual || !materialActual.tratamientosPermitidos || materialActual.tratamientosPermitidos.length === 0) return todos;
    // Soporta tanto IDs (legacy) como Nombres (para estabilidad post-sync)
    return todos.filter((t: any) => 
      materialActual.tratamientosPermitidos.includes(t.id) || 
      materialActual.tratamientosPermitidos.includes(t.nombre)
    );
  }, [catalogo, categoriaSel, materialActual]);

  const subtotal = useMemo(() => {
    const totalConceptos = conceptos.reduce((acc, item) => acc + item.precio, 0);
    const pMat = materialActual?.precio || 0;
    const pTrat = tratamientoActual?.precio || 0;
    const pArm = parseFloat(costoArmazon.toString()) || 0;
    const pBlue = (filtroBlueActivo && materialActual?.ofreceBlue && !materialActual?.incluyeBlue) ? (materialActual?.precioBlue || 8000) : 0;
    
    // If we have selected items in the "current" selection, we should probably add them too, 
    // but the user wants to "add them to budget", so maybe the "current" selection is just a scratchpad.
    // Let's make the subtotal be the sum of conceptos + current selection if any.
    return totalConceptos + pMat + pTrat + pArm + pBlue;
  }, [materialActual, tratamientoActual, costoArmazon, filtroBlueActivo, conceptos]);

  const addConcepto = (tipo: 'lente' | 'armazon' | 'otro') => {
    if (tipo === 'lente' && materialActual) {
      const pBlue = (filtroBlueActivo && materialActual.ofreceBlue && !materialActual.incluyeBlue) ? (materialActual.precioBlue || 8000) : 0;
      const nuevoItem = {
        id: Date.now().toString(),
        tipo: 'lente',
        nombre: `${categoriaSel} - ${materialActual.nombre}`,
        descripcion: `${tratamientoActual?.nombre || "Sin adicionales"}${filtroBlueActivo ? " + Filtro Blue" : ""}`,
        precio: materialActual.precio + (tratamientoActual?.precio || 0) + pBlue,
        detalles: {
          material: materialActual,
          tratamiento: tratamientoActual,
          filtroBlue: filtroBlueActivo,
          categoria: categoriaSel
        }
      };
      setConceptos([...conceptos, nuevoItem]);
      // Reset selection
      setMaterialSelId("");
      setTratamientoSelId("");
      setFiltroBlueActivo(false);
    } else if (tipo === 'armazon' && costoArmazon > 0) {
      const nuevoItem = {
        id: Date.now().toString(),
        tipo: 'armazon',
        nombre: "Armazón",
        descripcion: detalleArmazon || "Seleccionado en local",
        precio: costoArmazon
      };
      setConceptos([...conceptos, nuevoItem]);
      // Reset armazon
      setCostoArmazon(0);
      setDetalleArmazon("");
    }
  };

  const removeConcepto = (id: string) => {
    setConceptos(conceptos.filter(c => c.id !== id));
  };

  const montoDescuento = useMemo(() => {
    if (tipoDescuento === 'porcentaje') {
      return subtotal * (descuento / 100);
    } else {
      return descuento;
    }
  }, [subtotal, descuento, tipoDescuento]);

  const precioFinal = useMemo(() => {
    const totalConceptos = conceptos.reduce((acc, item) => acc + item.precio, 0);
    const pMat = materialActual?.precio || 0;
    const pTrat = tratamientoActual?.precio || 0;
    const pArm = parseFloat(costoArmazon.toString()) || 0;
    const pBlue = (filtroBlueActivo && materialActual?.ofreceBlue && !materialActual?.incluyeBlue) ? (materialActual?.precioBlue || 8000) : 0;
    const currentSubtotal = pMat + pTrat + pArm + pBlue;
    const total = totalConceptos + currentSubtotal;
    
    if (tipoDescuento === 'porcentaje') {
      return Math.max(0, total * (1 - descuento / 100));
    } else {
      return Math.max(0, total - descuento);
    }
  }, [conceptos, materialActual, tratamientoActual, costoArmazon, filtroBlueActivo, descuento, tipoDescuento]);

  // Helper para validar si una graduación entra en los rangos definidos
  const validateGraduationInRange = useCallback((ojo: any, rangos: any[]) => {
    let esf = parseFloat(ojo.esf?.toString().replace(',', '.')) || 0;
    let cil = parseFloat(ojo.cil?.toString().replace(',', '.')) || 0;
    
    // Transposición a cilindro negativo si es necesario para normalizar
    // Esto permite que el sistema acepte recetas en cilindro positivo
    if (cil > 0) {
      esf = esf + cil;
      cil = -cil;
    }
    
    const cilAbs = Math.abs(cil);
    const suma = Math.abs(esf) + cilAbs;
    
    const rangosList = rangos && rangos.length > 0 ? rangos : [{ esf: [6, -10], cil: 2.00, suma: 12 }];
    return rangosList.some((r: any) => {
      const maxEsf = Math.max(r.esf[0], r.esf[1]);
      const minEsf = Math.min(r.esf[0], r.esf[1]);
      const fitsEsf = esf <= maxEsf && esf >= minEsf;
      const fitsCil = cilAbs <= (r.cil ?? 2);
      const fitsSuma = !r.suma || suma <= r.suma;
      
      return fitsEsf && fitsCil && fitsSuma;
    });
  }, []);

  const checkMaterialFits = useCallback((mat: any) => {
    return validateGraduationInRange(receta.od, mat.rangos) && 
           validateGraduationInRange(receta.oi, mat.rangos);
  }, [receta, validateGraduationInRange]);

  const materialesFiltrados = useMemo(() => {
    const materiales = catalogo[categoriaSel]?.materiales || [];
    return materiales.filter(m => {
      const matchesDesign = categoriaSel !== "Multifocales" || !disenoSel || m.nombre.startsWith(disenoSel);
      const matchesSearch = !searchTerm || 
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.indice.toString().includes(searchTerm);
      const fitsGraduation = checkMaterialFits(m);
      return matchesDesign && matchesSearch && fitsGraduation;
    });
  }, [catalogo, categoriaSel, disenoSel, searchTerm, checkMaterialFits]);

  useEffect(() => {
    if (materialSelId && !materialesFiltrados.some(m => m.id === materialSelId)) {
      setMaterialSelId("");
    }
  }, [materialesFiltrados, materialSelId]);

  const requiereLaboratorio = useMemo(() => {
    const check = (ojo, nombreOjo) => {
      const fitsInRange = validateGraduationInRange(ojo, materialActual?.rangos);

      if (!fitsInRange) {
        return [`Graduación ${nombreOjo} fuera de los rangos estándar del material`];
      }
      
      return [];
    };

    const reasonsOD = check(receta.od, "OD");
    const reasonsOI = check(receta.oi, "OI");
    
    return [...reasonsOD, ...reasonsOI];
  }, [receta, materialActual, validateGraduationInRange]);

  const recomendaciones = useMemo(() => {
    if (!categoriaSel) return [];
    
    const materiales = catalogo[categoriaSel]?.materiales || [];
    const maxPower = Math.max(
      Math.abs(parseFloat(receta.od.esf) || 0) + (Math.abs(parseFloat(receta.od.cil) || 0)),
      Math.abs(parseFloat(receta.oi.esf) || 0) + (Math.abs(parseFloat(receta.oi.cil) || 0))
    );

    // Función para verificar si una graduación entra en los rangos de un material
    const fits = (mat) => {
      return validateGraduationInRange(receta.od, mat.rangos) && 
             validateGraduationInRange(receta.oi, mat.rangos);
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
    // Resetear selecciones al cambiar categoría o si el material actual ya no existe
    const currentCat = catalogo[categoriaSel] || { materiales: [], tratamientos: [] };
    if (!currentCat) return;

    const currentMaterial = Object.values(catalogo).flatMap((c: any) => c.materiales).find((m: any) => m.id === materialSelId);
    const currentTratamiento = Object.values(catalogo).flatMap((c: any) => c.tratamientos).find((t: any) => t.id === tratamientoSelId);

    const materialStillExists = currentCat.materiales.some((m: any) => m.id === materialSelId || m.nombre === currentMaterial?.nombre);
    const tratamientoStillExists = currentCat.tratamientos.some((t: any) => t.id === tratamientoSelId || t.nombre === currentTratamiento?.nombre);

    if (!materialStillExists) {
      setMaterialSelId(currentCat.materiales[0]?.id || "");
    } else if (currentMaterial && !currentCat.materiales.some(m => m.id === materialSelId)) {
      // Si existe por nombre pero cambió el ID (post-sync)
      const newMat = currentCat.materiales.find(m => m.nombre === currentMaterial.nombre);
      if (newMat) setMaterialSelId(newMat.id);
    }

    if (!tratamientoStillExists) {
      setTratamientoSelId(currentCat.tratamientos[0]?.id || "");
    } else if (currentTratamiento && !currentCat.tratamientos.some(t => t.id === tratamientoSelId)) {
      // Si existe por nombre pero cambió el ID (post-sync)
      const newTrat = currentCat.tratamientos.find(t => t.nombre === currentTratamiento.nombre);
      if (newTrat) setTratamientoSelId(newTrat.id);
    }
    
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
  const exportToPDF = async (sucursal: any) => {
    const doc = new jsPDF();
    
    // Header con nuevo Logo
    doc.setFillColor(0, 0, 0);
    doc.rect(20, 10, 60, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text("SCHELLHAS", 50, 18.5, { align: 'center' });

    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Presupuesto Óptico de Precisión", 20, 34);
    doc.text(new Date().toLocaleDateString(), 160, 20);

    // Sucursal Info
    if (sucursal) {
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`${sucursal.nombre}`, 20, 39);
      doc.text(`${sucursal.direccion} | Tel: ${sucursal.telefono}`, 20, 43);
    }

    // Cliente y Vendedor
    let currentY = 53;
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
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Receta del Paciente", 20, currentY);
    doc.setFont("helvetica", "normal");
    
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
      headStyles: { fillColor: [15, 23, 42] } // Slate-900
    });

    // Detalle Presupuesto
    const lastTable = (doc as any).lastAutoTable;
    const startY = (lastTable ? lastTable.finalY : currentY + 30) + 15;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Detalle del Presupuesto", 20, startY);
    doc.setFont("helvetica", "normal");

    const detalleData = [["Concepto", "Descripción", "Precio"]];

    // Agregar conceptos ya guardados
    conceptos.forEach(c => {
      detalleData.push([c.nombre, c.descripcion, formatCurrency(c.precio)]);
    });

    // Agregar selección actual si existe
    if (materialActual) {
      detalleData.push(["Lente", `${categoriaSel} - ${materialActual.nombre} (${materialActual.gama || 'Estándar'})`, formatCurrency(materialActual.precio)]);
      if (tratamientoActual) {
        detalleData.push(["Tratamiento", tratamientoActual.nombre, formatCurrency(tratamientoActual.precio)]);
      }
      if (filtroBlueActivo && materialActual.ofreceBlue && !materialActual.incluyeBlue) {
        detalleData.push(["Filtro Blue", "Protección luz azul", formatCurrency(materialActual.precioBlue || 8000)]);
      }
    }

    if (costoArmazon > 0) {
      detalleData.push(["Armazón", detalleArmazon || "Seleccionado en local", formatCurrency(costoArmazon)]);
    }

    if (materialActual?.sinGarantia) {
      detalleData.push(["Garantía Lente", "Sin Garantía", "-"]);
    } else if (materialActual?.garantia) {
      detalleData.push(["Garantía Lente", materialActual.garantia, "-"]);
    }
    if (tratamientoActual?.garantia) {
      detalleData.push(["Garantía Trat.", tratamientoActual.garantia, "-"]);
    }

    if (descuento > 0) {
      const descCalculado = montoDescuento;
      const descLabel = tipoDescuento === 'porcentaje' ? `${descuento}%` : formatCurrency(descuento);
      detalleData.push(["Descuento", `${descLabel} (${condicionDescuento || 'General'})`, `-${formatCurrency(descCalculado)}`]);
    }

    detalleData.push(["TOTAL", "", formatCurrency(precioFinal)]);

    autoTable(doc, {
      startY: startY + 5,
      head: [detalleData[0]],
      body: detalleData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }, // Slate-900
      columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } }
    });

    // QR Code y CTA en el pie de página
    if (sucursal && sucursal.qr_code) {
      const qrSize = 25;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      try {
        // Generar QR desde el link proporcionado
        const qrDataUrl = await QRCode.toDataURL(sucursal.qr_code, {
          margin: 1,
          width: 200,
          color: {
            dark: '#0f172a', // Slate-900
            light: '#ffffff'
          }
        });

        // Posicionar QR en la esquina inferior derecha
        const qrY = pageHeight - margin - qrSize;
        doc.addImage(qrDataUrl, 'PNG', pageWidth - margin - qrSize, qrY, qrSize, qrSize);
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42); // Slate-900
        doc.setFont("helvetica", "bold");
        doc.text("Escaneá aquí para señar", pageWidth - margin - qrSize - 2, qrY + 10, { align: 'right' });
        doc.text("tus lentes por WhatsApp", pageWidth - margin - qrSize - 2, qrY + 14, { align: 'right' });
      } catch (e) {
        console.warn("No se pudo generar el QR en el PDF:", e);
      }
    }

    // Beneficios
    const lastTable2 = (doc as any).lastAutoTable;
    let currentYPos = (lastTable2 ? lastTable2.finalY : startY + 50) + 15;
    
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Beneficios de su elección:", 20, currentYPos);
    doc.setFont("helvetica", "normal");
    currentYPos += 10;

    // 1. Beneficios de conceptos ya agregados
    conceptos.filter(c => c.tipo === 'lente').forEach((item) => {
      if (currentYPos > 270) { doc.addPage(); currentYPos = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${item.nombre}:`, 20, currentYPos);
      currentYPos += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      item.detalles.material.beneficios.forEach((b: string) => {
        if (currentYPos > 280) { doc.addPage(); currentYPos = 20; }
        doc.text(`• ${b}`, 25, currentYPos);
        currentYPos += 5;
      });
      currentYPos += 4; // Espacio entre lentes
    });

    // 2. Beneficios de la selección actual (si existe y no está en conceptos)
    if (materialActual) {
      if (currentYPos > 270) { doc.addPage(); currentYPos = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${categoriaSel} - ${materialActual.nombre}:`, 20, currentYPos);
      currentYPos += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      materialActual.beneficios.forEach((b: string) => {
        if (currentYPos > 280) { doc.addPage(); currentYPos = 20; }
        doc.text(`• ${b}`, 25, currentYPos);
        currentYPos += 5;
      });
      currentYPos += 4;
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Presupuesto válido por 15 días a partir de la fecha de emisión.", 20, currentYPos + 5);

    doc.save(`Presupuesto_OptiQuote_${new Date().getTime()}.pdf`);
  };

  const handleRecetaChange = (ojo, campo, valor) => {
    setReceta(prev => {
      // Si el campo es de primer nivel (como add o altura)
      if (ojo === campo) {
        return { ...prev, [ojo]: valor };
      }
      // Si es un campo anidado (od.esf, oi.cil, etc)
      return {
        ...prev,
        [ojo]: { ...prev[ojo], [campo]: valor }
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <AnnouncementBar announcement={announcement} />
      <div className="p-4 md:p-8">
        {/* Loading Overlay */}
      <AnimatePresence>
        {isSyncing && Object.keys(catalogo).length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-600 tracking-widest uppercase animate-pulse">Cargando Catálogo...</p>
          </motion.div>
        )}
      </AnimatePresence>
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
            {/* MODO CLIENTE TOGGLE */}
            <button 
              onClick={() => setModoCliente(!modoCliente)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${modoCliente ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Users size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{modoCliente ? 'Modo Cliente Activo' : 'Modo Vendedor'}</span>
            </button>

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
              condicionesPago={condicionesPago}
              setCondicionesPago={setCondicionesPago}
              announcement={announcement}
              setAnnouncement={setAnnouncement}
              saveAnnouncement={saveAnnouncement}
            />
          )
        ) : (
          <>
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
                    {modoCliente ? (
                      <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-bold">
                        {cliente.nombre || "Sin nombre"}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={cliente.nombre}
                        onChange={(e) => setCliente(prev => ({ ...prev, nombre: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ej: Juan Pérez"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Contacto (Tel/Email)</label>
                    {modoCliente ? (
                      <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium">
                        {cliente.contacto || "Sin contacto"}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={cliente.contacto}
                        onChange={(e) => setCliente(prev => ({ ...prev, contacto: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ej: 11 2345-6789"
                      />
                    )}
                  </div>
                  {!modoCliente && (
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
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* OJO DERECHO */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Ojo Derecho (OD)</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <InputReceta label="Esfera" ojo="od" campo="esf" value={receta.od.esf} onChange={handleRecetaChange} readOnly={modoCliente} />
                      <InputReceta label="Cilindro" ojo="od" campo="cil" value={receta.od.cil} onChange={handleRecetaChange} readOnly={modoCliente} />
                      <InputReceta label="Eje" ojo="od" campo="eje" value={receta.od.eje} onChange={handleRecetaChange} readOnly={modoCliente} />
                    </div>
                  </div>

                  {/* OJO IZQUIERDO */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Ojo Izquierdo (OI)</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <InputReceta label="Esfera" ojo="oi" campo="esf" value={receta.oi.esf} onChange={handleRecetaChange} readOnly={modoCliente} />
                      <InputReceta label="Cilindro" ojo="oi" campo="cil" value={receta.oi.cil} onChange={handleRecetaChange} readOnly={modoCliente} />
                      <InputReceta label="Eje" ojo="oi" campo="eje" value={receta.oi.eje} onChange={handleRecetaChange} readOnly={modoCliente} />
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
                        <InputReceta label="Adición (ADD)" ojo="add" campo="add" value={receta.add} onChange={handleRecetaChange} readOnly={modoCliente} />
                        {categoriaSel === "Ocupacionales" && (
                          <InputReceta label="Altura Pupilar" ojo="altura" campo="altura" value={receta.altura} onChange={handleRecetaChange} readOnly={modoCliente} />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* COSTO ARMAZÓN */}
                  <div className="mt-6 pt-6 border-t border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Detalle del Armazón</label>
                        {modoCliente ? (
                          <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium">
                            {detalleArmazon || "Sin especificar"}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            value={detalleArmazon}
                            onChange={(e) => setDetalleArmazon(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Ej: Ray-Ban Aviator / Propio"
                          />
                        )}
                      </div>
                      {!modoCliente && (
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
                      )}
                    </div>
                    {!modoCliente && (
                      <button 
                        onClick={() => addConcepto('armazon')}
                        disabled={costoArmazon <= 0}
                        className="mt-4 w-full bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-all disabled:opacity-50"
                      >
                        <Plus size={18} />
                        Agregar Armazón al Presupuesto
                      </button>
                    )}
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

                    {categoriaSel === "Multifocales" && (
                      <div className="mb-6 space-y-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">1. Elegir Diseño</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {Array.from(new Set((catalogo[categoriaSel]?.materiales || []).map((m: any) => m.nombre.split(' ').slice(0, 2).join(' ')))).map(diseno => (
                            <button
                              key={diseno}
                              onClick={() => {
                                setDisenoSel(diseno);
                                setMaterialSelId(""); // Reset material when design changes
                              }}
                              className={`px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all ${disenoSel === diseno ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}
                            >
                              {diseno}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {categoriaSel === "Multifocales" && disenoSel && (
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">2. Elegir Material / Índice</label>
                    )}

                    <div className="mb-4 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Buscar material o índice..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {materialesFiltrados.map(mat => (
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
                      {materialesFiltrados.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <AlertTriangle className="mx-auto text-slate-300 mb-3" size={32} />
                          <p className="text-sm font-bold text-slate-500">No se encontraron materiales disponibles</p>
                          <p className="text-[10px] text-slate-400 mt-1">Intenta con otra búsqueda o verifica que la graduación esté dentro de los rangos.</p>
                        </div>
                      )}
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
                    {!modoCliente && (
                      <button 
                        onClick={() => addConcepto('lente')}
                        disabled={!materialActual}
                        className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
                      >
                        <Plus size={20} />
                        Agregar Lente al Presupuesto
                      </button>
                    )}
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
                      <span className="text-slate-400">Subtotal:</span>
                      <span className="font-bold">{formatCurrency(subtotal)}</span>
                    </div>
                    {descuento > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-400">
                        <span>Descuento ({tipoDescuento === 'porcentaje' ? `${descuento}%` : formatCurrency(descuento)}):</span>
                        <span className="font-bold">-{formatCurrency(montoDescuento)}</span>
                      </div>
                    )}
                    
                    {/* SECCIÓN DESCUENTO */}
                    {!modoCliente && (
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
                            <div className="flex flex-wrap gap-1 mt-1">
                              {condicionesPago.map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => setCondicionDescuento(opt)}
                                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${condicionDescuento === opt ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-2">
                      <button 
                        onClick={() => setShowSucursalModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <FileText size={18} />
                        Exportar Presupuesto PDF
                      </button>

                      <button 
                        onClick={resetForm}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <RotateCcw size={18} />
                        Nuevo Presupuesto (Reset)
                      </button>
                      
                      {!modoCliente && (
                        <div className="flex gap-2">
                          <button 
                            onClick={async () => {
                              const success = await savePresupuesto();
                              if (success) {
                                await exportToPDF(sucursalSel);
                                alert("Presupuesto guardado en la nube y PDF descargado con éxito.");
                              }
                            }}
                            disabled={isSyncing}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                          >
                            {isSyncing ? (
                              <RefreshCw size={18} className="animate-spin" />
                            ) : (
                              <CloudUpload size={18} />
                            )}
                            Guardar y PDF
                          </button>
                          <button 
                            onClick={sendToWhatsApp}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                          >
                            <MessageCircle size={18} />
                            WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Decoración fondo */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl"></div>
              </motion.div>

              {/* GARANTÍA Y PESO (RECOMENDACIÓN) */}
              <div className="grid grid-cols-2 gap-4">
                {materialActual?.garantia && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Garantía</p>
                      <p className="text-xs font-bold text-slate-700">
                        {materialActual.garantia}
                      </p>
                    </div>
                  </div>
                )}
                <div className={`${!materialActual?.garantia ? 'col-span-2' : ''} bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3`}>
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

              {/* SIMULADOR DE TRATAMIENTOS INTERACTIVO REDISEÑADO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <Eye className="text-indigo-500" size={18} />
                    Simulador Visual de Beneficios
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        console.log("Abriendo simulador de beneficios");
                        setEnlargedSim('beneficios');
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Agrandar"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <button 
                      onClick={() => setShowSimulador(!showSimulador)}
                      className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                    >
                      {showSimulador ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {showSimulador && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div 
                        ref={simuladorRef}
                        className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-6 group cursor-ew-resize select-none"
                        onMouseDown={(e) => {
                          const handleMove = (clientX: number) => {
                            if (!simuladorRef.current) return;
                            const rect = simuladorRef.current.getBoundingClientRect();
                            const x = clientX - rect.left;
                            const pos = (x / rect.width) * 100;
                            setSliderPos(Math.min(95, Math.max(5, pos)));
                          };

                          handleMove(e.clientX);

                          const onMouseMove = (moveE: MouseEvent) => handleMove(moveE.clientX);
                          const onMouseUp = () => {
                            document.removeEventListener('mousemove', onMouseMove);
                            document.removeEventListener('mouseup', onMouseUp);
                          };
                          document.addEventListener('mousemove', onMouseMove);
                          document.addEventListener('mouseup', onMouseUp);
                        }}
                        onTouchStart={(e) => {
                          const handleMove = (clientX: number) => {
                            if (!simuladorRef.current) return;
                            const rect = simuladorRef.current.getBoundingClientRect();
                            const x = clientX - rect.left;
                            const pos = (x / rect.width) * 100;
                            setSliderPos(Math.min(95, Math.max(5, pos)));
                          };

                          handleMove(e.touches[0].clientX);

                          const onTouchMove = (moveE: TouchEvent) => handleMove(moveE.touches[0].clientX);
                          const onTouchEnd = () => {
                            document.removeEventListener('touchmove', onTouchMove);
                            document.removeEventListener('touchend', onTouchEnd);
                          };
                          document.addEventListener('touchmove', onTouchMove);
                          document.addEventListener('touchend', onTouchEnd);
                        }}
                      >
                        {/* Imagen de Fondo Dinámica según Tratamiento */}
                        <img 
                          src={
                            simulacionActiva === 'polarized' ? "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80" : // Lago con reflejos
                            simulacionActiva === 'ar' ? "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=800&q=80" : // Ciudad noche con luces
                            simulacionActiva === 'blue' ? "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80" : // Laptop/Pantalla
                            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" // Paisaje soleado para photo
                          } 
                          alt="Simulación" 
                          className="w-full h-full object-cover transition-all duration-700"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Capa de Efectos (Lo que el lente QUITA o CAMBIA) */}
                        <div className="absolute inset-0 overflow-hidden">
                          <div 
                            className="absolute inset-0 w-full h-full"
                            style={{ 
                              clipPath: `inset(0 ${100 - sliderPos}% 0 0)` 
                            }}
                          >
                            {/* Efecto Polarizado: Reflejos blancos intensos en el agua */}
                            {simulacionActiva === 'polarized' && (
                              <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                                <div className="absolute top-1/2 left-1/4 w-full h-1/3 bg-gradient-to-b from-transparent via-white/60 to-transparent rotate-[-10deg] blur-xl opacity-80" />
                                <div className="absolute top-1/3 right-1/4 w-1/2 h-1/4 bg-white/40 blur-2xl" />
                              </div>
                            )}

                            {/* Efecto AR: Destellos y halos de luces nocturnas molestos */}
                            {simulacionActiva === 'ar' && (
                              <div className="absolute inset-0">
                                {/* Halos de luces de autos/faroles */}
                                <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-yellow-200/40 rounded-full blur-3xl animate-pulse" />
                                <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-white/30 rounded-full blur-[60px]" />
                                <div className="absolute bottom-1/4 left-1/2 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl" />
                                {/* Reflejos tipo 'estrella' */}
                                <div className="absolute top-1/3 left-1/4 w-full h-[1px] bg-white/20 rotate-45 blur-sm" />
                                <div className="absolute top-1/3 left-1/4 w-full h-[1px] bg-white/20 -rotate-45 blur-sm" />
                              </div>
                            )}

                            {/* Efecto Blue: Pantalla con luz azul agresiva */}
                            {simulacionActiva === 'blue' && (
                              <div className="absolute inset-0 bg-blue-500/20 mix-blend-screen" />
                            )}

                            {/* Efecto Photo: Imagen clara (sol fuerte) */}
                            {simulacionActiva === 'photo' && (
                              <div className="absolute inset-0 bg-white/10 mix-blend-soft-light" />
                            )}
                          </div>

                          {/* Lado con TRATAMIENTO (Derecha del slider) */}
                          <div 
                            className="absolute inset-0 w-full h-full"
                            style={{ 
                              clipPath: `inset(0 0 0 ${sliderPos}%)` 
                            }}
                          >
                            {/* Polarizado: Visión nítida, colores profundos, sin reflejos */}
                            {simulacionActiva === 'polarized' && (
                              <div className="absolute inset-0 bg-teal-900/10 mix-blend-multiply transition-all" />
                            )}

                            {/* AR: Visión limpia y nítida */}
                            {simulacionActiva === 'ar' && (
                              <div className="absolute inset-0 bg-black/10" />
                            )}

                            {/* Blue: Tono cálido y descansado (ámbar sutil) */}
                            {simulacionActiva === 'blue' && (
                              <div className="absolute inset-0 bg-orange-100/20 mix-blend-multiply" />
                            )}

                            {/* Photo: Oscurecimiento natural y sutil */}
                            {simulacionActiva === 'photo' && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.75 }}
                                className={`absolute inset-0 transition-colors duration-1000 ${
                                  colorFoto === 'gris' ? 'bg-slate-800/70 mix-blend-multiply' : 
                                  colorFoto === 'marron' ? 'bg-[#5d4037]/60 mix-blend-multiply' : 
                                  'bg-[#2e7d32]/50 mix-blend-multiply'
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Slider Control */}
                        <div 
                          className="absolute inset-y-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20 pointer-events-none"
                          style={{ left: `${sliderPos}%` }}
                        >
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center">
                            <div className="flex gap-0.5">
                              <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
                              <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
                            </div>
                          </div>
                        </div>

                        {/* Etiquetas */}
                        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest pointer-events-none">Sin Tratamiento</div>
                        <div className="absolute top-4 right-4 bg-indigo-600/60 backdrop-blur-sm text-white text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest pointer-events-none">Con {
                          simulacionActiva === 'ar' ? 'Antirreflex' : 
                          simulacionActiva === 'blue' ? 'Filtro Blue' :
                          simulacionActiva === 'photo' ? 'Fotosensible' : 
                          simulacionActiva === 'polarized' ? 'Polarizado' : 'Tratamiento'
                        }</div>

                        <div 
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-[9px] px-3 py-1.5 rounded-full flex items-center gap-3"
                        >
                          <span className="opacity-70">Desliza para comparar</span>
                          {simulacionActiva === 'photo' && (
                            <div className="flex gap-2 border-l border-white/20 pl-3">
                              <button onClick={() => setColorFoto('gris')} className={`w-3 h-3 rounded-full bg-slate-500 border border-white/40 ${colorFoto === 'gris' ? 'ring-2 ring-indigo-400' : ''}`} />
                              <button onClick={() => setColorFoto('marron')} className={`w-3 h-3 rounded-full bg-[#8d6e63] border border-white/40 ${colorFoto === 'marron' ? 'ring-2 ring-indigo-400' : ''}`} />
                              <button onClick={() => setColorFoto('verde')} className={`w-3 h-3 rounded-full bg-[#66bb6a] border border-white/40 ${colorFoto === 'verde' ? 'ring-2 ring-indigo-400' : ''}`} />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        <button 
                          onClick={() => setSimulacionActiva(null)}
                          className={`p-2 rounded-xl border text-center transition-all ${simulacionActiva === null ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <div className="text-[10px] font-bold text-slate-600">Original</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('ar')}
                          className={`p-2 rounded-xl border text-center transition-all ${simulacionActiva === 'ar' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <ShieldCheck size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">Anti-Reflex</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('blue')}
                          className={`p-2 rounded-xl border text-center transition-all ${simulacionActiva === 'blue' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <Monitor size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">Blue Cut</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('photo')}
                          className={`p-2 rounded-xl border text-center transition-all ${simulacionActiva === 'photo' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <Sun size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">Photo</div>
                        </button>
                        <button 
                          onClick={() => setSimulacionActiva('polarized')}
                          className={`p-2 rounded-xl border text-center transition-all ${simulacionActiva === 'polarized' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:bg-slate-50'}`}
                        >
                          <Zap size={14} className="mx-auto mb-1 text-indigo-500" />
                          <div className="text-[10px] font-bold">Polarizado</div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* COMPARADOR DE ESPESORES REDISEÑADO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                    <Layers className="text-indigo-500" size={18} />
                    Simulador de Espesor Real
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        console.log("Abriendo simulador de espesor");
                        setEnlargedSim('espesor');
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Agrandar"
                    >
                      <Maximize2 size={16} />
                    </button>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setVistaEspesor('perfil')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${vistaEspesor === 'perfil' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        LENTE
                      </button>
                      <button 
                        onClick={() => setVistaEspesor('perfil_marco')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${vistaEspesor === 'perfil_marco' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >
                        EN ARMAZÓN
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8 py-2">
                  {vistaEspesor === 'perfil' ? (
                    <div className="grid grid-cols-2 gap-8">
                      {/* Referencia 1.50 */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Índice 1.50</p>
                          <p className="text-[8px] text-slate-400 font-bold">Material Convencional</p>
                        </div>
                        <div className="h-32 flex items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 relative">
                          <div className="relative w-16 h-24 flex items-center justify-center">
                            {/* Lente 1.50 - Grueso */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-white to-slate-200 rounded-[35%] border-x-[14px] border-slate-300/80 shadow-inner" />
                            <div className="z-10 w-[1px] h-full bg-slate-300/20" />
                          </div>
                          <div className="absolute -bottom-2 bg-slate-200 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-full">GROSOR ESTÁNDAR</div>
                        </div>
                      </div>
                      
                      {/* Selección Actual */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Índice {materialActual?.indice.toFixed(2)}</p>
                          <p className="text-[8px] text-indigo-400 font-bold">Tu Selección Actual</p>
                        </div>
                        <div className="h-32 flex items-center justify-center bg-indigo-50/30 rounded-3xl border border-indigo-100 relative">
                          <div className="relative w-16 h-24 flex items-center justify-center">
                            {/* Lente Variable */}
                            <motion.div 
                              animate={{ 
                                borderLeftWidth: `${Math.max(2, (2.1 - (materialActual?.indice || 1.5)) * 14)}px`,
                                borderRightWidth: `${Math.max(2, (2.1 - (materialActual?.indice || 1.5)) * 14)}px`,
                                scaleX: materialActual?.indice > 1.5 ? 0.85 : 1
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-indigo-200 via-white to-indigo-200 rounded-[35%] border-indigo-300/80 shadow-inner transition-all duration-700"
                            />
                            <div className="z-10 w-[1px] h-full bg-indigo-300/20" />
                          </div>
                          <motion.div 
                            animate={{ scale: materialActual?.indice > 1.5 ? [1, 1.1, 1] : 1 }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -bottom-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg"
                          >
                            {materialActual?.indice > 1.5 ? `${((1 - (2.1 - materialActual.indice) / (2.1 - 1.5)) * 100).toFixed(0)}% MÁS DELGADO` : 'MISMO GROSOR'}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-8">
                      {/* Referencia Marco 1.50 */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Índice 1.50</p>
                        </div>
                        <div className="h-32 flex items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 relative">
                          {/* Armazón de Perfil */}
                          <div className="w-24 h-12 bg-slate-800 rounded-md relative flex items-center justify-center border-y-4 border-slate-900 shadow-xl">
                            {/* Cristal Sobresaliendo */}
                            <div className="absolute -top-4 -bottom-4 w-20 bg-slate-200/60 border-y-2 border-slate-300 rounded-full shadow-inner" />
                            <span className="z-10 text-[7px] font-black text-white/40 uppercase">MARCO</span>
                          </div>
                          <div className="absolute bottom-2 text-[8px] font-bold text-red-400 uppercase">Sobresale Mucho</div>
                        </div>
                      </div>

                      {/* Selección Marco Actual */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Índice {materialActual?.indice.toFixed(2)}</p>
                        </div>
                        <div className="h-32 flex items-center justify-center bg-indigo-50/30 rounded-3xl border border-indigo-100 relative">
                          <div className="w-24 h-12 bg-slate-800 rounded-md relative flex items-center justify-center border-y-4 border-slate-900 shadow-xl">
                            {/* Cristal Variable */}
                            <motion.div 
                              animate={{ 
                                top: `-${Math.max(0, (1.9 - (materialActual?.indice || 1.5)) * 10)}px`,
                                bottom: `-${Math.max(0, (1.9 - (materialActual?.indice || 1.5)) * 10)}px`,
                                opacity: 0.8
                              }}
                              className="absolute w-20 bg-indigo-100/70 border-y-2 border-indigo-200 rounded-full shadow-inner transition-all duration-700"
                            />
                            <span className="z-10 text-[7px] font-black text-white/40 uppercase">MARCO</span>
                          </div>
                          <div className="absolute bottom-2 text-[8px] font-bold text-emerald-500 uppercase">
                            {materialActual?.indice >= 1.67 ? 'Estética Perfecta' : 'Mejor Estética'}
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
                      <p className="text-lg font-black text-slate-700">
                        -{materialActual?.indice > 1.5 ? Math.round(((1 - (2.1 - materialActual.indice) / (2.1 - 1.5)) * 100) * 0.6) : 0}%
                      </p>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100"></div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Estética</p>
                      <div className="mt-1">{renderThicknessIndex(materialActual?.indice)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COMPARADOR DE CAMPOS VISUALES (Solo Multifocales) */}
              {categoriaSel === "Multifocales" && materialActual?.campos && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                        <Maximize2 className="text-indigo-500" size={18} />
                        Simulador de Amplitud Visual
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Comparativa de campos visuales y zonas de confort</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          console.log("Abriendo simulador de amplitud");
                          setEnlargedSim('amplitud');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Agrandar"
                      >
                        <Maximize2 size={16} />
                      </button>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tecnología</span>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                          {materialActual.tallado || "Estándar"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-8">
                    {/* Lente Tradicional */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diseño Básico</p>
                      </div>
                      <div className="relative aspect-[3/4] bg-slate-200 rounded-[3rem] border-4 border-slate-300 overflow-hidden shadow-inner group">
                        {/* Escena de Fondo (Calle/Ciudad para Lejos, Oficina para Inter, Lectura para Cerca) */}
                        <div className="absolute inset-0 flex flex-col">
                          <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=400&q=80" className="h-1/3 w-full object-cover grayscale opacity-40 blur-[2px]" alt="Lejos" referrerPolicy="no-referrer" />
                          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" className="h-1/3 w-full object-cover grayscale opacity-40 blur-[4px]" alt="Inter" referrerPolicy="no-referrer" />
                          <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80" className="h-1/3 w-full object-cover grayscale opacity-40 blur-[3px]" alt="Cerca" referrerPolicy="no-referrer" />
                        </div>
                        
                        {/* Zonas de Aberración (Laterales) - Muy pronunciadas */}
                        <div className="absolute inset-y-0 left-0 w-[35%] bg-slate-800/50 backdrop-blur-2xl z-10 border-r border-white/10" />
                        <div className="absolute inset-y-0 right-0 w-[35%] bg-slate-800/50 backdrop-blur-2xl z-10 border-l border-white/10" />
                        
                        {/* Canales de Visión Estrechos */}
                        <div className="absolute inset-0 flex flex-col items-center py-6 z-20">
                          <div className="w-1/3 h-1/4 bg-white/20 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-[7px] font-black text-white uppercase">Lejos</span>
                          </div>
                          <div className="w-[10%] h-1/4 bg-white/20 rounded-full border border-white/30 my-4 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-[7px] font-black text-white uppercase rotate-90">Inter</span>
                          </div>
                          <div className="w-1/4 h-1/4 bg-white/20 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-[7px] font-black text-white uppercase">Cerca</span>
                          </div>
                        </div>
                        <div className="absolute bottom-4 inset-x-0 text-center z-30">
                          <span className="text-[8px] font-black text-white/60 uppercase bg-black/20 px-2 py-1 rounded-full backdrop-blur-md">Efecto Balanceo</span>
                        </div>
                      </div>
                    </div>

                    {/* Lente Seleccionado */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Tu Selección</p>
                      </div>
                      <div className="relative aspect-[3/4] bg-indigo-100 rounded-[3rem] border-4 border-indigo-500 overflow-hidden shadow-2xl shadow-indigo-200">
                        {/* Escena de Fondo - Nítida */}
                        <div className="absolute inset-0 flex flex-col">
                          <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=400&q=80" className="h-1/3 w-full object-cover opacity-90" alt="Lejos" referrerPolicy="no-referrer" />
                          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80" className="h-1/3 w-full object-cover opacity-90" alt="Inter" referrerPolicy="no-referrer" />
                          <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80" className="h-1/3 w-full object-cover opacity-90" alt="Cerca" referrerPolicy="no-referrer" />
                        </div>
                        
                        {/* Zonas de Aberración Reducidas Dinámicamente */}
                        <motion.div 
                          animate={{ width: `${(1 - ((materialActual.campos.inter || 3) / 5)) * 35}%` }}
                          transition={{ type: "spring", stiffness: 100 }}
                          className="absolute inset-y-0 left-0 bg-indigo-900/20 backdrop-blur-[2px] z-10 border-r border-white/20" 
                        />
                        <motion.div 
                          animate={{ width: `${(1 - ((materialActual.campos.inter || 3) / 5)) * 35}%` }}
                          transition={{ type: "spring", stiffness: 100 }}
                          className="absolute inset-y-0 right-0 bg-indigo-900/20 backdrop-blur-[1px] z-10 border-l border-white/20" 
                        />
                        
                        {/* Canales de Visión Ampliados */}
                        <div className="absolute inset-0 flex flex-col items-center py-6 z-20">
                          <motion.div 
                            animate={{ width: `${( (materialActual.campos.lejos || 3) / 5) * 95}%` }}
                            className="h-1/4 bg-white/40 rounded-full border border-white/60 flex items-center justify-center shadow-lg backdrop-blur-[1px]"
                          >
                            <span className="text-[8px] font-black text-indigo-950 uppercase">Lejos</span>
                          </motion.div>
                          <motion.div 
                            animate={{ width: `${( (materialActual.campos.inter || 3) / 5) * 85}%` }}
                            className="h-1/4 bg-white/40 rounded-full border border-white/60 my-4 flex items-center justify-center shadow-lg backdrop-blur-[1px]"
                          >
                            <span className="text-[8px] font-black text-indigo-950 uppercase">Intermedia</span>
                          </motion.div>
                          <motion.div 
                            animate={{ width: `${( (materialActual.campos.cerca || 3) / 5) * 90}%` }}
                            className="h-1/4 bg-white/40 rounded-full border border-white/60 flex items-center justify-center shadow-lg backdrop-blur-[1px]"
                          >
                            <span className="text-[8px] font-black text-indigo-950 uppercase">Cerca</span>
                          </motion.div>
                        </div>
                        <div className="absolute bottom-4 inset-x-0 text-center z-30">
                          <span className="text-[8px] font-black text-indigo-100 uppercase bg-indigo-600/80 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">Visión Panorámica</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leyenda de Amplitud con Estrellas */}
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {['lejos', 'inter', 'cerca'].map((zona) => (
                      <div key={zona} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-tighter">{zona === 'inter' ? 'Intermedia' : zona}</p>
                        <div className="flex justify-center">
                          {renderStars(materialActual.campos[zona] || 0)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 text-white mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                          <Sparkles size={18} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest">Tecnología {materialActual.tallado || "Digital"}</p>
                      </div>
                      <p className="text-[11px] text-indigo-50 leading-relaxed font-medium">
                        Este diseño optimiza la superficie del lente para reducir las aberraciones laterales en un <span className="text-white font-black">{( (materialActual.campos.inter || 1) * 18 )}%</span>, eliminando la sensación de mareo y permitiendo una adaptación inmediata.
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

              {/* CARRITO / CONCEPTOS DEL PRESUPUESTO */}
              {(conceptos.length > 0 || materialActual || costoArmazon > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                      <FileText size={18} className="text-slate-500" />
                      Items Agregados al Presupuesto
                    </h3>
                    {conceptos.length > 0 && (
                      <button 
                        onClick={() => setConceptos([])}
                        className="text-[10px] font-bold text-red-500 uppercase hover:underline"
                      >
                        Limpiar Todo
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {conceptos.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                          <p className="text-[10px] text-slate-500">{item.descripcion}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-black text-slate-700">{formatCurrency(item.precio)}</p>
                          <button 
                            onClick={() => removeConcepto(item.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* SELECCIÓN ACTUAL (PENDIENTE DE AGREGAR) */}
                    {(materialActual || costoArmazon > 0) && (
                      <div className="flex justify-between items-center bg-indigo-50/30 p-4 rounded-xl border border-dashed border-indigo-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Plus size={14} className="text-indigo-600 animate-pulse" />
                            <p className="text-xs font-bold text-indigo-800 italic">Selección en curso...</p>
                          </div>
                          <p className="text-[10px] text-indigo-400">
                            {materialActual ? `${categoriaSel} - ${materialActual.nombre}` : ''}
                            {materialActual && costoArmazon > 0 ? ' + ' : ''}
                            {costoArmazon > 0 ? `Armazón (${detalleArmazon || 'S/D'})` : ''}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">
                          {formatCurrency(
                            (materialActual?.precio || 0) + 
                            (tratamientoActual?.precio || 0) + 
                            costoArmazon + 
                            ((filtroBlueActivo && materialActual?.ofreceBlue && !materialActual?.incluyeBlue) ? (materialActual?.precioBlue || 8000) : 0)
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          </div>

        {/* FOOTER */}
        <footer className="mt-12 text-center text-slate-400 text-xs">
          <p>© 2026 Óptica Schellhas - Sistema de Gestión de Ventas v2.5</p>
        </footer>

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
                    {materialActual?.campos && (categoriaSel === "Multifocales" || categoriaSel === "Ocupacionales") && (
                      <div className="space-y-2 pt-2 border-t border-slate-50">
                        <span className="text-xs text-slate-400 font-bold uppercase">Amplitud de Visión</span>
                        <div className="space-y-2">
                          {['lejos', 'inter', 'cerca'].map(campo => (
                            <div key={campo} className="space-y-1">
                              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                                <span>{campo === 'inter' ? 'Intermedio' : campo}</span>
                                <span>{materialActual.campos[campo]}/5</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(materialActual.campos[campo] / 5) * 100}%` }}
                                  className={`h-full rounded-full ${
                                    materialActual.campos[campo] >= 5 ? 'bg-emerald-500' : 
                                    materialActual.campos[campo] >= 4 ? 'bg-indigo-500' : 
                                    'bg-amber-500'
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
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
                    {compararCon.campos && (categoriaSel === "Multifocales" || categoriaSel === "Ocupacionales") && (
                      <div className="space-y-2 pt-2 border-t border-slate-50">
                        <span className="text-xs text-slate-400 font-bold uppercase">Amplitud de Visión</span>
                        <div className="space-y-2">
                          {['lejos', 'inter', 'cerca'].map(campo => (
                            <div key={campo} className="space-y-1">
                              <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                                <span>{campo === 'inter' ? 'Intermedio' : campo}</span>
                                <span>{compararCon.campos[campo]}/5</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(compararCon.campos[campo] / 5) * 100}%` }}
                                  className={`h-full rounded-full ${
                                    compararCon.campos[campo] >= 5 ? 'bg-emerald-500' : 
                                    compararCon.campos[campo] >= 4 ? 'bg-indigo-500' : 
                                    'bg-amber-500'
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
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

      {/* MODAL SIMULADORES AGRANDADOS */}
      <AnimatePresence>
        {enlargedSim && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEnlargedSim(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  {enlargedSim === 'beneficios' && <><Sparkles className="text-indigo-600" /> Simulador de Tratamientos</>}
                  {enlargedSim === 'espesor' && <><Layers className="text-indigo-600" /> Comparador de Espesores</>}
                  {enlargedSim === 'amplitud' && <><Monitor className="text-indigo-600" /> Amplitud de Visión Multifocal</>}
                </h2>
                <button 
                  onClick={() => setEnlargedSim(null)}
                  className="p-3 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {enlargedSim === 'beneficios' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                      <div className="lg:col-span-2 space-y-6">
                        <div 
                          ref={simuladorRef}
                          className="relative aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white cursor-ew-resize select-none group"
                          onMouseDown={(e) => {
                            const handleMove = (clientX: number) => {
                              if (!simuladorRef.current) return;
                              const rect = simuladorRef.current.getBoundingClientRect();
                              const x = clientX - rect.left;
                              const pos = (x / rect.width) * 100;
                              setSliderPos(Math.min(95, Math.max(5, pos)));
                            };
                            handleMove(e.clientX);
                            const onMouseMove = (moveE: MouseEvent) => handleMove(moveE.clientX);
                            const onMouseUp = () => {
                              document.removeEventListener('mousemove', onMouseMove);
                              document.removeEventListener('mouseup', onMouseUp);
                            };
                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);
                          }}
                        >
                          {/* Imagen de Fondo Dinámica */}
                          <img 
                            src={
                              simulacionActiva === 'polarized' ? "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80" : 
                              simulacionActiva === 'ar' ? "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=1200&q=80" : 
                              simulacionActiva === 'blue' ? "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80" : 
                              "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                            } 
                            alt="Simulación" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Capa de Efectos (Sin Tratamiento - Izquierda) */}
                          <div className="absolute inset-0 overflow-hidden">
                            <div 
                              className="absolute inset-0 w-full h-full"
                              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                            >
                              {simulacionActiva === 'polarized' && (
                                <div className="absolute inset-0">
                                  <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                                  <div className="absolute top-1/2 left-1/4 w-full h-1/3 bg-gradient-to-b from-transparent via-white/60 to-transparent rotate-[-10deg] blur-3xl opacity-80" />
                                </div>
                              )}
                              {simulacionActiva === 'ar' && (
                                <div className="absolute inset-0">
                                  <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-yellow-100/30 rounded-full blur-[80px] animate-pulse" />
                                  <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-white/20 rounded-full blur-[100px]" />
                                </div>
                              )}
                              {simulacionActiva === 'blue' && (
                                <div className="absolute inset-0 bg-blue-500/20 mix-blend-screen" />
                              )}
                              {simulacionActiva === 'photo' && (
                                <div className="absolute inset-0 bg-white/10 mix-blend-soft-light" />
                              )}
                            </div>

                            {/* Capa con Tratamiento (Derecha) */}
                            <div 
                              className="absolute inset-0 w-full h-full"
                              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                            >
                              {simulacionActiva === 'polarized' && <div className="absolute inset-0 bg-teal-900/10 mix-blend-multiply" />}
                              {simulacionActiva === 'ar' && <div className="absolute inset-0 bg-black/10" />}
                              {simulacionActiva === 'blue' && <div className="absolute inset-0 bg-orange-100/20 mix-blend-multiply" />}
                              {simulacionActiva === 'photo' && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 0.75 }}
                                  className={`absolute inset-0 transition-colors duration-1000 ${
                                    colorFoto === 'gris' ? 'bg-slate-800/70 mix-blend-multiply' : 
                                    colorFoto === 'marron' ? 'bg-[#5d4037]/60 mix-blend-multiply' : 
                                    'bg-[#2e7d32]/50 mix-blend-multiply'
                                  }`}
                                />
                              )}
                            </div>
                          </div>

                          {/* Slider Control */}
                          <div 
                            className="absolute inset-y-0 w-1.5 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
                            style={{ left: `${sliderPos}%` }}
                          >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center">
                              <ArrowRightLeft size={24} className="text-indigo-600" />
                            </div>
                          </div>

                          {/* Etiquetas */}
                          <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Sin Tratamiento</div>
                          <div className="absolute top-8 right-8 bg-indigo-600/60 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                            Con {simulacionActiva === 'ar' ? 'Anti-Reflex' : simulacionActiva === 'blue' ? 'Filtro Blue' : simulacionActiva === 'photo' ? 'Fotosensible' : simulacionActiva === 'polarized' ? 'Polarizado' : 'Tratamiento'}
                          </div>
                        </div>

                        {/* Selectores dentro del modal */}
                        <div className="grid grid-cols-5 gap-4">
                          {[
                            { id: null, label: 'Original', icon: null },
                            { id: 'ar', label: 'Anti-Reflex', icon: <ShieldCheck size={18} /> },
                            { id: 'blue', label: 'Blue Cut', icon: <Monitor size={18} /> },
                            { id: 'photo', label: 'Photo', icon: <Sun size={18} /> },
                            { id: 'polarized', label: 'Polarizado', icon: <Zap size={18} /> }
                          ].map((btn) => (
                            <button 
                              key={btn.id}
                              onClick={() => setSimulacionActiva(btn.id as any)}
                              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${simulacionActiva === btn.id ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' : 'border-slate-100 hover:bg-slate-50'}`}
                            >
                              {btn.icon && <div className="text-indigo-600">{btn.icon}</div>}
                              <span className="text-xs font-bold uppercase tracking-tighter">{btn.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <h4 className="text-lg font-bold text-slate-800 mb-4">Beneficios del Lente</h4>
                          <div className="space-y-4">
                            {materialActual?.beneficios.map((b, i) => (
                              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                  <CheckCircle2 size={16} className="text-white" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{b}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {simulacionActiva === 'photo' && (
                          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                            <h5 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-4">Color de Lente</h5>
                            <div className="flex gap-4">
                              {['gris', 'marron', 'verde'].map((c) => (
                                <button 
                                  key={c}
                                  onClick={() => setColorFoto(c as any)}
                                  className={`flex-1 p-3 rounded-2xl border-2 transition-all capitalize text-xs font-bold ${colorFoto === c ? 'border-indigo-600 bg-white shadow-md' : 'border-white bg-white/50 text-slate-400'}`}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {enlargedSim === 'espesor' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                          Vista de Perfil (Lente)
                        </h4>
                        <div className="h-64 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center p-12 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                          <div className="flex items-center gap-20 z-10">
                            <div className="flex flex-col items-center gap-4">
                              <div 
                                className="w-12 bg-indigo-200 rounded-full border-x-4 border-indigo-400 shadow-lg transition-all duration-700"
                                style={{ height: `${Math.max(20, 100 - (materialActual?.indice - 1.49) * 200)}px` }}
                              ></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase">Índice {materialActual?.indice.toFixed(2)}</span>
                            </div>
                            <div className="text-slate-300"><ArrowRightLeft size={32} /></div>
                            <div className="flex flex-col items-center gap-4">
                              <div 
                                className="w-12 bg-emerald-200 rounded-full border-x-4 border-emerald-400 shadow-lg transition-all duration-700"
                                style={{ height: `${Math.max(20, 100 - (1.67 - 1.49) * 200)}px` }}
                              ></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase">Referencia 1.67</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-2 h-6 bg-emerald-600 rounded-full"></div>
                          Vista en Armazón
                        </h4>
                        <div className="h-64 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center p-12 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                          <div className="relative w-48 h-12 bg-slate-800 rounded-lg shadow-xl flex items-center justify-center z-10">
                            <div 
                              className="absolute w-40 bg-indigo-400/40 backdrop-blur-sm border-x-2 border-indigo-500 transition-all duration-700"
                              style={{ height: `${Math.max(10, 60 - (materialActual?.indice - 1.49) * 120)}px` }}
                            ></div>
                            <div className="text-[8px] font-black text-white/50 uppercase tracking-widest">Borde del Marco</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center gap-4">
                      <Zap className="text-amber-500 shrink-0" size={24} />
                      <p className="text-sm text-amber-900 font-medium">
                        Un índice de refracción más alto permite que el lente sea más delgado y liviano para la misma graduación, mejorando la estética y el confort.
                      </p>
                    </div>
                  </div>
                )}

                {enlargedSim === 'amplitud' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <div className="aspect-square rounded-[2.5rem] overflow-hidden relative shadow-2xl border-8 border-white bg-slate-100">
                          {/* Fondo con Aberraciones (Zonas Desenfocadas) */}
                          <div className="absolute inset-0 flex flex-col opacity-40 blur-md">
                            <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80" className="h-1/3 w-full object-cover" alt="Lejos Blur" referrerPolicy="no-referrer" />
                            <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1000&q=80" className="h-1/3 w-full object-cover" alt="Inter Blur" referrerPolicy="no-referrer" />
                            <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80" className="h-1/3 w-full object-cover" alt="Cerca Blur" referrerPolicy="no-referrer" />
                          </div>

                          {/* Capa Nítida con Máscara de Amplitud Dinámica */}
                          <div 
                            className="absolute inset-0 flex flex-col transition-all duration-700"
                            style={{ 
                              maskImage: `radial-gradient(ellipse at 50% 18%, black 0%, transparent ${25 + (materialActual?.campos?.lejos || 3) * 12}%), 
                                          radial-gradient(ellipse at 50% 50%, black 0%, transparent ${15 + (materialActual?.campos?.inter || 3) * 10}%), 
                                          radial-gradient(ellipse at 50% 82%, black 0%, transparent ${30 + (materialActual?.campos?.cerca || 3) * 14}%)`,
                              WebkitMaskImage: `radial-gradient(ellipse at 50% 18%, black 0%, transparent ${25 + (materialActual?.campos?.lejos || 3) * 12}%), 
                                                radial-gradient(ellipse at 50% 50%, black 0%, transparent ${15 + (materialActual?.campos?.inter || 3) * 10}%), 
                                                radial-gradient(ellipse at 50% 82%, black 0%, transparent ${30 + (materialActual?.campos?.cerca || 3) * 14}%)`
                            }}
                          >
                            <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80" className="h-1/3 w-full object-cover" alt="Lejos Clear" referrerPolicy="no-referrer" />
                            <img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=1000&q=80" className="h-1/3 w-full object-cover" alt="Inter Clear" referrerPolicy="no-referrer" />
                            <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80" className="h-1/3 w-full object-cover" alt="Cerca Clear" referrerPolicy="no-referrer" />
                          </div>
                          
                          {/* Etiquetas de zonas */}
                          <div className="absolute top-[18%] left-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/20 uppercase tracking-widest">Visión de Lejos</div>
                          <div className="absolute top-[50%] left-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/20 uppercase tracking-widest">Intermedia</div>
                          <div className="absolute top-[82%] left-6 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/20 uppercase tracking-widest">Visión de Cerca</div>

                          {/* Overlay de Calidad */}
                          <div className="absolute bottom-6 right-6 bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                            <Sparkles size={16} />
                            <span className="text-xs font-black uppercase tracking-tighter">Diseño {materialActual?.tallado || 'Digital'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <h4 className="text-xl font-bold text-slate-800">Análisis de Campos Visuales</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">
                            Este simulador representa cómo el diseño del lente multifocal <b>{materialActual?.nombre}</b> distribuye las zonas de visión. Los campos más amplios reducen las aberraciones laterales y facilitan la adaptación.
                          </p>
                        </div>
                        <div className="space-y-6">
                          {['lejos', 'inter', 'cerca'].map(zona => (
                            <div key={zona} className="space-y-2">
                              <div className="flex justify-between items-end">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{zona === 'inter' ? 'Intermedio' : zona}</span>
                                <span className="text-lg font-black text-indigo-600">{materialActual?.campos?.[zona] || 3}/5</span>
                              </div>
                              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${((materialActual?.campos?.[zona] || 3) / 5) * 100}%` }}
                                  className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                          <h5 className="font-bold text-indigo-900 mb-2">Tecnología de Tallado</h5>
                          <p className="text-xs text-indigo-700 font-medium">{materialActual?.tallado || "Digital Freeform de alta precisión para una transición suave entre distancias."}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                    onClick={async () => {
                      setSucursalSel(suc);
                      await exportToPDF(suc);
                      savePresupuesto(suc);
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
      </>
      )}
    </div>
    </div>
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
  onRefreshPresupuestos,
  condicionesPago,
  setCondicionesPago,
  announcement,
  setAnnouncement,
  saveAnnouncement
}: { 
  catalogo: any, 
  setCatalogo: any, 
  onSave: (cat?: any) => void, 
  isSyncing: boolean, 
  lastSync: string | null,
  sucursales: any[],
  setSucursales: (s: any[]) => void,
  presupuestos: any[],
  onRefreshPresupuestos: () => void,
  condicionesPago: string[],
  setCondicionesPago: (c: string[]) => void,
  announcement: any,
  setAnnouncement: (a: any) => void,
  saveAnnouncement: (a: any) => void
}) {
  const [activeTab, setActiveTab] = useState("Monofocales Stock");
  const [showSucursalesAdmin, setShowSucursalesAdmin] = useState(false);
  const [showAnnouncementsAdmin, setShowAnnouncementsAdmin] = useState(false);
  const [showPresupuestos, setShowPresupuestos] = useState(false);
  const [showCondicionesAdmin, setShowCondicionesAdmin] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  // Filtros de presupuestos
  const [filterSucursal, setFilterSucursal] = useState("");
  const [filterVendedor, setFilterVendedor] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterCliente, setFilterCliente] = useState("");

  const filteredPresupuestos = useMemo(() => {
    return presupuestos.filter(p => {
      const matchSuc = !filterSucursal || p.sucursal_nombre === filterSucursal;
      const matchVend = !filterVendedor || p.vendedor === filterVendedor;
      const matchCat = !filterCategoria || p.categoria_nombre === filterCategoria;
      const matchCli = !filterCliente || 
        (p.cliente_nombre?.toLowerCase().includes(filterCliente.toLowerCase())) ||
        (p.cliente_contacto?.toLowerCase().includes(filterCliente.toLowerCase()));
      return matchSuc && matchVend && matchCat && matchCli;
    });
  }, [presupuestos, filterSucursal, filterVendedor, filterCategoria, filterCliente]);

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
    onSave(newCatalogo); // Persistir eliminación con el nuevo catálogo
  };

  const updateItem = (cat, type, id, field, value) => {
    const newCatalogo = { ...catalogo };
    const items = newCatalogo[cat][type];
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      let parsedValue = value;
      if (field === 'precio' || field === 'indice' || field === 'precioBlue') {
        parsedValue = value === "" ? 0 : parseFloat(value);
        if (isNaN(parsedValue)) parsedValue = 0;
      }
      items[index][field] = parsedValue;
      setCatalogo(newCatalogo);
    }
  };

  const addItem = (cat, type) => {
    const newCatalogo = { ...catalogo };
    let newItem;
    if (type === 'materiales') {
      newItem = { id: Date.now().toString(), nombre: "Nuevo Material", precio: 0, indice: 1.5, beneficios: ["Beneficio 1"], garantia: "1 Año Estándar" };
      if (cat === "Multifocales") {
        newItem.campos = { lejos: 3, inter: 3, cerca: 3 };
        newItem.tallado = "Digital";
      }
    } else {
      newItem = { id: Date.now().toString(), nombre: "Nuevo Tratamiento", precio: 0, garantia: "" };
    }
    newCatalogo[cat][type].push(newItem);
    setCatalogo(newCatalogo);
  };

  const removeItem = (cat, type, id) => {
    const newCatalogo = { ...catalogo };
    newCatalogo[cat][type] = newCatalogo[cat][type].filter(i => i.id !== id);
    setCatalogo(newCatalogo);
  };

  const toggleTratamiento = (cat, matId, tratNombre) => {
    const newCatalogo = { ...catalogo };
    const material = newCatalogo[cat].materiales.find(m => m.id === matId);
    if (material) {
      if (!material.tratamientosPermitidos) {
        material.tratamientosPermitidos = catalogo[cat].tratamientos.map(t => t.nombre);
      }
      
      if (material.tratamientosPermitidos.includes(tratNombre)) {
        material.tratamientosPermitidos = material.tratamientosPermitidos.filter(n => n !== tratNombre);
      } else {
        material.tratamientosPermitidos = [...material.tratamientosPermitidos, tratNombre];
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
            setShowAnnouncementsAdmin(false);
            setShowCondicionesAdmin(false);
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
              setShowAnnouncementsAdmin(false);
              setShowPresupuestos(false);
              setShowCondicionesAdmin(false);
            }}
            className={`px-8 py-4 text-sm font-bold transition-all shrink-0 whitespace-nowrap ${activeTab === cat && !showSucursalesAdmin && !showPresupuestos && !showCondicionesAdmin && !showAnnouncementsAdmin ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => {
            setShowAnnouncementsAdmin(true);
            setShowSucursalesAdmin(false);
            setShowPresupuestos(false);
            setShowCondicionesAdmin(false);
          }}
          className={`px-8 py-4 text-sm font-bold transition-all shrink-0 whitespace-nowrap ${showAnnouncementsAdmin ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Notificaciones
        </button>
        <button
          onClick={() => {
            setShowSucursalesAdmin(true);
            setShowAnnouncementsAdmin(false);
            setShowPresupuestos(false);
            setShowCondicionesAdmin(false);
          }}
          className={`px-8 py-4 text-sm font-bold transition-all shrink-0 whitespace-nowrap ${showSucursalesAdmin ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Sucursales
        </button>
        <button
          onClick={() => {
            setShowCondicionesAdmin(true);
            setShowAnnouncementsAdmin(false);
            setShowSucursalesAdmin(false);
            setShowPresupuestos(false);
          }}
          className={`px-8 py-4 text-sm font-bold transition-all shrink-0 whitespace-nowrap ${showCondicionesAdmin ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Condiciones Pago
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
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const headers = ["Fecha", "Sucursal", "Vendedor", "Cliente", "Contacto", "Categoría", "Material", "Tratamiento", "Conceptos Agregados", "Total"];
                    const rows = presupuestos.map(p => [
                      new Date(p.created_at).toLocaleDateString(),
                      p.sucursal_nombre,
                      p.vendedor || '',
                      p.cliente_nombre || '',
                      p.cliente_contacto || '',
                      p.categoria_nombre,
                      p.material_nombre || '',
                      p.tratamiento_nombre || '',
                      p.receta?.conceptos?.map((c: any) => `${c.nombre}: ${c.precio}`).join(" | ") || '',
                      p.precio_final
                    ]);
                    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", `presupuestos_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all"
                >
                  <Download size={16} /> Exportar CSV
                </button>
                <button 
                  onClick={onRefreshPresupuestos}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-all"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>

            {/* FILTROS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Sucursal</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFilterSucursal(e.target.value)}
                  value={filterSucursal}
                >
                  <option value="">Todas</option>
                  {Array.from(new Set(presupuestos.map(p => p.sucursal_nombre))).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Vendedor</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFilterVendedor(e.target.value)}
                  value={filterVendedor}
                >
                  <option value="">Todos</option>
                  {Array.from(new Set(presupuestos.map(p => p.vendedor).filter(Boolean))).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Lente</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  value={filterCategoria}
                >
                  <option value="">Todos</option>
                  {Array.from(new Set(presupuestos.map(p => p.categoria_nombre))).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Cliente</label>
                <input 
                  type="text"
                  placeholder="Buscar cliente..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterCliente}
                  onChange={(e) => setFilterCliente(e.target.value)}
                />
              </div>
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
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPresupuestos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No hay presupuestos que coincidan con los filtros</td>
                      </tr>
                    ) : (
                      filteredPresupuestos.map((p) => (
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
                            <p className="text-xs font-bold text-slate-700">
                              {p.material_nombre || (p.receta?.conceptos?.length > 0 ? "Múltiples Ítems" : "S/N")}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {p.categoria_nombre} {p.receta?.conceptos?.length > 0 ? `(+${p.receta.conceptos.length} agregados)` : `+ ${p.tratamiento_nombre || 'Sin Trat.'}`}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-slate-800">{formatCurrency(p.precio_final)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={async () => {
                                if (confirm("¿Estás seguro de eliminar este presupuesto?")) {
                                  const { error } = await supabase.from('presupuestos').delete().eq('id', p.id);
                                  if (error) alert("Error al eliminar: " + error.message);
                                  else onRefreshPresupuestos();
                                }
                              }}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                              title="Eliminar Presupuesto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : showCondicionesAdmin ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Condiciones de Pago</h3>
              <button 
                onClick={() => setCondicionesPago([...condicionesPago, "Nueva Condición"])}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-xs font-bold"
              >
                <Plus size={16} /> Agregar Condición
              </button>
            </div>
            <div className="space-y-3">
              {condicionesPago.map((cond, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <input 
                    type="text"
                    value={cond}
                    onChange={(e) => {
                      const newConds = [...condicionesPago];
                      newConds[idx] = e.target.value;
                      setCondicionesPago(newConds);
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button 
                    onClick={() => setCondicionesPago(condicionesPago.filter((_, i) => i !== idx))}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : showAnnouncementsAdmin ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Notificaciones y Promociones</h3>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contenido del Mensaje</label>
                <textarea 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  value={announcement?.content || ""}
                  onChange={(e) => setAnnouncement(prev => ({ ...prev!, content: e.target.value }))}
                  placeholder="Escribe aquí el mensaje que verán todos los usuarios..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setAnnouncement(prev => ({ ...prev!, is_active: true }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${announcement?.is_active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                      Activo
                    </button>
                    <button 
                      onClick={() => setAnnouncement(prev => ({ ...prev!, is_active: false }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!announcement?.is_active ? 'bg-slate-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                      Inactivo
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prioridad</label>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setAnnouncement(prev => ({ ...prev!, priority: 'normal' }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${announcement?.priority === 'normal' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                      Normal
                    </button>
                    <button 
                      onClick={() => setAnnouncement(prev => ({ ...prev!, priority: 'urgent' }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${announcement?.priority === 'urgent' ? 'bg-red-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                      Urgente
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => saveAnnouncement(announcement)}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Save size={18} /> Guardar Notificación
              </button>
            </div>
          </div>
        ) : showSucursalesAdmin ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Gestión de Sucursales</h3>
              <button 
                onClick={() => setSucursales([...sucursales, { id: Date.now().toString(), nombre: 'Nueva Sucursal', direccion: '', telefono: '', qr_code: '' }])}
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
                    <input 
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs col-span-2"
                      value={suc.qr_code || ''}
                      onChange={(e) => {
                        const newSuc = sucursales.map(s => s.id === suc.id ? { ...s, qr_code: e.target.value } : s);
                        setSucursales(newSuc);
                      }}
                      placeholder="URL o Base64 del Código QR"
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
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400">Garantía</label>
                      <input 
                        type="text"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                        value={mat.garantia || ""}
                        onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'garantia', e.target.value)}
                        placeholder="Ej: 1 Año Estándar"
                      />
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

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-bold text-slate-400 block">Opciones de Filtro Azul</label>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={mat.ofreceBlue || false}
                            onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'ofreceBlue', e.target.checked)}
                          />
                          <span className="text-xs text-slate-600">Ofrece Filtro Azul</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={mat.incluyeBlue || false}
                            onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'incluyeBlue', e.target.checked)}
                          />
                          <span className="text-xs text-slate-600">Incluye Filtro Azul (Sin costo)</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400">Precio Filtro Azul ($)</label>
                      <input 
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                        value={isNaN(mat.precioBlue) ? "" : mat.precioBlue}
                        onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'precioBlue', e.target.value)}
                        disabled={mat.incluyeBlue}
                        placeholder="Ej: 8000"
                      />
                      <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={mat.sinGarantia || false}
                          onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'sinGarantia', e.target.checked)}
                        />
                        <span className="text-xs text-red-500 font-bold">Sin Garantía</span>
                      </label>
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

                  {activeTab === "Multifocales" && (
                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Campos Visuales (1-5)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['lejos', 'inter', 'cerca'].map(zona => (
                          <div key={zona}>
                            <label className="text-[8px] uppercase text-slate-400">{zona}</label>
                            <input 
                              type="number" 
                              min="1" max="5"
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                              value={mat.campos?.[zona] || 3}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const newCampos = { ...(mat.campos || { lejos: 3, inter: 3, cerca: 3 }), [zona]: Math.min(5, Math.max(1, val)) };
                                updateItem(activeTab, 'materiales', mat.id, 'campos', newCampos);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-[9px] uppercase font-bold text-slate-400">Tecnología de Diseño</label>
                        <input 
                          type="text"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                          value={mat.tallado || ""}
                          onChange={(e) => updateItem(activeTab, 'materiales', mat.id, 'tallado', e.target.value)}
                          placeholder="Ej: Digital Freeform"
                        />
                      </div>
                    </div>
                  )}

                {/* RANGOS DE GRADUACIÓN */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex flex-col">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Rangos de Graduación</label>
                      <span className="text-[7px] text-slate-400 italic">Define límites específicos para diferentes potencias</span>
                    </div>
                    <button 
                      onClick={() => {
                        const currentRangos = mat.rangos || [{ esf: [6, -10], cil: 2, suma: 12 }];
                        const newRangos = [...currentRangos, { esf: [6, -10], cil: 2, suma: 12 }];
                        updateItem(activeTab, 'materiales', mat.id, 'rangos', newRangos);
                      }}
                      className="text-[8px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <Plus size={10} /> AGREGAR RANGO
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(mat.rangos || [{ esf: [6, -10], cil: 2, suma: 12 }]).map((r, idx) => (
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
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-[8px] text-slate-400 block mb-0.5">Esf Máx (+)</label>
                            <input 
                              type="number"
                              step="0.25"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              value={r.esf?.[0] ?? 6}
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                const newRangos = [...(mat.rangos || [{ esf: [6, -10], cil: 2, suma: 12 }])];
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
                                const newRangos = [...(mat.rangos || [{ esf: [6, -10], cil: 2, suma: 12 }])];
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
                                const newRangos = [...(mat.rangos || [{ esf: [6, -10], cil: 2, suma: 12 }])];
                                newRangos[idx] = { ...r, cil: val };
                                updateItem(activeTab, 'materiales', mat.id, 'rangos', newRangos);
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-slate-400 block mb-0.5">Suma Máx</label>
                            <input 
                              type="number"
                              step="0.25"
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px]"
                              placeholder="Esf+Cil"
                              value={r.suma ?? ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? null : parseFloat(e.target.value);
                                const newRangos = [...(mat.rangos || [{ esf: [6, -10], cil: 2, suma: 12 }])];
                                newRangos[idx] = { ...r, suma: val };
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
                      const isChecked = !mat.tratamientosPermitidos || mat.tratamientosPermitidos.includes(trat.id) || mat.tratamientosPermitidos.includes(trat.nombre);
                      return (
                        <button
                          key={trat.id}
                          onClick={() => toggleTratamiento(activeTab, mat.id, trat.nombre)}
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400">Precio Adicional ($)</label>
                    <input 
                      type="number"
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                      value={isNaN(trat.precio) ? "" : trat.precio}
                      onChange={(e) => updateItem(activeTab, 'tratamientos', trat.id, 'precio', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-slate-400">Garantía</label>
                    <input 
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm"
                      value={trat.garantia || ""}
                      onChange={(e) => updateItem(activeTab, 'tratamientos', trat.id, 'garantia', e.target.value)}
                      placeholder="Ej: 1 Año"
                    />
                  </div>
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
          onClick={() => onSave()}
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
