/**
 * Race Data Scraper - Ejecutado por GitHub Actions
 * 
 * Uso: node scripts/fetch-race-data.js
 * 
 * Este script:
 * 1. Abre la página de Azure Live Timing con Playwright
 * 2. Extrae los datos del DOM (leaderboard, eventos, weather)
 * 3. Envía los datos al backend API
 * 
 * Alternativamente, puede guardar directamente en PostgreSQL
 */

require('dotenv').config();
const { chromium } = require('playwright');
const axios = require('axios');

const CONFIG = {
  azureUrl: process.env.AZURE_URL || 'https://livetiming.azurewebsites.net/event=50?config=w3',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  timeout: 15000,
  headless: true,
};

async function scrapeRaceData() {
  console.log('🏎️ Starting race data scrape...');
  
  const browser = await chromium.launch({
    headless: CONFIG.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultTimeout(CONFIG.timeout);

    console.log('📄 Loading page:', CONFIG.azureUrl);
    await page.goto(CONFIG.azureUrl, { waitUntil: 'networkidle' });

    // Wait for data to load
    await page.waitForTimeout(3000);

    // Extract leaderboard data
    const competitors = await page.evaluate(() => {
      const rows = document.querySelectorAll('table.leaderboard tbody tr, .standings-row, [class*="competitor"]');
      const data = [];
      
      rows.forEach((row, index) => {
        const cells = row.querySelectorAll('td, .cell');
        
        // Adaptar selectors según la estructura real de la página
        const position = cells[0]?.textContent?.trim() || (index + 1);
        const teamName = cells[1]?.textContent?.trim() || 
                        row.querySelector('[class*="team"]')?.textContent?.trim() ||
                        'Unknown Team';
        const category = cells[2]?.textContent?.trim() || 
                        row.querySelector('[class*="class"]')?.textContent?.trim() ||
                        'GT';
        const laps = cells[3]?.textContent?.trim() || '0';
        const gap = cells[4]?.textContent?.trim() || 'Leader';
        const status = row.querySelector('[class*="status"]')?.textContent?.trim() || 'running';
        
        data.push({
          teamName,
          teamCode: '',
          category,
          currentPosition: parseInt(position) || (index + 1),
          lapsCompleted: parseInt(laps) || 0,
          gapToLeader: gap,
          gapToPrev: '',
          totalPitTimeSeconds: 0,
          lastLapTimeSeconds: 0,
          status: status.toLowerCase().includes('pit') ? 'pit' : 
                  status.toLowerCase().includes('dnf') ? 'dnf' : 'running',
          drivers: [],
        });
      });
      
      return data;
    });

    // Extract events (if available)
    const events = await page.evaluate(() => {
      const eventElements = document.querySelectorAll('[class*="event"], .events-list .event');
      const data = [];
      
      eventElements.forEach(el => {
        const type = el.querySelector('[class*="type"]')?.textContent?.trim() || 'incident';
        const time = el.querySelector('[class*="time"]')?.textContent?.trim() || '';
        const team = el.querySelector('[class*="team"]')?.textContent?.trim() || '';
        const desc = el.querySelector('[class*="desc"]')?.textContent?.trim() || '';
        
        data.push({
          timestamp: time,
          eventType: type.toLowerCase().includes('pit') ? 'pit_stop' : 'incident',
          teamId: '',
          teamName: team,
          description: desc,
          severity: desc.toLowerCase().includes('incident') ? 'warning' : 'info',
        });
      });
      
      return data;
    });

    // Extract weather (if available)
    const weather = await page.evaluate(() => {
      const temp = document.querySelector('[class*="temperature"], .weather-temp')?.textContent;
      const humidity = document.querySelector('[class*="humidity"], .weather-humidity')?.textContent;
      const wind = document.querySelector('[class*="wind"], .weather-wind')?.textContent;
      const track = document.querySelector('[class*="track"], .weather-track')?.textContent;
      
      return {
        temperature: parseFloat(temp) || 0,
        humidity: parseFloat(humidity) || 0,
        windSpeed: parseFloat(wind) || 0,
        surfaceCondition: track?.toLowerCase().includes('wet') ? 'wet' : 'dry',
      };
    });

    // Extract race info
    const raceInfo = await page.evaluate(() => {
      const status = document.querySelector('[class*="race-status"], .status')?.textContent?.trim();
      const time = document.querySelector('[class*="race-time"], .elapsed')?.textContent?.trim();
      const eventName = document.querySelector('title')?.textContent?.trim() || 'Nürburgring 24h';
      
      return {
        status: status?.toLowerCase().includes('running') ? 'running' : 
               status?.toLowerCase().includes('finish') ? 'finished' : 'unknown',
        elapsedHours: parseTimeToHours(time),
        eventName,
      };
    });

    console.log(`✅ Scraped: ${competitors.length} competitors, ${events.length} events`);

    // Send to backend
    if (CONFIG.backendUrl) {
      try {
        const response = await axios.post(`${CONFIG.backendUrl}/api/internal/update-data`, {
          competitors,
          events,
          weather: weather.temperature > 0 ? weather : null,
          raceInfo,
          timestamp: new Date().toISOString(),
        }, { timeout: 5000 });
        
        console.log('📤 Data sent to backend:', response.data);
      } catch (err) {
        console.warn('⚠️ Could not send to backend:', err.message);
      }
    }

    // Output JSON for GitHub Actions to capture
    console.log('::set-output name=competitors::' + competitors.length);
    console.log('::set-output name=events::' + events.length);
    console.log('::set-output name=timestamp::' + new Date().toISOString());

    return { competitors, events, weather, raceInfo };

  } catch (error) {
    console.error('❌ Scrape failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

function parseTimeToHours(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] + parts[1] / 60 + parts[2] / 3600;
  }
  return 0;
}

// Run if called directly
if (require.main === module) {
  scrapeRaceData()
    .then(() => {
      console.log('🏁 Scrape complete');
      process.exit(0);
    })
    .catch(err => {
      console.error('💥 Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { scrapeRaceData };