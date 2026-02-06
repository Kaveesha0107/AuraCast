import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import { Sun, Moon, TrendingUp, Search, Filter, Cloud, CloudRain, Sun as SunIcon, CloudSnow, Wind,Calendar,Thermometer,
  ChevronRight } from 'lucide-react';

function App() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } = useAuth0();
  
  const [weatherData, setWeatherData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [cacheStatus, setCacheStatus] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState('score');
  const [filterText, setFilterText] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'trends', 'analytics'

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/weather');
          setWeatherData(response.data.data);
          setCacheStatus(response.data.cacheStatus);
          setLoadingData(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode-bg');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode-bg');
    }
  }, [darkMode]);

  const sortedAndFilteredData = () => {
    let filtered = weatherData;
    
    if (filterText) {
      filtered = filtered.filter(city => 
        city.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    
    switch(sortBy) {
      case 'temp':
        return [...filtered].sort((a, b) => b.temp - a.temp);
      case 'name':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case 'score':
      default:
        return [...filtered].sort((a, b) => b.score - a.score);
    }
  };

 
  const getWeatherIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('clear') || desc.includes('sunny')) {
      return <SunIcon className="text-yellow-500" size={24} />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="text-gray-500" size={24} />;
    } else if (desc.includes('rain')) {
      return <CloudRain className="text-blue-500" size={24} />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="text-blue-300" size={24} />;
    } else if (desc.includes('wind')) {
      return <Wind className="text-gray-400" size={24} />;
    }
    return <Cloud className="text-gray-400" size={24} />;
  };

  const getComfortLevel = (score) => {
    if (score >= 80) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { text: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            Checking Authentication...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div 
        className="flex flex-col items-center justify-center h-screen text-center px-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1592210454359-9043f067919b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="relative z-10">
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cloud className="text-white" size={48} />
              <h1 className="text-6xl font-black text-white tracking-tighter">AuraCast</h1>
            </div>
            <p className="text-2xl font-light text-white mb-2">Weather Intelligence Platform</p>
          </div>
          
          <p className="text-xl text-white mb-10 max-w-xl font-medium bg-black bg-opacity-30 p-6 rounded-2xl backdrop-blur-sm">
            Advanced weather analytics and city comfort ranking system. 
            Get real-time insights and make informed decisions.
          </p>
          
          <button 
            onClick={() => loginWithRedirect()}
            className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-16 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Login to Dashboard</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <div className="mt-12 text-white text-sm">
           
            <p className="mt-2 text-blue-200">Powered by OpenWeatherMap API</p>
          </div>
        </div>
        
        {/* Animated clouds */}
        <div className="absolute top-10 left-10 animate-float-slow">
          <Cloud className="text-white opacity-30" size={80} />
        </div>
        <div className="absolute bottom-20 right-10 animate-float">
          <Cloud className="text-white opacity-20" size={60} />
        </div>
      </div>
    );
  }

  const displayData = sortedAndFilteredData();
  const topCity = displayData[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500 relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-pulse-slow">
          <div className="w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse-slow delay-1000">
          <div className="w-96 h-96 bg-cyan-100 dark:bg-cyan-900/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Top Navigation Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-3xl shadow-lg border border-white/20 dark:border-gray-700/50 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {user.picture ? (
                <img src={user.picture} alt="Profile" className="w-14 h-14 rounded-2xl border-4 border-blue-500/30 shadow-lg" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{user.email[0].toUpperCase()}</span>
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Welcome back</p>
              <h2 className="text-gray-900 dark:text-gray-100 font-bold text-lg">{user.name || user.email}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-2xl">
            {['dashboard', 'trends', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'dashboard' && ' Dashboard'}
                {tab === 'trends' && ' Trends'}
                {tab === 'analytics' && ' Analytics'}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl font-bold text-gray-700 dark:text-gray-300 hover:shadow-lg transition-all duration-300 group"
            >
              {darkMode ? (
                <>
                  <Sun size={18} className="text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-indigo-500 group-hover:rotate-12 transition-transform duration-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
            
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 text-red-600 dark:text-red-400 px-6 py-2.5 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 border border-red-100 dark:border-red-900/30 hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

  {/* Hero Section with Top City - Clean Design */}
{topCity && (
  <div className="mb-10 bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
      <div className="w-full md:w-auto">
        <div className="flex items-center gap-3 mb-4">
          {getWeatherIcon(topCity.description)}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Most Comfortable City</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{topCity.name}</h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Temperature</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{topCity.temp}°C</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Comfort Score</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{topCity.score}</p>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getComfortLevel(topCity.score).border} ${getComfortLevel(topCity.score).textColor}`}>
                {getComfortLevel(topCity.score).text.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 md:mt-0 md:ml-8">
        <div className="text-center">
          <div className="text-4xl font-black text-gray-900 dark:text-white">#01</div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Global Rank</p>
        </div>
      </div>
    </div>
  </div>
)}

{/* Controls Section - Clean Design */}
<div className="flex flex-col lg:flex-row gap-6 mb-10">
  <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
          <Search size={16} />
          Search Cities
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type city name..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-12 pr-4 py-3 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition"
          />
          <Search className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
          {filterText && (
            <button 
              onClick={() => setFilterText('')}
              className="absolute right-4 top-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="sm:w-64">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
          <Filter size={16} />
          Sort By
        </label>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition"
        >
          <option value="score">Comfort Score (High to Low)</option>
          <option value="temp">Temperature (High to Low)</option>
          <option value="name">City Name (A to Z)</option>
        </select>
      </div>
    </div>
    
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
          cacheStatus === 'HIT' 
            ? 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
            : 'border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20'
        }`}>
          ⚡ Cache: {cacheStatus}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {displayData.length} cities displayed
        </span>
      </div>
      <button 
        onClick={() => {
          setFilterText('');
          setSortBy('score');
        }}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
      >
        Reset Filters
      </button>
    </div>
  </div>
  
  {/* Quick Stats - Clean Design */}
  <div className="lg:w-96 grid grid-cols-2 gap-4">
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-800">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Score</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {weatherData.length > 0 ? Math.round(weatherData.reduce((sum, city) => sum + city.score, 0) / weatherData.length) : 0}
      </p>
    </div>
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-lg border border-gray-200 dark:border-gray-800">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Temp</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {weatherData.length > 0 ? Math.round(weatherData.reduce((sum, city) => sum + city.temp, 0) / weatherData.length) : 0}°C
      </p>
    </div>
  </div>
</div>

{/* Main Content based on Active Tab */}
{activeTab === 'dashboard' && (
  <>
    {/* Cities Table - Clean Design */}
    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-8">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <th className="py-4 px-6 text-sm font-medium uppercase tracking-wider text-left">Rank</th>
              <th className="py-4 px-6 text-sm font-medium uppercase tracking-wider text-left">City</th>
              <th className="py-4 px-6 text-sm font-medium uppercase tracking-wider text-left hidden md:table-cell">Weather</th>
              <th className="py-4 px-6 text-sm font-medium uppercase tracking-wider text-left">Temperature</th>
              <th className="py-4 px-6 text-sm font-medium uppercase tracking-wider text-left">Comfort Score</th>
              <th className="py-4 px-6 text-sm font-medium uppercase tracking-wider text-left">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {displayData.map((city, index) => {
              const comfortLevel = getComfortLevel(city.score);
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {getWeatherIcon(city.description)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{city.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">{city.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400 hidden md:table-cell capitalize">
                    {city.description}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{city.temp}°</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {city.score}
                      </span>
                      <div className="flex-1 min-w-[100px]">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${
                              city.score > 70 ? 'bg-green-500' : 
                              city.score > 40 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`} 
                            style={{ width: `${city.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      city.score > 70 ? 'border-green-200 text-green-700 dark:border-green-800 dark:text-green-400' :
                      city.score > 40 ? 'border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400' :
                      'border-red-200 text-red-700 dark:border-red-800 dark:text-red-400'
                    }`}>
                      {comfortLevel.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </>
)}

{activeTab === 'trends' && (
  <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 mb-8 border border-gray-200 dark:border-gray-800">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="text-blue-600" size={24} />
          Temperature Trends & Forecast (7 Days)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          Weekly temperature forecast with professional visualization
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-4">
        <div className="text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium">
          <span className="font-bold">Cache:</span> {cacheStatus}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {displayData.slice(0, 6).map((city, index) => {
        const trendData = city.trend || [];
        const hasTrendData = trendData.length > 0;
        
        if (!hasTrendData) return null;

        // Calculate statistics
        const maxTemp = Math.max(...trendData);
        const minTemp = Math.min(...trendData);
        const avgTemp = (trendData.reduce((a, b) => a + b, 0) / trendData.length).toFixed(1);
        
        // Calculate Y-axis scale
        const yMax = Math.ceil(maxTemp + 2);
        const yMin = Math.floor(minTemp - 2);
        const yRange = yMax - yMin;
        
        // Day names
        const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        return (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-300">
            {/* City Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  {getWeatherIcon(city.description)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl">{city.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Current:</span> {city.temp}°C
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Score:</span> {city.score}/100
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Chart Container */}
<div className="mb-8">
  <div className="flex justify-between items-center mb-6">
    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
      Temperature Forecast
    </h4>
    <div className="text-sm">
      <span className="text-gray-600 dark:text-gray-400">Avg: </span>
      <span className="font-bold text-blue-600 dark:text-blue-500">
        {avgTemp}°C
      </span>
    </div>
  </div>

  {/* Chart */}
  <div className="relative h-64">
    {/* Y Axis */}
    <div className="absolute left-0 top-0 bottom-0 w-12">
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-700" />
      {[yMax, yMax - yRange / 2, yMin].map((temp, i) => (
        <div
          key={i}
          className="absolute right-3 text-xs font-medium text-gray-500 dark:text-gray-400 -translate-y-1/2"
          style={{ top: `${i * 50}%` }}
        >
          {temp}°
        </div>
      ))}
    </div>

    {/* Chart Area */}
    <div className="ml-12 h-full relative">
      {/* Grid Lines */}
      {[0, 0.5, 1].map((p, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-px bg-gray-100 dark:bg-gray-800"
          style={{ top: `${p * 100}%` }}
        />
      ))}

      {/* Bars */}
      <div className="absolute inset-0 flex items-end justify-between px-2">
        {trendData.map((temp, i) => {
          const heightPercentage = ((temp - yMin) / yRange) * 100;

          let barColor =
            temp > 25
              ? 'bg-red-500 hover:bg-red-600'
              : temp > 15
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-blue-500 hover:bg-blue-600';

          return (
            <div key={i} className="flex flex-col items-center h-full flex-1 group">
              {/* BAR (bottom anchored) */}
              <div className="relative h-full flex items-end">
                <div
                  className={`w-10 rounded-t ${barColor} transition-all duration-300`}
                  style={{ height: `${heightPercentage}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap relative">
                      <div className="font-bold text-center">{temp}°C</div>
                      <div className="text-[10px] text-gray-300 text-center">
                        {dayNames[i]}
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Day */}
              <div className="mt-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                {dayNames[i]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</div>


            {/* Statistics and Data Table */}
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">HIGH</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{maxTemp.toFixed(1)}°C</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">AVG</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgTemp}°C</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">LOW</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{minTemp.toFixed(1)}°C</p>
                </div>
              </div>
              
              {/* Temperature Values Table */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Temperature Values (°C)</p>
                <div className="grid grid-cols-7 gap-2">
                  {trendData.map((temp, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-sm font-semibold py-2 rounded ${
                        temp > 25 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                          : temp > 15 
                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' 
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      }`}>
                        {temp.toFixed(1)}°
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                        {dayNames[i]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Legend and Footer */}
    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        {/* Color Legend */}
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-4">Temperature Range Legend</p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">H</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Hot</span>
                <div className="text-xs text-gray-600 dark:text-gray-400">Above 25°C</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Warm</span>
                <div className="text-xs text-gray-600 dark:text-gray-400">15°C to 25°C</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Cool</span>
                <div className="text-xs text-gray-600 dark:text-gray-400">Below 15°C</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-5 py-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Information</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>• 7-day forecast based on current weather patterns</div>
            <div>• Data refreshed every 5 minutes</div>
            <div>• Source: OpenWeatherMap API</div>
          </div>
        </div>
      </div>

      {/* How to Read */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">How to read:</span> Each bar represents daily temperature. 
            Hover over bars to see exact values. Y-axis shows temperature scale in Celsius.
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{activeTab === 'analytics' && (
  <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-800">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Advanced Analytics</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Comfort Distribution</h3>
        {['Excellent (80+)', 'Good (60-79)', 'Moderate (40-59)', 'Poor (0-39)'].map((level, idx) => {
          const count = weatherData.filter(city => {
            const score = city.score;
            if (level.includes('Excellent')) return score >= 80;
            if (level.includes('Good')) return score >= 60 && score < 80;
            if (level.includes('Moderate')) return score >= 40 && score < 60;
            return score < 40;
          }).length;
          const percentage = weatherData.length > 0 ? (count / weatherData.length * 100).toFixed(1) : 0;
          
          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{level}</span>
                <span className="text-gray-500 dark:text-gray-400">{count} cities ({percentage}%)</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-2 rounded-full ${
                    idx === 0 ? 'bg-green-500' :
                    idx === 1 ? 'bg-blue-500' :
                    idx === 2 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Temperature Range Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cold Cities (&lt;15°C)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {weatherData.filter(city => city.temp < 15).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Warm Cities (15-25°C)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {weatherData.filter(city => city.temp >= 15 && city.temp <= 25).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Hot Cities (&gt;25°C)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {weatherData.filter(city => city.temp > 25).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Optimal Temp (20-24°C)</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {weatherData.filter(city => city.temp >= 20 && city.temp <= 24).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


  {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 border border-white/20 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-left">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">AuraCast Weather Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Real-time weather analytics and comfort scoring system
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold">Last Updated:</span> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-bold">Cities:</span> {weatherData.length}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                Data Refreshed Every 5 Minutes • Powered by OpenWeatherMap API • © 2026 AuraCast
              </p>
            </div>
          </div>
        </footer>
      </div>

    
    </div>
  );
}

export default App;

