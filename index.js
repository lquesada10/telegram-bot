require('dotenv').config();

// Si tu Node no trae fetch por defecto:
const fetch = (...args) =>
  import('node-fetch').then(({default: f}) => f(...args));

const { Telegraf, Markup } = require('telegraf');
const bot       = new Telegraf(process.env.BOT_TOKEN);
const MAKE_HOOK = process.env.MAKE_HOOK_URL;

bot.start(ctx =>
  ctx.reply(
    '¡Hola 👋! Bienvenido al bot.',
    Markup.keyboard([
      [ Markup.button.webApp('📝 Reportar problema', process.env.WEBAPP_URL) ]
    ])
    .resize()
    .oneTime()
  )
);

bot.on('web_app_data', async ctx => {
  const payload = JSON.parse(ctx.message.web_app_data.data);

  // 1️⃣ Envío al escenario de Make
  try {
    const res = await fetch(MAKE_HOOK, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    if (!res.ok) console.error('Error Make:', res.status);
  } catch (err) {
    console.error('Fetch failed:', err);
  }

  // 2️⃣ Confirmación dentro de Telegram
  await ctx.reply(
    `✅ Reporte recibido con éxito.\n` +
    `ID interno: <i>${payload.fecha.replace(/[.:]/g, '')}</i>`,
    { parse_mode: 'HTML' }
  );
});

bot
  .launch()
  .then(() => console.log('🤖 Bot en línea'))
  .catch(err => console.error('Error al arrancar:', err));
