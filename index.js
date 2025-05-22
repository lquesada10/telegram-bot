require('dotenv').config();

const fetch = (...args) =>
  import('node-fetch').then(({ default: f }) => f(...args));

const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// Lista de supervisores autorizados
const SUPERVISORES = [7939979525]; // Agrega más IDs si hace falta

const MAKE_HOOK = process.env.MAKE_HOOK_URL;

// /start muestra botón SOLO a supervisores
bot.start(async ctx => {
  const chatId = ctx.from.id;  // 🔁 corregido

  if (!SUPERVISORES.includes(chatId)) {
    await ctx.reply('❌ No tienes acceso para reportar problemas.');
    return;
  }

  await ctx.reply('👋 Hola supervisor, selecciona una opción:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📋 Reportar problema',
            web_app: { url: process.env.WEBAPP_URL }
          }
        ]
      ]
    }
  });
});

// Limpieza si escriben otra cosa
bot.on('message', async (ctx) => {
  if (ctx.message.text !== '/start') {
    await ctx.reply('✅ Menú eliminado.', {
      reply_markup: { remove_keyboard: true }
    });
  }
});

// Recibe datos desde MiniApp y los manda a Make
bot.on('web_app_data', async ctx => {
  const payload = JSON.parse(ctx.message.web_app_data.data);

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

  const idInterno = payload.id || (payload.fecha || '').replace(/[.:]/g, '');
  await ctx.reply(
    `✅ ¡Recibido con éxito!\nID interno: <i>${idInterno}</i>`,
    { parse_mode: 'HTML' }
  );
});

bot
  .launch()
  .then(() => console.log('🤖 Bot en línea'))
  .catch(err => console.error('Error al arrancar:', err));
