import fs from 'fs/promises';
import path from 'path';

const ARCHIVE_DIR = path.join('src', 'data', 'archive');
const OVERRIDE_DIR = path.join('src', 'data', 'schedules_override');

async function main() {
  console.log('Starting to extract schedule data from archives...');
  try {
    // Ensure the override directory exists
    await fs.mkdir(OVERRIDE_DIR, { recursive: true });

    const archiveFiles = await fs.readdir(ARCHIVE_DIR);
    const espnFiles = archiveFiles.filter(f => f.startsWith('matchups_espn_') && f.endsWith('.json'));

    if (espnFiles.length === 0) {
      console.log('No ESPN archive files found. You may need to run the main sync script first. Nothing to extract.');
      return;
    }

    for (const fileName of espnFiles) {
      const yearMatch = fileName.match(/(\d{4})/);
      if (!yearMatch) continue;
      
      const year = parseInt(yearMatch[0]);
      const filePath = path.join(ARCHIVE_DIR, fileName);
      
      console.log(`Processing ${fileName} for year ${year}...`);

      const rawData = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(rawData);

      // All archive files have the same structure (a single season object).
      const seasonData = jsonData;
      
      if (seasonData && seasonData.schedule) {
        const scheduleData = seasonData.schedule;
        const overrideFileName = `schedule_${year}.json`;
        const overrideFilePath = path.join(OVERRIDE_DIR, overrideFileName);
        
        await fs.writeFile(overrideFilePath, JSON.stringify(scheduleData, null, 2));
        console.log(`Successfully extracted and wrote ${overrideFileName}`);
      } else {
        console.warn(`Could not find schedule data in ${fileName}.`);
      }
    }

    console.log('\nExtraction complete!');
    console.log(`Override schedules are now available in the '${OVERRIDE_DIR}' directory for you to edit.`);

  } catch (error) {
    console.error('An error occurred during extraction:', error);
  }
}

main();
