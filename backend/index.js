const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

const API_KEY = 'fd68cbf3f73579b20466cd0ae476cba7';
const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

//  Comfort Index Formula 
// Based on: Temperature (50%), Humidity (30%), Visibility (20%)
// Ideal conditions: Temp 22°C, Humidity 45%, Visibility > 10km
const getComfortScore = (tempC, humidity, visibility) => {
    // Temperature Score: 22°C is perfect (100), ±10°C gives 70, ±20°C gives 40
    const tScore = Math.max(0, 100 - Math.abs(22 - tempC) * 3);
    
    // Humidity Score: 45% is ideal (100), ±30% gives 55, ±50% gives 25
    const hScore = Math.max(0, 100 - Math.abs(45 - humidity) * 1.5);
    
    // Visibility Score: >10km is perfect (100), <1km gives 10
    const vScore = Math.min(100, (visibility / 1000) * 10);

    // Weighted Average
    const finalScore = (tScore * 0.5) + (hScore * 0.3) + (vScore * 0.2);
    return Math.round(finalScore);
};

// Generate Realistic Temperature Trend for Graphs
const generateTemperatureTrend = (currentTemp, cityName) => {
    // Use city name to create consistent trend (same city = same trend)
    const nameHash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = nameHash % 100;
    
    return Array.from({ length: 7 }, (_, i) => {
        // Base pattern: sine wave for weekly variation
        const dayOffset = i;
        const basePattern = Math.sin(dayOffset * 0.8) * 3;
        
        // City-specific variation based on seed
        const cityVariation = (seed * 0.01 * i) % 4 - 2;
        
        // Random daily fluctuation
        const dailyFluctuation = (Math.sin(seed + i) * 1.5);
        
        const finalTemp = currentTemp + basePattern + cityVariation + dailyFluctuation;
        
        // Ensure realistic temperatures
        return parseFloat(Math.max(-10, Math.min(45, finalTemp)).toFixed(1));
    });
};

// Fetch Weather Data with Caching 
app.get('/api/weather', async (req, res) => {
    let cacheStatus = "HIT";
    let weatherData = cache.get("weather_results");

    if (!weatherData) {
        cacheStatus = "MISS";
        try {
            console.log("Fetching fresh weather data from OpenWeatherMap...");
            
            // Read city codes
            const fileData = JSON.parse(fs.readFileSync('./cities.json', 'utf8'));
            const cityCodes = fileData.List.map(c => c.CityCode);
            
            if (cityCodes.length < 10) {
                throw new Error(`Minimum 10 cities required. Found only ${cityCodes.length}`);
            }

            console.log(`Fetching weather for ${cityCodes.length} cities...`);
            
            // Fetch all cities in parallel
            const requests = cityCodes.map(id => 
                axios.get(`https://api.openweathermap.org/data/2.5/weather?id=${id}&units=metric&appid=${API_KEY}`)
                    .catch(err => {
                        console.warn(`Failed to fetch city ${id}: ${err.message}`);
                        return null;
                    })
            );

            const responses = await Promise.all(requests);
            
            // Process valid responses
            const validResponses = responses.filter(r => r !== null && r.data);
            
            if (validResponses.length < 10) {
                throw new Error(`Failed to fetch minimum 10 cities. Success: ${validResponses.length}`);
            }

            weatherData = validResponses.map((r, index) => {
                const { name, main, visibility, weather, wind, clouds } = r.data;
                
                // Calculate comfort score
                const score = getComfortScore(main.temp, main.humidity, visibility || 10000);
                
                // Generate temperature trend for graphs
                const trend = generateTemperatureTrend(main.temp, name);
                
                return {
                    id: cityCodes[index],
                    name: name || `City ${cityCodes[index]}`,
                    description: weather[0]?.description || "Clear sky",
                    temp: parseFloat(main.temp.toFixed(1)),
                    feels_like: parseFloat(main.feels_like.toFixed(1)),
                    humidity: main.humidity,
                    pressure: main.pressure,
                    visibility: visibility || 10000,
                    windSpeed: wind?.speed || 0,
                    windDeg: wind?.deg || 0,
                    clouds: clouds?.all || 0,
                    score: score,
                    trend: trend // For graph visualization
                };
            }).sort((a, b) => b.score - a.score); // Sort by comfort score

            // Cache the processed data
            cache.set("weather_results", weatherData);
            console.log(`✅ Cached ${weatherData.length} cities with trend data`);
            
        } catch (err) {
            console.error("❌ Fetch Error:", err.message);
            return res.status(500).json({ 
                error: "Failed to fetch weather data",
                message: err.message 
            });
        }
    } else {
        console.log("✅ Serving from cache");
    }

    res.json({ 
        cacheStatus, 
        data: weatherData,
        timestamp: new Date().toISOString(),
        count: weatherData.length,
        message: `Processed ${weatherData.length} cities`
    });
});

// Debug Endpoint 
app.get('/api/cache-debug', (req, res) => {
    const stats = cache.getStats();
    const cachedData = cache.get("weather_results");
    
    res.json({ 
        cacheStatus: {
            keys: cache.keys(),
            hits: stats.hits,
            misses: stats.misses,
            keysize: stats.keys
        },
        weatherCache: {
            hasData: !!cachedData,
            itemCount: cachedData ? cachedData.length : 0,
            ttl: cache.getTtl("weather_results"),
            sampleCity: cachedData && cachedData[0] ? {
                name: cachedData[0].name,
                score: cachedData[0].score,
                trendLength: cachedData[0].trend?.length || 0
            } : null
        }
    });
});

// Health Check 
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Weather Analytics API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: [
            '/api/weather - Main weather data with comfort scores',
            '/api/cache-debug - Cache status information',
            '/api/health - Service health check'
        ]
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🌤️  Weather Analytics Server`);
    console.log('='.repeat(50));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ OpenWeatherMap API Key: ${API_KEY.substring(0, 8)}...`);
    console.log(`✅ Cache TTL: 300 seconds (5 minutes)`);
    console.log(`✅ Required Cities: Minimum 10`);
    console.log('='.repeat(50));
    console.log('\nEndpoints:');
    console.log(`  GET http://localhost:${PORT}/api/weather`);
    console.log(`  GET http://localhost:${PORT}/api/cache-debug`);
    console.log(`  GET http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50));
});