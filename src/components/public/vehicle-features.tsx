import { Armchair, Shield, Cpu, Zap, Sparkles, Box, Key, CircleDot } from "lucide-react";
import { ReactNode } from "react";

const CATEGORY_LABELS: Record<string, { label: string; icon: ReactNode }> = {
  COMFORT:     { label: "Conforto",      icon: <Armchair size={14} />  },
  SAFETY:      { label: "Segurança",     icon: <Shield size={14} />    },
  TECHNOLOGY:  { label: "Tecnologia",    icon: <Cpu size={14} />       },
  PERFORMANCE: { label: "Performance",   icon: <Zap size={14} />       },
  EXTERIOR:    { label: "Exterior",      icon: <Sparkles size={14} />  },
  INTERIOR:    { label: "Interior",      icon: <Box size={14} />       },
  CONVENIENCE: { label: "Conveniência",  icon: <Key size={14} />       },
};

type FeatureItem = {
  feature: {
    id:       string;
    name:     string;
    category: string;
    icon:     string | null;
  };
};

interface VehicleFeaturesProps {
  featuresByCategory: Record<string, FeatureItem[]>;
}

export default function VehicleFeatures({ featuresByCategory }: VehicleFeaturesProps) {
  return (
    <div className="space-y-4">
      {Object.entries(featuresByCategory).map(([category, items]) => {
        const catInfo = CATEGORY_LABELS[category] ?? { label: category, icon: <CircleDot size={14} /> };
        return (
          <div key={category} className="glass rounded-2xl p-5">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-ink-600 dark:text-ink-400 uppercase tracking-widest mb-3">
              <span className="text-ink-500 dark:text-ink-500">{catInfo.icon}</span>
              {catInfo.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map((vf) => (
                <span
                  key={vf.feature.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                             text-ink-700 dark:text-ink-200
                             bg-ink-100/80 dark:bg-white/5 border border-ink-200 dark:border-white/8
                             hover:border-primary-500/30 transition-colors"
                >
                  {vf.feature.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
