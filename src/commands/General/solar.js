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
            const embed = new EmbedBuilder()
                .setTitle("📡 Current Solar Conditions")
                .setColor("#1d82b6")
                .setTimestamp()
                .setImage("https://www.hamqsl.com/solar101pic.php")
                .setFooter({ text: "Data from HamQSL.com" })


            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Could not fetch solar data.");
        }
    },

    options: {}
};
