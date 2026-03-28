import fs from 'fs/promises';
import path from 'path';

const labels2024 = {
    15: [
        { managers: ["Sai", "Swapnav"], label: "quarterfinal" },
        { managers: ["Ro B", "Arun"], label: "quarterfinal" },
        { managers: ["Asad", "Shrey"], label: "quarterfinal" },
        { managers: ["Smeet", "Ameesh"], label: "quarterfinal" },
        { managers: ["Nikhil", "Ro K"], label: "9th_place_final_sacko_qf" },
        { managers: ["Palanki", "Manuj"], label: "sacko_semifinal" }
    ],
    16: [
        { managers: ["Sai", "Ro B"], label: "semifinal" },
        { managers: ["Asad", "Smeet"], label: "semifinal" },
        { managers: ["Swapnav", "Ameesh"], label: "5th_place_semifinal" },
        { managers: ["Arun", "Shrey"], label: "5th_place_semifinal" },
        { managers: ["Ro K", "Palanki"], label: "10th_place_final_sacko_sf" }
    ],
    17: [
        { managers: ["Asad", "Sai"], label: "championship" },
        { managers: ["Smeet", "Ro B"], label: "3rd_place_final" },
        { managers: ["Swapnav", "Arun"], label: "5th_place_final" },
        { managers: ["Shrey", "Ameesh"], label: "7th_place_final" },
        { managers: ["Manuj", "Ro K"], label: "sacko_final" }
    ]
};

async function main() {
    const filePath = "src/data/matchups/2024_espn.json";
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));

    data.matchups.forEach(m => {
        if (m.period >= 15) {
            const periodLabels = labels2024[m.period];
            const managers = m.away ? [m.home.manager, m.away.manager] : [m.home.manager];
            const matchLabel = periodLabels.find(pl => 
                pl.managers.length === managers.length && 
                pl.managers.every(manager => managers.includes(manager))
            );
            if (matchLabel) m.label = matchLabel.label;
        }
    });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Successfully applied final labels to 2024_espn.json");
}

main();