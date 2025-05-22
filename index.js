require('dotenv').config();

const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

// Lista de supervisores autorizados
const SUPERVISORES = [7939979525];

// Muestra botón solo si escribe "reportar"
bot.hears('reportar', async ctx => {
  const chatId = ctx.message.from.id;

  if (!SUPERVISORES.includes(chatId)) {
    await ctx.reply('❌ No tienes acceso para reportar problemas.');
    return;
  }

  await ctx.reply('📝 Selecciona la opción para reportar un problema:', {
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

// Limpia menú si escriben otra cosa
bot.on('message', async ctx => {
  const msg = ctx.message.text;
  if (msg !== '/start' && msg !== 'reportar') {
    await ctx.reply('✅ Menú eliminado.', {
      reply_markup: { remove_keyboard: true }
    });
  }
});

// Lanzar bot
bot
  .launch()
  .then(() => console.log('🤖 Bot en línea'))
  .catch(err => console.error('Error al arrancar:', err));
