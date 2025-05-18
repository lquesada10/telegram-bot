// api/webhook.js
require('dotenv').config();
// si usas Node <18 tienes que traer fetch manualmente:
const fetch = (...args) =>
  import('node-fetch').then(({ default: f }) => f(...args));

const { Telegraf, Markup } = require('telegraf');
// resto del archivo...


// Inicializa tu bot con el token de env var
const bot = new Telegraf(process.env.BOT_TOKEN);
const MAKE_HOOK = process.env.MAKE_HOOK_URL;
const WEBAPP_REPORT = process.env.WEBAPP_REPORT_URL;
const WEBAPP_TECH   = process.env.WEBAPP_TECH_URL;

// 1️⃣ Definir tus comandos /start y teclado
bot.start(ctx =>
  ctx.reply(
    '¡Hola 👋! Elige una opción:',
    Markup.keyboard([
      [ Markup.button.webApp('📝 Reportar problema', WEBAPP_REPORT) ],
      [ Markup.button.webApp('⚙️ Atender reporte', WEBAPP_TECH) ]
    ])
    .resize()
    .oneTime()
  )
);

// 2️⃣ Manejo de los datos que te envía la mini-app
bot.on('web_app_data', async ctx => {
  const payload = JSON.parse(ctx.message.web_app_data.data);
  try {
    await fetch(MAKE_HOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (err) {
    console.error('❌ Error enviando a Make:', err);
  }
  await ctx.reply(`✅ Reporte recibido. ID: <i>${payload.fecha.replace(/[.:]/g,'')}</i>`, { parse_mode: 'HTML' });
});

// 3️⃣ Exportar el handler que Vercel invocará
module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Pasa la actualización de Telegram a Telegraf
      await bot.handleUpdate(req.body, res);
    } catch (err) {
      console.error(err);
      // Telegram exige 200 OK
      res.status(200).end();
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};

