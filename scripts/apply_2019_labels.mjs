import fs from 'fs/promises';
import path from 'path';

const labels2019 = {
    14: [
        { managers: ["Ro K"], label: "quarterfinal_bye" },
        { managers: ["Palanki"], label: "quarterfinal_bye" },
        { managers: ["Saiesh", "Asad"], label: "quarterfinal" },
        { managers: ["Nikhil", "Arun"], label: "quarterfinal" },
        { managers: ["Swapnav"], label: "consolation_quarterfinal_bye" },
        { managers: ["Ameesh"], label: "consolation_quarterfinal_bye" },
        { managers: ["Sai", "Manuj"], label: "sacko_semifinal" },
        { managers: ["Voldemort", "Ro B"], label: "sacko_semifinal" }
    ],
    15: [
        { managers: ["Ro K", "Saiesh"], label: "semifinal" },
        { managers: ["Palanki", "Nikhil"], label: "semifinal" },
        { managers: ["Asad", "Arun"], label: "5th_place_semifinal" },
        { managers: ["Swapnav", "Voldemort"], label: "consolation_semifinal" },
        { managers: ["Ameesh", "Sai"], label: "consolation_semifinal" },
        { managers: ["Ro B", "Manuj"], label: "sacko_final" }
    ],
    16: [
        { managers: ["Palanki", "Ro K"], label: "championship" },
        { managers: ["Nikhil", "Saiesh"], label: "3rd_place_final" },
        { managers: ["Asad", "Arun"], label: "5th_place_final" },
        { managers: ["Ameesh", "Swapnav"], label: "7th_place_final" },
        { managers: ["Voldemort", "Sai"], label: "9th_place_final" },
        { managers: ["Manuj"], label: "sacko_bye" },
        { managers: ["Ro B"], label: "sacko_bye" }
    ]
};

async function main() {
    const filePath = "src/data/matchups/2019_espn.json";
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));

    data.matchups.forEach(m => {
        if (m.period >= 14 && m.period <= 16) {
            const periodLabels = labels2019[m.period];
            const matchLabel = periodLabels.find(pl => {
                if (pl.managers.length === 1) {
                    return !m.away && m.home.manager === pl.managers[0];
                } else {
                    return m.away && pl.managers.includes(m.home.manager) && pl.managers.includes(m.away.manager);
                }
            });
            if (matchLabel) {
                m.label = matchLabel.label;
                // Mark bye games that appear as matchups
                if (matchLabel.label.includes('bye')) {
                    m.isBye = true;
                }
            }
        }
    });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    // Standings derivation logic based on labels
    const standings = {};
    const playoffMatchups = data.matchups.filter(m => m.period >= 14 && m.period <= 16);

    playoffMatchups.forEach(m => {
        if (!m.away) return; // Skip byes for standings calculation
        const winner = m.winner === "HOME" ? m.home.manager : m.away.manager;
        const loser = m.winner === "HOME" ? m.away.manager : m.home.manager;

        if (m.label === "championship") {
            standings[1] = winner; standings[2] = loser;
        } else if (m.label === "3rd_place_final") {
            standings[3] = winner; standings[4] = loser;
        } else if (m.label === "5th_place_final") {
            standings[5] = winner; standings[6] = loser;
        } else if (m.label === "7th_place_final") {
            standings[7] = winner; standings[8] = loser;
        } else if (m.label === "9th_place_final") {
            standings[9] = winner; standings[10] = loser;
        } else if (m.label === "sacko_final") {
            standings[11] = winner; standings[12] = loser;
        }
    });

    console.log("Derived 2019 Standings based on labels:");
    for (let i = 1; i <= 12; i++) {
        console.log(`${i}. ${standings[i]}`);
    }
}

main();