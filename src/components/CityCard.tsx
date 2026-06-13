import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Layers, Users } from 'lucide-react';
import { CityData } from '@/data/cities';

interface CityCardProps {
  city: CityData;
  propertyCount: number;
  agentCount?: number;
}

export default function CityCard({ city, propertyCount, agentCount }: CityCardProps) {
  return (
    <Link
      to={`/cities/${city.slug}`}
      className="bg-[#111]/40 border border-white/5 hover:border-[#C5A059]/20 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden block"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${city.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      <div className="relative z-10 space-y-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-[#C5A059]/10 border border-white/10 group-hover:border-[#C5A059]/30 flex items-center justify-center text-[#C5A059] transition-colors duration-300">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white group-hover:text-[#C5A059] transition-colors truncate">
            {city.name.replace(' Coastal', '').replace(' Hub', '').replace(' Province', '').replace(' Port', '').replace(' Capital', '').replace(' Region', '')}
          </h4>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider truncate">
            {city.region}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-1">
          <div className="text-[10px] text-[#C5A059]/80 font-medium group-hover:underline flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{propertyCount !== undefined && propertyCount > 0 ? `${propertyCount} ${propertyCount === 1 ? 'Property' : 'Properties'}` : 'Coming Soon'}</span>
            </div>
            {agentCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{agentCount} {agentCount === 1 ? 'Agent' : 'Agents'}</span>
              </div>
            )}
          </div>
          <ArrowRight className="w-3 h-3 -rotate-45 text-[#C5A059]/80 group-hover:text-white transition-colors" />
        </div>
      </div>
    </Link>
  );
}
