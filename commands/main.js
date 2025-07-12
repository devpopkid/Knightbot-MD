const settings = require("../settings");

async function helpCommand(sock, jid, quotedMsg, message, menuType = "all") {
  const helpMenus = {
    all: `
╭═══⌬ 『 🌌 ${settings.botName || "Zenthra-MD"} 』⌬═══
│ 🧩 vᴇʀsɪᴏɴ: ${settings.version || "0.0.1"}
│ 👑 ᴏᴡɴᴇʀ: ${settings.botOwner || "Mr Malvin King"}
│ 📺 ʏᴏᴜᴛᴜʙᴇ: ${global.ytch || "https://youtube.com/@malvintech2"}
╰══⌬════════════⌬══    

> ᴛʏᴘᴇ .1 ᴏʀ ᴍᴀɪɴᴍᴇɴᴜ ᴛᴏ ᴠɪᴇᴡ ᴛʜᴇ ᴄᴍᴅs ʟɪsᴛs        
╭─╼『 🤖 𝐁𝐎𝐓 𝐌𝐄𝐍𝐔 』╾─╮
│
│ .1   🧭 ᴍᴀɪɴᴍᴇɴᴜ
│ .2   🛠 ᴀᴅᴍɪɴᴍᴇɴᴜ
│ .3   👑 ᴏᴡɴᴇʀᴍᴇɴᴜ
│ .4   🖼 sᴛɪᴄᴋᴇʀᴍᴇɴᴜ
│ .5   🎮 ɢᴀᴍᴇᴍᴇɴᴜ
│ .6   🤖 ᴀɪᴍᴇɴᴜ
│ .7   🎉 ғᴜɴᴍᴇɴᴜ
│ .8   🅻 ʟᴏɢᴏᴍᴇɴᴜ
│ .9   ⬇️ ᴅʟᴍᴇɴᴜ
│ .10  💻 ɢɪᴛᴍᴇɴᴜ
│
╰────────────────────╯
> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍᴀʟᴠɪɴ ᴋɪɴɢ
`,
    main: `
╭─╼『 🧭 𝐌𝐀𝐈𝐍 𝐌𝐄𝐍𝐔 』╾─
│ .help
│ .menu
│ .ping
│ .alive
│ .tts <text>
│ .gpt
│ .trt <txt>
│ .ss <link>
│ .owner
│ .quote
│ .joke
│ .fact
│ .weather
│ .lyrics
│ .8ball
│ .groupinfo
│ .staff
╰───────────
`,
    admin: `
╭─╼『 🛠 𝐀𝐃𝐌𝐈𝐍 𝐓𝐎𝐎𝐋𝐒 』╾─
│ .ban
│ .promote
│ .demote
│ .mute
│ .unmute
│ .clear
│ .kick
│ .warn
│ .warnings
│ .antilink
│ .antibadword
│ .tag
│ .tagall
│ .chatbot
│ .welcome
│ .goodbye
╰───────────
`,
    owner: `
╭─╼『 👑 𝐎𝐖𝐍𝐄𝐑 𝐌𝐄𝐍𝐔 』╾
│ .mode
│ .autostatus
│ .clearsession
│ .antidelete
│ .cleartmp
│ .setpp
│ .autoreact
╰───────────
`,
    image: `
╭─╼『 🖼 𝐈𝐌𝐀𝐆𝐄/𝐒𝐓𝐈𝐂𝐊𝐄𝐑 』╾─
│ .blur
│ .sticker
│ .simage
│ .take
│ .emojimix
│ .tgsticker
│ .meme
╰──────────────
`,
    game: `
╭─╼『 🎮 𝐆𝐀𝐌𝐄 𝐙𝐎𝐍𝐄 』╾─
│ .tictactoe
│ .guess
│ .hangman
│ .trivia
│ .answer
│ .truth
│ .dare
╰──────────
`,
    ai: `
╭─╼『 🤖 𝐀𝐈 𝐅𝐄𝐀𝐓𝐔𝐑𝐄𝐒 』╾─
│ .gpt
│ .gemini
│ .imagine
│ .flux
╰──────────
`,
    fun: `
╭─╼『 🎉 𝐅𝐔𝐍 𝐌𝐄𝐍𝐔 』╾─
│ .flirt
│ .insult
│ .compliment
│ .character
│ .goodnight
│ .roseday
│ .wasted
│ .ship
│ .simp
│ .stupid
╰─────────────
`,
    logo: `
╭─╼『 🅻 𝐋𝐎𝐆𝐎/𝐓𝐄𝐗𝐓 』╾─
│ .fire
│ .thunder
│ .devil
│ .neon
│ .ice
│ .matrix
│ .leaves
│ .hacker
│ .blackpink
│ .1917
│ .snow
│ .glitch
│ .arena
╰─────────────
`,
    download: `
╭─╼『 ⬇️ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑𝐒 』╾─
│ .play
│ .song
│ .instagram
│ .facebook
│ .tiktok
╰──────────────
`,
    github: `
╭─╼『 💻 𝐆𝐈𝐓𝐇𝐔𝐁/𝐑𝐄𝐏𝐎 』╾─
│ .git
│ .github
│ .sc
│ .script
│ .repo
╰───────────────
`
  };

  const selectedMenu = helpMenus[menuType] || helpMenus.all;
  const imageUrl = settings.menuImageUrl || "https://files.catbox.moe/rldm4o.png";

  try {
    await sock.sendMessage(
      jid,
      {
        image: { url: imageUrl },
        caption: selectedMenu,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363402507750390@newsletter",
            newsletterName: "Zenthra MD",
            serverMessageId: -1
          }
        }
      },
      { quoted: quotedMsg }
    );
  } catch (err) {
    console.error("❌ Error sending help menu:", err);
    await sock.sendMessage(jid, { text: selectedMenu }, { quoted: quotedMsg });
  }
}

module.exports = helpCommand;
