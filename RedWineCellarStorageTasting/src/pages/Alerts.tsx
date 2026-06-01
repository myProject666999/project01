import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useAlertStore, type Alert } from '@/stores/alertStore';

const urgencyConfig: Record<string, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  overdue: {
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
  },
  urgent: {
    color: 'text-orange-400',
    bg: 'bg-orange-900/20',
    border: 'border-orange-500/30',
    icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
  },
  approaching: {
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-500/30',
    icon: <Clock className="w-5 h-5 text-amber-400" />,
  },
  safe: {
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-500/30',
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
  },
};

const urgencyOrder: Alert['urgency'][] = ['overdue', 'urgent', 'approaching', 'safe'];

export default function Alerts() {
  const { alerts, loading, fetchAlerts } = useAlertStore();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const sorted = [...alerts].sort(
    (a, b) => urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency)
  );

  const counts = {
    overdue: alerts.filter((a) => a.urgency === 'overdue').length,
    urgent: alerts.filter((a) => a.urgency === 'urgent').length,
    approaching: alerts.filter((a) => a.urgency === 'approaching').length,
    safe: alerts.filter((a) => a.urgency === 'safe').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-gold text-shadow-gold">Drink Window Alerts</h1>
        <p className="text-gray-400 font-body mt-1">Monitor your wines' drink readiness</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-effect rounded-xl p-4 text-center">
          <p className="font-display text-2xl text-red-400">{counts.overdue}</p>
          <p className="text-xs text-gray-500 font-body mt-1">Overdue</p>
        </div>
        <div className="glass-effect rounded-xl p-4 text-center">
          <p className="font-display text-2xl text-orange-400">{counts.urgent}</p>
          <p className="text-xs text-gray-500 font-body mt-1">Urgent</p>
        </div>
        <div className="glass-effect rounded-xl p-4 text-center">
          <p className="font-display text-2xl text-amber-400">{counts.approaching}</p>
          <p className="text-xs text-gray-500 font-body mt-1">Approaching</p>
        </div>
        <div className="glass-effect rounded-xl p-4 text-center">
          <p className="font-display text-2xl text-green-400">{counts.safe}</p>
          <p className="text-xs text-gray-500 font-body mt-1">Safe</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="glass-effect rounded-xl p-12 text-center">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-body">No alerts</p>
          <p className="text-gray-500 font-body text-sm mt-1">All your wines are within their drink windows</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((alert) => {
            const config = urgencyConfig[alert.urgency];
            return (
              <Link
                key={alert.id}
                to={`/wines/${alert.wineId}`}
                className={`block glass-effect rounded-xl p-5 border ${config.border} hover:border-gold/30 transition-all group`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${config.bg} p-3 rounded-lg`}>{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg text-white group-hover:text-gold transition-colors truncate">
                        {alert.chateau}
                      </h3>
                      <span className="text-gray-500 font-body text-sm">{alert.vintage}</span>
                    </div>
                    <p className="text-gray-400 font-body text-sm">{alert.region}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-display text-sm capitalize ${config.color}`}>
                      {alert.urgency}
                    </p>
                    <p className="text-gray-500 font-body text-xs">
                      {alert.urgency === 'overdue'
                        ? 'Past peak'
                        : alert.urgency === 'urgent'
                        ? `${alert.remainingYears}y left`
                        : alert.urgency === 'approaching'
                        ? `${alert.remainingYears}y left`
                        : `${alert.remainingYears}y window`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-white font-display text-lg">{alert.bottleCount}</p>
                    <p className="text-gray-500 font-body text-xs">bottles</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-body">Drink window:</span>
                  <span className="text-xs text-gray-400 font-body">
                    {alert.drinkFrom} – {alert.drinkTo}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
