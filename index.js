require('dotenv').config();
const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

const SUPERVISORES = process.env.SUPERVISOR_IDS.split(',').map(id => Number(id.trim()));

bot.hears('reportar', async ctx => {
  const chatId = ctx.message.from.id;

  if (!SUPERVISORES.includes(chatId)) {
    await ctx.reply('❌ No tienes acceso para reportar problemas.');
    return;
  }

  await ctx.reply('📝 Selecciona la opción para reportar un problema:', {
    reply_markup: {
      inline_keyboard: [
        [{
          text: '📋 Reportar problema',
          web_app: { url: 'https://appmantenimiento.vercel.app' }
        }]
      ]
    }
  });
});

bot.command('desbloquear', async ctx => {
  const userId = ctx.message.from.id;

  if (!SUPERVISORES.includes(userId)) {
    await ctx.reply('❌ No tienes permiso para esta acción.');
    return;
  }

  await ctx.reply('🔓 Acceso a mini-apps en modo manual:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📝 Reportar (manual)', web_app: { url: 'https://appmantenimiento.vercel.app/?modo=manual' } }],
        [{ text: '🛠️ Atender (manual)', web_app: { url: 'https://maintenance-miniapps.vercel.app/?modo=manual' } }],
        [{ text: '✅ Aprobar (manual)', web_app: { url: 'https://maintenance-miniapps-supervisor.vercel.app/?modo=manual' } }],
        [{ text: '✏️ Corregir (manual)', web_app: { url: 'https://maintenance-miniapps-correct.vercel.app/?modo=manual' } }]
      ]
    }
  });
});

bot.on('message', async ctx => {
  const msg = ctx.message.text;
  if (!['/start', 'reportar', '/desbloquear'].includes(msg)) {
    await ctx.reply('✅ Menú eliminado.', {
      reply_markup: { remove_keyboard: true }
    });
  }
});

bot
  .launch()
  .then(() => console.log('🤖 Bot en línea'))
  .catch(err => console.error('Error al arrancar:', err));


