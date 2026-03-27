import fs from 'fs/promises';
import path from 'path';

const labels2021 = {
    15: [
        { managers: ["Voldemort", "Nikhil"], label: "quarterfinal" },
        { managers: ["Manuj", "Ro B"], label: "quarterfinal" },
        { managers: ["Ameesh", "Swapnav"], label: "quarterfinal" },
        { managers: ["Arun", "Sai"], label: "quarterfinal" },
        { managers: ["Ro K", "Smeet"], label: "sacko_roundrobin" },
        { managers: ["Asad", "Palanki"], label: "sacko_roundrobin" }
    ],
    16: [
        { managers: ["Voldemort", "Sai"], label: "semifinal" },
        { managers: ["Ameesh", "Manuj"], label: "semifinal" },
        { managers: ["Arun", "Nikhil"], label: "5th_place_semifinal" },
        { managers: ["Swapnav", "Ro B"], label: "5th_place_semifinal" },
        { managers: ["Ro K", "Asad"], label: "sacko_roundrobin" },
        { managers: ["Smeet", "Palanki"], label: "sacko_roundrobin" }
    ],
    17: [
        { managers: ["Ameesh", "Voldemort"], label: "championship" },
        { managers: ["Sai", "Manuj"], label: "3rd_place_final" },
        { managers: ["Swapnav", "Arun"], label: "5th_place_final" },
        { managers: ["Nikhil", "Ro B"], label: "7th_place_final" },
        { managers: ["Palanki", "Ro K"], label: "sacko_roundrobin" },
        { managers: ["Smeet", "Asad"], label: "sacko_roundrobin" }
    ]
};

async function main() {
    const filePath = "src/data/matchups/2021_espn.json";
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));

    data.matchups.forEach(m => {
        if (m.period >= 15 && m.period <= 17) {
            const periodLabels = labels2021[m.period];
            const matchLabel = periodLabels.find(pl => {
                return m.away && pl.managers.includes(m.home.manager) && pl.managers.includes(m.away.manager);
            });
            if (matchLabel) m.label = matchLabel.label;
        }
    });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Successfully applied labels to 2021_espn.json");
}

main();