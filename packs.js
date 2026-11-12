// Must match PACKS in public/index.html (index = pack id).
// stars = price in Telegram Stars, coins / gems = what the player gets (gems are the in-game stars).
export const PACKS = [
  { stars: 50,  coins: 120 },
  { stars: 150, coins: 400 },
  { stars: 400, coins: 1200 },
  { stars: 25,  gems: 10 },
  { stars: 75,  gems: 35 },
  { stars: 200, gems: 100 },
];

const TEXT = {
  uk: { coins: '{n} монет', gems: '{n} ігрових зірок', desc: 'Поповнення для Candy Shock ⚡', thanks: 'Дякуємо за покупку! Вона вже у грі ⚡', start: 'Candy Shock ⚡ солодкий match-3 з розрядом струму! Тисни «Грати» 👇', play: '▶️ Грати', support: 'Питання щодо оплати? Напишіть нам: ' },
  ru: { coins: '{n} монет', gems: '{n} игровых звёзд', desc: 'Пополнение для Candy Shock ⚡', thanks: 'Спасибо за покупку! Она уже в игре ⚡', start: 'Candy Shock ⚡ сладкий match-3 с разрядом тока! Жми «Играть» 👇', play: '▶️ Играть', support: 'Вопросы по оплате? Напишите нам: ' },
  en: { coins: '{n} coins', gems: '{n} game stars', desc: 'Top-up for Candy Shock ⚡', thanks: 'Thanks for your purchase! It is already in the game ⚡', start: 'Candy Shock ⚡ a sweet match-3 with an electric twist! Tap “Play” 👇', play: '▶️ Play', support: 'Questions about a payment? Contact us: ' },
};
export const text = lang => TEXT[(lang || '').slice(0, 2)] || TEXT.uk;

// Direct link of the game and the contact for payment questions
export const GAME_LINK = 'https://t.me/sugar_shock_bot/play';
export const SUPPORT = '@your_support_username';
