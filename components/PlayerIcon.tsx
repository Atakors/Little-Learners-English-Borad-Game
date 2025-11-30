import React from 'react';
import { User, Ghost, Crown, Zap, Star, Rocket, Bot, Smile, Gamepad2, Heart } from 'lucide-react';

export const ICON_KEYS = ['user', 'smile', 'bot', 'ghost', 'crown', 'rocket', 'star', 'zap', 'gamepad', 'heart'];

interface Props {
  icon: string;
  size?: number;
  className?: string;
}

export const PlayerIcon: React.FC<Props> = ({ icon, size = 16, className = "" }) => {
  switch (icon) {
    case 'user': return <User size={size} className={className} />;
    case 'smile': return <Smile size={size} className={className} />;
    case 'bot': return <Bot size={size} className={className} />;
    case 'ghost': return <Ghost size={size} className={className} />;
    case 'crown': return <Crown size={size} className={className} />;
    case 'rocket': return <Rocket size={size} className={className} />;
    case 'star': return <Star size={size} className={className} />;
    case 'zap': return <Zap size={size} className={className} />;
    case 'gamepad': return <Gamepad2 size={size} className={className} />;
    case 'heart': return <Heart size={size} className={className} />;
    default: return <User size={size} className={className} />;
  }
};
