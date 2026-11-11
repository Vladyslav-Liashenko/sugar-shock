# Candy Shock ⚡

Match-3 игра для Telegram Mini App с пополнением монет за Telegram Stars.

- `index.html` — сама игра (хостится на GitHub Pages)
- `worker.js` — мини-обработчик оплат для Cloudflare Workers (бесплатно, без своего сервера)

## Почему нужен worker

Оплата Stars полностью проходит внутри Telegram, но Telegram требует, чтобы бот:
1. создал счёт (`createInvoiceLink`), для этого нужен токен бота, а его нельзя класть в игру;
2. подтвердил заказ за 10 секунд (`answerPreCheckoutQuery`), иначе платёж отменится.

Это делает `worker.js`. Деньги (Stars) идут на баланс бота, worker их не хранит.

## Запуск

### 1. Игра
GitHub Pages: Settings → Pages → Deploy from branch → `main` / `root`.
Адрес игры: `https://vladyslav-liashenko.github.io/sugar-shock/`

### 2. Worker оплат (Cloudflare, бесплатно)
1. dash.cloudflare.com → Workers & Pages → Create → Worker → назвать `sugar-shock-pay` → Deploy.
2. Edit code → вставить содержимое `worker.js` → Deploy.
3. Settings → Variables and Secrets:
   - `BOT_TOKEN` (Secret) — токен из @BotFather
   - `WEBHOOK_SECRET` (Secret) — любая случайная строка из латиницы и цифр
   - `APP_URL` (Text) — адрес игры из шага 1
   - `SUPPORT` (Text) — контакт для вопросов по оплате, например `@username`
4. Подключить webhook: открыть в браузере (подставить свои значения)
   `https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://sugar-shock-pay.<поддомен>.workers.dev/webhook&secret_token=<WEBHOOK_SECRET>&allowed_updates=["message","pre_checkout_query"]`
   Должно ответить `"ok":true`.

### 3. Связать игру с worker
В `index.html` найти строку `const PAY_API = '';` и вписать адрес worker:
`const PAY_API = 'https://sugar-shock-pay.<поддомен>.workers.dev';`

### 4. BotFather
- `/myapps` → приложение → Edit Web App URL → адрес игры
- `/setmenubutton` → тот же адрес, текст `Грати`
- `/setcommands`: `start - Грати`, `paysupport - Питання щодо оплати`

## Важно
- Монеты начисляются в игре после статуса `paid` от Telegram, прогресс синхронизируется через Telegram CloudStorage.
- Цены пакетов в `index.html` (PACKS) и `worker.js` (PACKS) должны совпадать.
