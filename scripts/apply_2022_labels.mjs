import fs from 'fs/promises';
import path from 'path';

const labels2022 = {
    15: [
        { managers: ["Sai", "Ro B"], label: "quarterfinal" },
        { managers: ["Ameesh", "Asad"], label: "quarterfinal" },
        { managers: ["Palanki", "Smeet"], label: "quarterfinal" },
        { managers: ["Nikhil", "Shrey"], label: "quarterfinal" },
        { managers: ["Swapnav", "Arun"], label: "sacko_roundrobin" },
        { managers: ["Manuj", "Ro K"], label: "sacko_roundrobin" }
    ],
    16: [
        { managers: ["Sai", "Ameesh"], label: "semifinal" },
        { managers: ["Palanki", "Nikhil"], label: "semifinal" },
        { managers: ["Ro B", "Asad"], label: "5th_place_semifinal" },
        { managers: ["Shrey", "Smeet"], label: "5th_place_semifinal" },
        { managers: ["Swapnav", "Manuj"], label: "sacko_roundrobin" },
        { managers: ["Arun", "Ro K"], label: "sacko_roundrobin" }
    ],
    17: [
        { managers: ["Sai", "Palanki"], label: "championship" },
        { managers: ["Ameesh", "Nikhil"], label: "3rd_place_final" },
        { managers: ["Shrey", "Ro B"], label: "5th_place_final" },
        { managers: ["Asad", "Smeet"], label: "7th_place_final" },
        { managers: ["Swapnav", "Ro K"], label: "sacko_roundrobin" },
        { managers: ["Arun", "Manuj"], label: "sacko_roundrobin" }
    ]
};

async function main() {
    const filePath = "src/data/matchups/2022_espn.json";
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));

    data.matchups.forEach(m => {
        if (m.period >= 15 && m.period <= 17) {
            const periodLabels = labels2022[m.period];
            const matchLabel = periodLabels.find(pl => {
                return m.away && pl.managers.includes(m.home.manager) && pl.managers.includes(m.away.manager);
            });
            if (matchLabel) m.label = matchLabel.label;
        }
    });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Successfully applied labels to 2022_espn.json");
}

main();