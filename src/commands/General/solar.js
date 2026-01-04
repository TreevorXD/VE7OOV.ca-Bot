const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const xml2js = require('xml2js');

module.exports = {
    data: {
        name: 'solar',
        description: 'Shows current solar conditions'
    },

    run: async ({ interaction }) => {
        await interaction.deferReply();

        try {
            const res = await axios.get('https://www.hamqsl.com/solarxml.php');
            const xml = res.data;

            const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false });
            const s = parsed.solar.solardata;

            // Format HF band conditions where Day & Night are on the same line
            const hfBands = {};
            for (const band of s.calculatedconditions.band) {
                const name = band.$.name;
                const time = band.$.time;
                const cond = band._;

                if (!hfBands[name]) hfBands[name] = {};
                hfBands[name][time] = cond;
            }

            let hfText = "";
            for (const [band, info] of Object.entries(hfBands)) {
                hfText += `**${band}** | **Day:** ${info.day || "N/A"}   **Night:** ${info.night || "N/A"}\n`;
            }

            // Format VHF conditions
            let vhfText = "";
            for (const p of s.calculatedvhfconditions.phenomenon) {
                vhfText += `**${p.$.name}** (${p.$.location.replace("_", " ")}): ${p._}\n`;
            }

            const embed = new EmbedBuilder()
                .setTitle("📡 Current Solar Conditions")
                .setColor("#1d82b6")
                .setTimestamp()
                .setFooter({ text: "Data from HamQSL.com" })
                .addFields(
                    { name: "📅 Updated", value: s.updated.trim(), inline: false },

                    { name: "🌞 Solar Flux", value: s.solarflux, inline: true },
                    { name: "📉 A-Index", value: s.aindex, inline: true },
                    { name: "📈 K-Index", value: s.kindex, inline: true },

                    { name: "🔆 X-Ray", value: s.xray, inline: true },
                    { name: "🟦 Sunspots", value: s.sunspots, inline: true },
                    { name: "🌬 Solar Wind", value: s.solarwind, inline: true },

                    { name: "🧲 Magnetic Field", value: s.magneticfield, inline: true },
                    { name: "🌐 Geomagnetic", value: s.geomagfield, inline: true },
                    { name: "📡 Noise Level", value: s.signalnoise, inline: true },

                    { name: "☢️ Proton Flux", value: s.protonflux, inline: true },
                    { name: "⚡ Electron Flux", value: s.electonflux, inline: true },
                    { name: "🌌 Aurora", value: s.aurora, inline: true },

                    {
                        name: "📡 HF Band Conditions",
                        value: hfText || "No data available"
                    },
                    {
                        name: "📶 VHF Conditions",
                        value: vhfText || "No data available"
                    }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Could not fetch solar data.");
        }
    },

    options: {}
};
