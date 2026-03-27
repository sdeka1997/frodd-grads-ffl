import fs from 'fs/promises';
import path from 'path';

const labels2020 = {
    14: [
        { managers: ["Sai", "Arun"], label: "quarterfinal" },
        { managers: ["Ro B", "Voldemort"], label: "quarterfinal" },
        { managers: ["Asad", "Ameesh"], label: "quarterfinal" },
        { managers: ["Swapnav", "Palanki"], label: "quarterfinal" },
        { managers: ["Manuj", "Smeet"], label: "sacko_roundrobin" },
        { managers: ["Nikhil", "Ro K"], label: "sacko_roundrobin" }
    ],
    15: [
        { managers: ["Sai", "Ro B"], label: "semifinal" },
        { managers: ["Asad", "Swapnav"], label: "semifinal" },
        { managers: ["Palanki", "Ameesh"], label: "5th_place_semifinal" },
        { managers: ["Voldemort", "Arun"], label: "5th_place_semifinal" },
        { managers: ["Manuj", "Nikhil"], label: "sacko_roundrobin" },
        { managers: ["Ro K", "Smeet"], label: "sacko_roundrobin" }
    ],
    16: [
        { managers: ["Sai", "Asad"], label: "championship" },
        { managers: ["Swapnav", "Ro B"], label: "3rd_place_final" },
        { managers: ["Voldemort", "Palanki"], label: "5th_place_final" },
        { managers: ["Ameesh", "Arun"], label: "7th_place_final" },
        { managers: ["Ro K", "Manuj"], label: "sacko_roundrobin" },
        { managers: ["Smeet", "Nikhil"], label: "sacko_roundrobin" }
    ]
};

async function main() {
    const filePath = "src/data/matchups/2020_espn.json";
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));

    data.matchups.forEach(m => {
        if (m.period >= 14 && m.period <= 16) {
            const periodLabels = labels2020[m.period];
            const matchLabel = periodLabels.find(pl => {
                return m.away && pl.managers.includes(m.home.manager) && pl.managers.includes(m.away.manager);
            });
            if (matchLabel) m.label = matchLabel.label;
        }
    });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Successfully applied labels to 2020_espn.json");
}

main();