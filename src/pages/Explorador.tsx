import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Tooltip,
  Popup,
  useMap,
  ScaleControl
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Maximize2,
  ChevronLeft,
  Layers,
  Info,
  ChevronRight,
  Map as MapIcon,
  X,
  Navigation,
  ChevronDown,
  Users,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

// --- DATA FROM MD ---
type RegionKey =
  | "Amazonía"
  | "Chiquitania – Pantanal"
  | "Altiplano"
  | "Valles"
  | "Yungas – Chapare"
  | "Chaco"
  | "Llanuras – Sabanas";

interface MapLayer {
  id: string;
  catalogProductId?: string;
  name: string;
  productName: string;
  scientificName?: string;
  badge: string;
  color: string;
  stats: { label: string; value: string }[];
  technicalInfo: {
    context: string;
    social: string;
    challenges: string[];
  };
  gallery: { url: string; description: string }[];
  geometryType: 'polygon' | 'points';
  geometryData: any;
}

interface MacroRegion {
  name: string;
  center: [number, number];
  zoom: number;
  layers: MapLayer[];
}

const macroRegions: Record<RegionKey, MacroRegion> = {
  "Amazonía": {
    name: "Amazonía",
    center: [-12.5, -67.0],
    zoom: 7,
    layers: [
      {
        id: "asai-dist",
        catalogProductId: "asai",
        name: "Distribución Potencial (Asaí)",
        productName: "Asaí",
        scientificName: "Euterpe precatoria",
        badge: "Aprovechamiento No Consuntivo",
        color: "#1B7E3B",
        stats: [
          { label: "Municipios Productores", value: "24" },
          { label: "Área de Intervención", value: "216.950 km²" },
          { label: "Participación Femenina", value: "90%" },
          { label: "Modelado de Distribución", value: "MaxEnt" }
        ],
        technicalInfo: {
          context: "El asaí es un fruto amazónico con alto valor nutricional. La Amazonía boliviana es clave para la regulación climática y la conservación de la biodiversidad.",
          social: "Participación activa de comunidades indígenas y territorios TIOC en la recolección silvestre.",
          challenges: ["Logística de transporte de perecederos", "Impacto de la variabilidad climática", "Presión por deforestación"]
        },
        gallery: [
          { url: "/images/azai/asai1.jpg", description: "Recolección tradicional de frutos en el dosel del bosque amazónico." },
          { url: "/images/azai/asai2.jpg", description: "Centros de acopio locales gestionados por comunidades indígenas." },
          { url: "/images/azai/asai3.jpg", description: "Procesamiento artesanal del Asaí con alta participación femenina." }
        ],
        geometryType: 'polygon',
        geometryData: [[-9, -69], [-9, -62], [-14, -62], [-14, -69]]
      },
      {
        id: "tiocs-amazon",
        name: "Territorios Indígenas (TIOCs)",
        productName: "Gobernanza Indígena",
        badge: "Custodios del Bosque",
        color: "#7B68EE",
        stats: [
          { label: "Territorios Reconocidos", value: "18" },
          { label: "Población Indígena", value: "156.000" },
          { label: "Conocimiento Tradicional", value: "49%" },
          { label: "Superficie Titulada", value: "12M ha" }
        ],
        technicalInfo: {
          context: "Las TIOCs representan la base de la gobernanza territorial indígena, asegurando la gestión ancestral del bosque y la biodiversidad.",
          social: "Organizaciones comunitarias que gestionan el 49% de los conocimientos tradicionales sobre frutos amazónicos.",
          challenges: ["Invasión de tierras", "Falta de reconocimiento oficial en algunas áreas", "Impacto de industrias extractivas"]
        },
        gallery: [
          { url: "/images/azai/asai3.jpg", description: "Reuniones comunitarias para la gestión ancestral del bosque." },
          { url: "/images/azai/asai4.jpg", description: "Líderes indígenas monitoreando la salud del ecosistema fluvial." }
        ],
        geometryType: 'polygon',
        geometryData: [[-11, -68], [-11, -65], [-13, -65], [-13, -68]]
      }
    ]
  },
  "Altiplano": {
    name: "Altiplano",
    center: [-19.0, -67.5],
    zoom: 7,
    layers: [
      {
        id: "quinua-prod",
        catalogProductId: "quinua",
        name: "Zonas de Producción (Quinua Real)",
        productName: "Quinua Real",
        scientificName: "Chenopodium quinoa",
        badge: "Denominación de Origen",
        color: "#D4AF37",
        stats: [
          { label: "Familias Productoras", value: "70.000+" },
          { label: "Máximo de Hectáreas", value: "120.000" },
          { label: "Departamentos Principales", value: "Oruro / Potosí" },
          { label: "Sistema Productivo", value: "Comunitario" }
        ],
        technicalInfo: {
          context: "Bolivia produce la 'Quinua Real', reconocida mundialmente por su calibre y calidad nutricional superior.",
          social: "Agricultura familiar andina y sistemas comunitarios alrededor de los salares de Uyuni y Coipasa.",
          challenges: ["Degradación de suelos por mecanización", "Variabilidad climática extrema", "Competencia de precios internacionales"]
        },
        gallery: [
          { url: "/images/quinua/quinua1.png", description: "Parcelas de Quinua Real en las faldas de los salares bolivianos." },
          { url: "/images/quinua/quinua4.jpg", description: "Sistemas comunitarios de siembra y protección del suelo altoandino." }
        ],
        geometryType: 'points',
        geometryData: [
          { pos: [-18.5, -67.5], name: "Núcleo Quinua Real - Oruro" },
          { pos: [-20.4, -67.4], name: "Zona Ganadera - Potosí" }
        ]
      }
    ]
  },
  "Chiquitania – Pantanal": {
    name: "Chiquitania – Pantanal",
    center: [-17.0, -60.0],
    zoom: 7,
    layers: [
      {
        id: "chiquitania-default",
        name: "Manejo Forestal (Madera)",
        productName: "Madera y Miel",
        badge: "Conservación Activa",
        color: "#D2691E",
        stats: [
          { label: "Certificación FSC", value: "Activa" },
          { label: "Humedales RAMSAR", value: "Pantanal" },
          { label: "Vocación", value: "Forestal" },
          { label: "Ecosistema", value: "Bosque Seco" }
        ],
        technicalInfo: {
          context: "Manejo forestal sostenible y conservación de ecosistemas estratégicos.",
          social: "Comunidades chiquitanas con tradición en el manejo del bosque seco.",
          challenges: ["Incendios forestales recurrentes", "Avance de la frontera agrícola", "Estrés hídrico"]
        },
        gallery: [],
        geometryType: 'polygon',
        geometryData: [[-14, -62], [-14, -58], [-19, -58], [-19, -62]]
      }
    ]
  },
  "Valles": {
    name: "Valles",
    center: [-18.5, -65.0],
    zoom: 7,
    layers: [
      {
        id: "valles-default",
        name: "Agro-Biodiversidad",
        productName: "Agro-Biodiversidad",
        badge: "Seguridad Alimentaria",
        color: "#E1AD01",
        stats: [
          { label: "Diversidad", value: "Alta" },
          { label: "Departamentos", value: "3" },
          { label: "Clima", value: "Templado" },
          { label: "Actores", value: "Pequeños" }
        ],
        technicalInfo: {
          context: "Base de la seguridad alimentaria nacional con sistemas de riego tradicionales.",
          social: "Economías campesinas minifundistas vinculadas a mercados locales.",
          challenges: ["Degradación de cuencas", "Migración rural", "Erosión genética"]
        },
        gallery: [],
        geometryType: 'points',
        geometryData: [{ pos: [-18.2, -65.4], name: "Zona de Producción de Ají" }]
      }
    ]
  },
  "Yungas – Chapare": {
    name: "Yungas – Chapare",
    center: [-16.0, -67.0],
    zoom: 8,
    layers: [
      {
        id: "yungas-default",
        name: "Agroforestería (Café/Cacao)",
        productName: "Café y Cacao",
        badge: "Agroforestería Sostenible",
        color: "#347C2C",
        stats: [
          { label: "Altitud", value: "2500m" },
          { label: "Bioma", value: "Montano" },
          { label: "Pluviosidad", value: "3000mm" },
          { label: "Valor", value: "Premium" }
        ],
        technicalInfo: {
          context: "Sistemas agroforestales que combinan cultivos comerciales con conservación de bosque.",
          social: "Asociaciones de productores líderes en exportación.",
          challenges: ["Topografía accidentada", "Plagas por humedad", "Acceso a mercados"]
        },
        gallery: [],
        geometryType: 'polygon',
        geometryData: [[-15, -68], [-15, -66], [-17, -66], [-17, -68]]
      }
    ]
  },
  "Chaco": {
    name: "Chaco",
    center: [-21.0, -63.0],
    zoom: 7,
    layers: [
      {
        id: "chaco-default",
        name: "Resiliencia Chaqueña (Miel)",
        productName: "Bosque Seco Chaqueño",
        badge: "Resiliencia Climática",
        color: "#C35817",
        stats: [
          { label: "Humedad", value: "Baja" },
          { label: "Tipo", value: "Semiárido" },
          { label: "Cosecha Agua", value: "Crítica" },
          { label: "Bosque", value: "Xerófilo" }
        ],
        technicalInfo: {
          context: "Producción adaptada a condiciones de extrema sequía.",
          social: "Comunidades guaraníes integrando modelos de manejo del agua.",
          challenges: ["Estrés hídrico", "Cambio climático", "Deforestación"]
        },
        gallery: [],
        geometryType: 'polygon',
        geometryData: [[-19, -64], [-19, -60], [-23, -60], [-23, -64]]
      }
    ]
  },
  "Llanuras – Sabanas": {
    name: "Llanuras – Sabanas",
    center: [-14.5, -65.0],
    zoom: 7,
    layers: [
      {
        id: "llanuras-default",
        name: "Ganadería Natural (Beni)",
        productName: "Ganadería Bovina",
        badge: "Bajo en Carbono",
        color: "#6E8B3D",
        stats: [
          { label: "Pastoreo", value: "Natural" },
          { label: "Emisión", value: "Baja" },
          { label: "Área", value: "Extensa" },
          { label: "Beni", value: "Núcleo" }
        ],
        technicalInfo: {
          context: "Modelos de ganadería regenerativa en sabanas inundables.",
          social: "Tradición ganadera beniana con potencial de certificación natural.",
          challenges: ["Inundaciones", "Infraestructura", "Mejora genética"]
        },
        gallery: [],
        geometryType: 'polygon',
        geometryData: [[-13, -67], [-13, -63], [-16, -63], [-16, -67]]
      }
    ]
  }
};


