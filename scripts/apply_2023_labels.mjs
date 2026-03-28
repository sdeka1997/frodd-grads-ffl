import fs from 'fs/promises';

const labels2023 = {
    15: [
        { managers: ["Shrey", "Sai"], label: "quarterfinal" },
        { managers: ["Nikhil", "Ameesh"], label: "quarterfinal" },
        { managers: ["Ro B", "Swapnav"], label: "quarterfinal" },
        { managers: ["Manuj", "Ro K"], label: "quarterfinal" },
    ],
    16: [
        { managers: ["Nikhil", "Sai"], label: "semifinal" },
        { managers: ["Swapnav", "Ro K"], label: "semifinal" },
        { managers: ["Shrey", "Manuj"], label: "5th_place_semifinal" },
        { managers: ["Ro B", "Ameesh"], label: "5th_place_semifinal" },
        { managers: ["Arun", "Asad"], label: "sacko_semifinal" },
        { managers: ["Palanki", "Smeet"], label: "sacko_semifinal" }
    ],
    17: [
        { managers: ["Nikhil", "Swapnav"], label: "championship" },
        { managers: ["Ro K", "Sai"], label: "3rd_place_final" },
        { managers: ["Shrey", "Ro B"], label: "5th_place_final" },
        { managers: ["Manuj", "Ameesh"], label: "7th_place_final" },
        { managers: ["Asad", "Smeet"], label: "9th_place_final" },
        { managers: ["Palanki", "Arun"], label: "sacko_final" }
    ]
};

async function main() {
    const filePath = "src/data/matchups/2023_espn.json";
    const data = JSON.parse(await fs.readFile(filePath, "utf8"));

    data.matchups.forEach(m => {
        if (m.period >= 15) {
            const periodLabels = labels2023[m.period];
            const managers = m.away ? [m.home.manager, m.away.manager] : [m.home.manager];
            const matchLabel = periodLabels.find(pl => 
                pl.managers.length === managers.length && 
                pl.managers.every(manager => managers.includes(manager))
            );
            if (matchLabel) m.label = matchLabel.label;
        }
    });

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log("Successfully applied adjusted 2023 labels.");
}

main();
