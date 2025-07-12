/**
 * Knight Bot with Stylish Logging Panel – Based on XeonBotInc
 * By Popkid | MIT License
 */

require('./settings');
const fs = require('fs');
const chalk = require('chalk');
const readline = require('readline');
const PhoneNumber = require('awesome-phonenumber');
const NodeCache = require('node-cache');
const pino = require('pino');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  delay,
} = require('@whiskeysockets/baileys');

const { smsg } = require('./lib/myfunc');
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./main');

let phoneNumber = "2547XXXXXXXX"; // replace with your number
let owner = JSON.parse(fs.readFileSync('./data/owner.json'));

const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const question = (text) => rl ? new Promise(resolve => rl.question(text, resolve)) : Promise.resolve(phoneNumber);

// Message logger to panel
function logMessage(msg) {
  const filePath = './panel/messages.json';
  const messageText =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption || '';
  if (!messageText.trim()) return;
  const log = {
    from: msg.key.remoteJid,
    sender: msg.pushName || "Unknown",
    message: messageText,
    time: new Date().toLocaleString()
  };
  const data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
  data.push(log);
  fs.writeFileSync(filePath, JSON.stringify(data.slice(-50), null, 2));
}

const store = {
  messages: {}, contacts: {}, chats: {},
  bind(ev) {
    ev.on('messages.upsert', ({ messages }) => {
      messages.forEach(msg => {
        if (msg.key?.remoteJid) {
          this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {};
          this.messages[msg.key.remoteJid][msg.key.id] = msg;
        }
      });
    });
  },
  loadMessage: async (jid, id) => store.messages[jid]?.[id] || null
};

async function startXeonBotInc() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const msgRetryCounterCache = new NodeCache();

  const XeonBotInc = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !process.argv.includes('--pairing-code'),
    browser: ["Popkid Xeon", "Chrome", "1.0.0"],
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    getMessage: async (key) => {
      const jid = jidNormalizedUser(key.remoteJid);
      const msg = await store.loadMessage(jid, key.id);
      return msg?.message || '';
    },
    msgRetryCounterCache
  });

  store.bind(XeonBotInc.ev);

  XeonBotInc.ev.on('messages.upsert', async (chatUpdate) => {
    const mek = chatUpdate.messages[0];
    if (!mek?.message) return;
    mek.message = mek.message?.ephemeralMessage?.message || mek.message;
    logMessage(mek); // Save to panel

    if (mek.key.remoteJid === 'status@broadcast') return await handleStatus(XeonBotInc, chatUpdate);
    if (!XeonBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
    if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;

    try {
      await handleMessages(XeonBotInc, chatUpdate, true);
    } catch (err) {
      console.error("❌ Error in handleMessages:", err);
    }
  });

  XeonBotInc.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(chalk.green('✅ XeonBotInc Connected'));

      await XeonBotInc.newsletterFollow("120363420342566562@newsletter").catch(() => {});

      await XeonBotInc.sendMessage(XeonBotInc.user.id, {
        text: `✅ *Knight Bot is Online!*\n\n⏰ Time: ${new Date().toLocaleTimeString()}\n📢 Connected to Popkid Newsletter.`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid Newsletter",
            serverMessageId: -1
          }
        }
      });
    }

    if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
      startXeonBotInc();
    }
  });

  if (process.argv.includes('--pairing-code') && !XeonBotInc.authState.creds.registered) {
    let input = phoneNumber || await question(chalk.cyan('📱 Enter your WhatsApp number (2547XXXXXXX): '));
    input = input.replace(/[^0-9]/g, '');
    if (!PhoneNumber('+' + input).isValid()) {
      console.log(chalk.red('❌ Invalid phone number.'));
      process.exit(1);
    }

    try {
      const code = await XeonBotInc.requestPairingCode(input);
      console.log(chalk.black(chalk.bgGreen('📲 Pairing Code:')), chalk.white(code.match(/.{1,4}/g).join('-')));
      console.log(chalk.yellow('📌 Open WhatsApp > Linked Devices > Link a Device'));
    } catch (err) {
      console.log(chalk.red('❌ Failed to get pairing code'));
      console.error(err);
    }
  }

  XeonBotInc.ev.on('creds.update', saveCreds);
  XeonBotInc.ev.on('group-participants.update', async u => handleGroupParticipantUpdate(XeonBotInc, u));
  XeonBotInc.ev.on('status.update', async s => handleStatus(XeonBotInc, s));
  XeonBotInc.ev.on('messages.reaction', async r => handleStatus(XeonBotInc, r));

  XeonBotInc.public = true;
  XeonBotInc.serializeM = (m) => smsg(XeonBotInc, m, store);
}

startXeonBotInc().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename);
  console.log(chalk.redBright(`🔁 Reloading ${__filename}`));
  delete require.cache[__filename];
  require(__filename);
});