const layerOptions = [
  "Límites Macrorregionales",
  "Municipios Productores",
  "Territorios Indígenas (TIOCs)",
  "Áreas Protegidas (SNAP)",
  "Cobertura Boscosa",
  "Red Hídrica Principal"
];

// --- COMPONENTS ---

function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function Explorador() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize from URL params if available
  const initialRegion = (searchParams.get("region") as RegionKey) || "Amazonía";
  const initialLayer = searchParams.get("layer") || macroRegions[initialRegion].layers[0].id;

  const [activeRegionKey, setActiveRegionKey] = useState<RegionKey>(initialRegion);
  const [activeLayerId, setActiveLayerId] = useState<string>(initialLayer);
  const [activeTab, setActiveTab] = useState<"context" | "social" | "challenges">("context");

  useEffect(() => {
    const regionParam = searchParams.get("region") as RegionKey;
    const layerParam = searchParams.get("layer");

    if (regionParam && macroRegions[regionParam]) {
      setActiveRegionKey(regionParam);
      if (layerParam) {
        setActiveLayerId(layerParam);
      } else {
        setActiveLayerId(macroRegions[regionParam].layers[0].id);
      }
    }
  }, [searchParams]);

  const activeRegion = macroRegions[activeRegionKey];
  const activeLayer = activeRegion.layers.find(l => l.id === activeLayerId) || activeRegion.layers[0];

  useEffect(() => {
    setActiveLayerId(macroRegions[activeRegionKey].layers[0].id);
    setCurrentImageIndex(0);
  }, [activeRegionKey]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [activeLayerId]);

  const nextImage = () => {
    if (activeLayer.gallery.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % activeLayer.gallery.length);
  };

  const prevImage = () => {
    if (activeLayer.gallery.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + activeLayer.gallery.length) % activeLayer.gallery.length);
  };

  return (
    <div className="h-[100dvh] w-full relative flex flex-col bg-surface overflow-hidden pt-16">
      {/* MAP CONTAINER */}
      <div className="absolute inset-0 z-0 top-16">
        <MapContainer
          center={[-16.29, -63.59]}
          zoom={6}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={activeRegion.center} zoom={activeRegion.zoom} />
          <ScaleControl position="bottomright" />

          {/* Render Active Layer Geometry */}
          {activeLayer.geometryType === 'polygon' && (
            <Polygon
              positions={activeLayer.geometryData}
              pathOptions={{
                fillColor: activeLayer.color,
                fillOpacity: 0.4,
                color: activeLayer.color,
                weight: 3,
                dashArray: activeLayer.id.includes('tiocs') ? "5, 10" : ""
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h4 className="font-display font-bold text-primary mb-1">{activeLayer.name}</h4>
                  <p className="text-xs text-on-surface-variant mb-3">{activeLayer.technicalInfo.context}</p>

                  {activeLayer.catalogProductId && (
                    <Link
                      to={`/catalogo?product=${activeLayer.catalogProductId}`}
                      className="font-display inline-flex items-center gap-2 mb-4 text-xs font-black text-primary hover:text-secondary transition-colors group"
                    >
                      Ver Ficha en Catálogo
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}

                  <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Impacto Bioeconómico</div>
                  <div className="flex flex-wrap gap-1">
                    {activeLayer.stats.slice(0, 2).map((s) => (
                      <span key={s.label} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-[9px] font-bold">{s.value} {s.label}</span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Polygon>
          )}

          {activeLayer.geometryType === 'points' && activeLayer.geometryData.map((point: any, idx: number) => (
            <CircleMarker
              key={`${activeLayer.id}-${idx}`}
              center={point.pos}
              radius={10}
              pathOptions={{
                fillColor: activeLayer.color,
                fillOpacity: 0.9,
                color: "white",
                weight: 2,
                className: "drop-shadow-lg"
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="font-semibold text-xs text-primary">{point.name}</div>
              </Tooltip>
              <Popup>
                <div className="p-3">
                  <h4 className="font-bold text-sm mb-1">{point.name}</h4>
                  <p className="text-xs text-on-surface-variant mb-3">Punto estratégico de la cadena de valor: {activeLayer.productName}</p>

                  {activeLayer.catalogProductId && (
                    <Link
                      to={`/catalogo?product=${activeLayer.catalogProductId}`}
                      className="font-display inline-flex items-center gap-2 mb-2 text-xs font-black text-primary hover:text-secondary transition-colors group"
                    >
                      Ir al Catálogo Técnico
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* FLYING LEFT PANEL */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.aside
            initial={{ x: -450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -450, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed left-4 top-24 bottom-4 w-[calc(100%-2rem)] sm:w-[450px] bg-[#EFEAE2]/95 backdrop-blur-md z-40 rounded-[2.5rem] shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden"
          >
            {/* Top Selector Section */}
            <div className="p-8 bg-gradient-to-b from-[#654D81]/5 to-transparent border-b border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#B0946D] pulse-infinite" />
                  <span className="text-[10px] font-bold text-[#654D81]/85 uppercase tracking-[0.2em]">Atlas Bioeconómico</span>
                </div>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 hover:bg-[#654D81]/5 rounded-full text-[#4D4D4D] md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative group">
                <select
                  value={activeRegionKey}
                  onChange={(e) => setActiveRegionKey(e.target.value as RegionKey)}
                  className="w-full bg-[#EBEBEB] border-2 border-outline-variant/30 rounded-2xl px-5 py-4 text-base font-black text-[#B0946D] appearance-none focus:outline-none focus:border-[#B0946D] focus:ring-4 focus:ring-[#B0946D]/10 transition-all cursor-pointer shadow-md group-hover:border-[#B0946D]/50"
                >
                  {(Object.keys(macroRegions) as RegionKey[]).map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#654D81] group-hover:scale-110 transition-transform">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-8 pb-6">
                <div className="flex flex-col gap-1 mb-6">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="font-display text-6xl font-black text-[#654D81] tracking-tighter leading-none">{activeLayer.productName}</h2>
                    <div className="font-display px-3 py-1 bg-[#654D81]/10 text-[#654D81] rounded-lg text-[10px] font-bold uppercase tracking-widest border border-[#654D81]/20 h-fit">
                      {activeLayer.badge}
                    </div>
                  </div>
                  {activeLayer.scientificName && (
                    <p className="font-display italic text-xl text-[#4D4D4D] font-medium opacity-80">{activeLayer.scientificName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {activeLayer.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-3xl border border-outline-variant/10 bg-[#EBEBEB] shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="text-2xl font-black text-[#654D81] leading-none mb-2 group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                      <div className="text-[10px] font-bold text-[#4D4D4D] uppercase tracking-wide opacity-80 leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <div className="flex bg-[#EBEBEB] p-1 rounded-2xl gap-1">
                    {[
                      { id: "context", label: "Impacto", icon: Info },
                      { id: "social", label: "Social", icon: Users },
                      { id: "challenges", label: "Desafíos", icon: AlertCircle }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
                          activeTab === tab.id
                            ? "bg-[#EFEAE2] text-[#654D81] shadow-sm"
                            : "text-[#4D4D4D] hover:text-[#397C85] hover:bg-[#EBEBEB]/40"
                        )}
                      >
                        <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-[#654D81]" : "opacity-60")} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-[120px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeLayer.id}-${activeTab}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-[#4D4D4D] leading-relaxed"
                      >
                        {activeTab === "context" && (
                          <div className="p-1">
                            <p className="mb-4">"{activeLayer.technicalInfo.context}"</p>
                          </div>
                        )}
                        {activeTab === "social" && (
                          <div className="flex gap-4 p-1">
                            <div className="w-1.5 rounded-full bg-[#654D81]/20 shrink-0" />
                            <p className="font-medium italic text-[#4D4D4D] leading-relaxed">
                              {activeLayer.technicalInfo.social}
                            </p>
                          </div>
                        )}
                        {activeTab === "challenges" && (
                          <ul className="space-y-3 p-1">
                            {activeLayer.technicalInfo.challenges.map((c, i) => (
                              <li key={i} className="flex gap-3 items-start group">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#B0946D] flex-shrink-0 group-hover:scale-125 transition-transform" />
                                <span className="font-medium">{c}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-8 pt-6 border-t-2 border-outline-variant/10 bg-[#EFEAE2]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#654D81] opacity-60" />
                    <h3 className="text-xs font-black text-[#654D81] uppercase tracking-[0.2em] leading-none">Mapas Temáticos Disponibles</h3>
                  </div>
                  <div className="text-[9px] font-black text-[#654D81] px-2 py-0.5 bg-[#654D81]/10 rounded border border-[#654D81]/20">GIS ENGINE v1.2</div>
                </div>
                <div className="space-y-3">
                  {activeRegion.layers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setActiveLayerId(layer.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all border text-left",
                        activeLayerId === layer.id
                          ? "bg-[#B0946D]/10 border-[#B0946D]/30 shadow-md ring-2 ring-[#B0946D]/5"
                          : "bg-transparent border-outline-variant/10 hover:border-[#B0946D]/30 hover:bg-[#B0946D]/5"
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-xs font-black transition-colors uppercase tracking-tight",
                          activeLayerId === layer.id ? "text-[#654D81]" : "text-[#4D4D4D]"
                        )}>
                          {layer.name}
                        </span>
                        <span className="text-[10px] font-medium text-[#4D4D4D] opacity-60">Visualización interactiva</span>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        activeLayerId === layer.id ? "border-[#B0946D] bg-[#B0946D]" : "border-outline-variant"
                      )}>
                        {activeLayerId === layer.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-4 bg-[#EFEAE2]" />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* FLYING RIGHT PANEL (GALLERY) */}
      <AnimatePresence>
        {isGalleryOpen && activeLayer.gallery.length > 0 && (
          <motion.aside
            initial={{ x: 450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 450, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed right-4 top-24 bottom-4 w-[calc(100%-2rem)] sm:w-[400px] bg-[#EFEAE2]/95 backdrop-blur-md z-40 rounded-[2.5rem] shadow-2xl border border-outline-variant/20 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between bg-[#654D81]/5">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#654D81]" />
                <span className="text-xs font-black text-[#654D81] uppercase tracking-[0.2em]">Evidencia Territorial</span>
              </div>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 hover:bg-[#654D81]/10 rounded-full text-[#4D4D4D] transition-colors"
                title="Cerrar Galería"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-grow flex flex-col p-6">
              {/* Image Carousel */}
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-black/5 mb-6 group shadow-lg">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeLayer.gallery[currentImageIndex].url}
                    src={activeLayer.gallery[currentImageIndex].url}
                    alt="Gallery item"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Carousel Overlays / Nav */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button
                    onClick={prevImage}
                    className="w-12 h-12 rounded-full bg-[#EFEAE2]/80 backdrop-blur-md shadow-lg flex items-center justify-center text-[#654D81] pointer-events-auto hover:bg-[#EFEAE2] active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="w-12 h-12 rounded-full bg-[#EFEAE2]/80 backdrop-blur-md shadow-lg flex items-center justify-center text-[#654D81] pointer-events-auto hover:bg-[#EFEAE2] active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Description Overlay - High Contrast */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pt-12">
                  <p className="text-white text-xl font-bold leading-tight drop-shadow-md">
                    {activeLayer.gallery[currentImageIndex].description}
                  </p>
                </div>

                {/* Indicadores de posición */}
                <div className="absolute top-4 right-6 flex gap-1.5">
                  {activeLayer.gallery.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all border border-white/50",
                        currentImageIndex === i ? "bg-white w-6" : "bg-white/30"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Info Adicional / Thumbnails */}
              <div className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 gap-2">
                  {activeLayer.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                        "aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                        currentImageIndex === i ? "border-[#B0946D] scale-95 shadow-inner" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-[#654D81]/5 rounded-[2rem] border border-[#654D81]/15">
                  <h4 className="text-[10px] font-black text-[#654D81] uppercase tracking-[0.2em] mb-3">Contexto Visual</h4>
                  <p className="text-xs text-[#4D4D4D] leading-relaxed">
                    Esta galería muestra evidencias recolectadas en campo sobre {activeLayer.name} permitiendo una comprensión visual del impacto bioeconómico.
                  </p>
                </div>
              </div>
            </div>

            <div className="h-6 bg-[#EFEAE2]/95" />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ADDITIONAL MAP CONTROLS - REPOSITIONED */}
      <div
        className={cn(
          "fixed top-24 z-[1000] flex flex-col gap-3 transition-all duration-500",
          isGalleryOpen && activeLayer.gallery.length > 0 ? "right-[430px]" : "right-10"
        )}
      >
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className={cn(
            "bg-[#EFEAE2] p-4 rounded-[1.5rem] shadow-2xl transition-all border border-outline-variant/20 active:scale-95 group font-black",
            isPanelOpen ? "text-[#654D81] hover:bg-[#654D81]/10" : "bg-[#B0946D] text-white border-[#B0946D]"
          )}
          title={isPanelOpen ? "Ocultar Panel Atlas" : "Mostrar Panel Atlas"}
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", !isPanelOpen && "rotate-180")} />
        </button>

        <button
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className={cn(
            "bg-[#EFEAE2] p-4 rounded-[1.5rem] shadow-2xl transition-all border border-outline-variant/20 active:scale-95 group font-black",
            isGalleryOpen ? "text-[#654D81] hover:bg-[#654D81]/10" : "bg-[#397C85] text-white border-[#397C85] shadow-lg shadow-[#397C85]/20"
          )}
          title={isGalleryOpen ? "Ocultar Galería" : "Mostrar Galería"}
        >
          <Maximize2 className={cn("w-5 h-5 transition-transform", isGalleryOpen && "scale-110")} />
        </button>

        <div className="glass-panel p-2 rounded-[1.5rem] flex flex-col gap-2 border border-outline-variant/20 shadow-xl bg-[#EFEAE2]/90 backdrop-blur-md">
          <button className="p-3 hover:bg-[#654D81]/10 rounded-xl text-[#654D81] transition-colors" title="Navegación">
            <Navigation className="w-5 h-5" />
          </button>
          <button className="p-3 hover:bg-[#654D81]/10 rounded-xl text-[#654D81] transition-colors" title="Capas">
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
