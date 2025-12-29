import React from 'react';
import { Award, Trophy, Star, Target, Zap, Sparkles } from 'lucide-react';

const AchievementBadge = ({ achievement, onClick }) => {
  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'completion':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'streak':
        return <Zap className="h-6 w-6 text-orange-500" />;
      case 'performance':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'quiz':
        return <Target className="h-6 w-6 text-red-500" />;
      default:
        return <Award className="h-6 w-6 text-purple-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'common':
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div 
      className="group cursor-pointer animate-fade-in-up"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-sm">
        {/* Badge Icon */}
        <div className="relative">
          <div className={`w-14 h-14 rounded-2xl ${getRarityColor(achievement.rarity)} flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300`}>
            {getIcon(achievement.type)}
          </div>
          {achievement.rarity === 'legendary' && (
            <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-400 animate-pulse" />
          )}
        </div>
        
        {/* Achievement Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 truncate">{achievement.name}</h4>
            <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
              {achievement.type || 'Achievement'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {achievement.description}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              Earned {formatDate(achievement.earnedDate)}
            </span>
            {achievement.points && (
              <span className="text-xs font-bold text-blue-600">
                +{achievement.points} XP
              </span>
            )}
          </div>
        </div>
        
        {/* Certificate Indicator */}
        {achievement.certificateUrl && (
          <div className="text-blue-500 group-hover:text-blue-700 transition-colors">
            <Award className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;