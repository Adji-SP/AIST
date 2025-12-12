// components/ui/DeviceStatus.jsx
import React from 'react';
import { Wifi, WifiOff, Activity, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const DeviceStatus = ({
  devices = [],
  serialStatus = { connected: false, port: null },
  onSerialReconnect,
  loading = false
}) => {
  // Default devices if none provided
  const defaultDevices = [
    {
      id: 1,
      name: 'Soil Moisture Sensor',
      status: 'online',
      type: 'sensor',
      lastUpdate: 'Just now'
    },
    {
      id: 2,
      name: 'Temperature Sensor',
      status: 'online',
      type: 'sensor',
      lastUpdate: '2 min ago'
    },
    {
      id: 3,
      name: 'pH Sensor',
      status: 'online',
      type: 'sensor',
      lastUpdate: '5 min ago'
    },
    {
      id: 4,
      name: 'NPK Sensor',
      status: 'warning',
      type: 'sensor',
      lastUpdate: '15 min ago'
    }
  ];

  const devicesToShow = devices.length > 0 ? devices : defaultDevices;
  const onlineCount = devicesToShow.filter(d => d.status === 'online').length;
  const totalCount = devicesToShow.length;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50';
      case 'offline':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Device Status</h3>
        <span className="text-sm text-gray-500">
          {onlineCount}/{totalCount} online
        </span>
      </div>

      {/* Serial Connection Status */}
      {serialStatus && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {serialStatus.connected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {serialStatus.connected ? 'Serial Connected' : 'Serial Disconnected'}
              </span>
            </div>
            {!serialStatus.connected && onSerialReconnect && (
              <button
                onClick={onSerialReconnect}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Reconnect</span>
              </button>
            )}
          </div>
          {serialStatus.port && (
            <p className="text-xs text-gray-500 mt-1">Port: {serialStatus.port}</p>
          )}
        </div>
      )}

      {/* Device List */}
      <div className="space-y-3">
        {devicesToShow.map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(device.status)}
              <div>
                <div className="font-medium text-gray-900 text-sm">
                  {device.name}
                </div>
                <div className="text-xs text-gray-500">
                  {device.lastUpdate || 'No data'}
                </div>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(device.status)}`}>
              {device.status || 'unknown'}
            </span>
          </div>
        ))}
      </div>

      {devicesToShow.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No devices connected</p>
        </div>
      )}
    </div>
  );
};

export default DeviceStatus;
