import { ArrowRight } from "lucide-react";
import { Clock, Star, type Icon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

interface PopularServiceCardProps {
  id: string;
  name: string;
  description: string;
  price?: number;
  duration?: string;
  icon: Icon;
  iconColors: { bg: string; color: string };
  image?: string;
  rating?: number;
  reviewCount?: number;
}

const PopularServiceCard = ({
  id,
  name,
  description,
  price,
  duration,
  icon: IconComponent,
  iconColors,
  image,
  rating = 4.8,
  reviewCount,
}: PopularServiceCardProps) => {
  const navigate = useNavigate();

  // Variant WITH thumbnail image
  if (image) {
    return (
      <button
        onClick={() => navigate(`/services/${id}/book`)}
        className="flex overflow-hidden rounded-2xl bg-card card-shadow transition-all hover:card-shadow-hover active:scale-[0.98] text-left"
      >
        {/* Thumbnail */}
        <div className="relative h-auto w-[100px] shrink-0 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/10" />
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center gap-2 px-3 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconColors.bg} bg-opacity-40`}>
                <IconComponent size={16} weight="duotone" className={iconColors.color} />
              </div>
              <h4 className="text-[13px] font-bold text-foreground leading-tight truncate">{name}</h4>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{description}</p>
            <div className="mt-1.5 flex items-center gap-2">
              {price && (
                <span className="text-[13px] font-extrabold text-primary">£{price}</span>
              )}
              {duration && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary rounded-md px-1.5 py-0.5">
                  <Clock size={10} /> {duration}
                </span>
              )}
              {rating && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Star size={10} weight="fill" className="text-star" /> {rating}
                </span>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
        </div>
      </button>
    );
  }

  // Variant WITHOUT thumbnail image
  return (
    <button
      onClick={() => navigate(`/services/${id}/book`)}
      className="flex items-center gap-3 rounded-2xl bg-card p-3.5 card-shadow transition-all hover:card-shadow-hover active:scale-[0.98] text-left"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconColors.bg} bg-opacity-40`}>
        <IconComponent size={22} weight="duotone" className={iconColors.color} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-bold text-foreground leading-tight truncate">{name}</h4>
        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{description}</p>
        <div className="mt-1.5 flex items-center gap-2">
          {price && (
            <span className="text-[13px] font-extrabold text-primary">£{price}</span>
          )}
          {duration && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-secondary rounded-md px-1.5 py-0.5">
              <Clock size={10} /> {duration}
            </span>
          )}
          {rating && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Star size={10} weight="fill" className="text-star" /> {rating}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </button>
  );
};

export default PopularServiceCard;
