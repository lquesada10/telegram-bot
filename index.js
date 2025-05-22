require('dotenv').config();

// Si tu Node no trae fetch por defecto:
const fetch = (...args) =>
  import('node-fetch').then(({ default: f }) => f(...args));

const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// URL del webhook de Make
const MAKE_HOOK = process.env.MAKE_HOOK_URL;

// ✅ Borra el teclado persistente anterior si el usuario manda un mensaje cualquiera
bot.on('message', async (ctx) => {
  if (ctx.message.text !== '/start') {
    await ctx.reply('✅ Listo. Menú eliminado.', {
      reply_markup: {
        remove_keyboard: true
      }
    });
  }
});

// 🧠 Recibe los datos enviados desde las Mini Apps (WebApp)
bot.on('web_app_data', async ctx => {
  const payload = JSON.parse(ctx.message.web_app_data.data);

  // 1️⃣ Enviar datos a Make
  try {
    const res = await fetch(MAKE_HOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('Error Make:', res.status);
  } catch (err) {
    console.error('Fetch failed:', err);
  }

  // 2️⃣ Confirmación en Telegram
  const idInterno = payload.id || (payload.fecha || '').replace(/[.:]/g, '');
  await ctx.reply(
    `✅ ¡Recibido con éxito!\nID interno: <i>${idInterno}</i>`,
    { parse_mode: 'HTML' }
  );
});

// 🚀 Inicia el bot
bot
  .launch()
  .then(() => console.log('🤖 Bot en línea'))
  .catch(err => console.error('Error al arrancar:', err));

