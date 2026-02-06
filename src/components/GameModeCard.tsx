import { LucideIcon } from "lucide-react";

interface GameModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant: "green" | "blue" | "purple" | "orange";
  onClick?: () => void;
}

const variantClasses = {
  green: "game-card-green",
  blue: "game-card-blue",
  purple: "game-card-purple",
  orange: "game-card-orange",
};

export const GameModeCard = ({
  icon: Icon,
  title,
  description,
  variant,
  onClick,
}: GameModeCardProps) => {
  return (
    <div
      className={`game-card ${variantClasses[variant]}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/80 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};
