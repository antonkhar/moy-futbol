# Мой футбол

Праздничная игра 1 на 1 — подарок на день рождения. Выбирайте футболистов из друзей, играйте на одном устройстве (ПК или телефон).

## Быстрый старт

```bash
npm install
npm run dev
```

Откройте в браузере адрес из терминала (обычно `http://localhost:5173`).

## Персонализация

Всё настраивается в одном файле: [`src/config/gameConfig.ts`](src/config/gameConfig.ts)

| Параметр | Описание |
|----------|----------|
| `birthdayName` | Имя именинника |
| `introMessage` | Текст поздравления |
| `goalPhrases` | Фразы при голе |
| `winPhrases` | Фразы победителю |
| `insideJokes` | Внутренние шутки и отсылки |
| `endMatchMessage` | Фраза в конце каждого матча |
| `players[].selectQuote` | Фраза при выборе футболиста |

## Лица футболистов

Положите фото в папку `public/assets/faces/`:

| Файл | Игрок |
|------|-------|
| `nika.png` | Ника |
| `arina.png` | Арина |
| `anton.png` | Антон |
| `vitalik.png` | Виталик |
| `simba.png` | Симба |
| `ilya.png` | Илья |

Мяч: `public/assets/ball.png` (квадрат, ~64–128 px).

Рекомендуемый размер лиц: **256×256 px**, квадрат, PNG или JPG.  
Пока файлов нет — показываются цветные заглушки с инициалами.

## Управление

| Игрок | Клавиатура | Телефон |
|-------|------------|---------|
| Игрок 1 | W A S D | Левый джойстик |
| Игрок 2 | Стрелки | Правый джойстик |

## Дата открытия (сюрприз)

Игра открывается **11 июня 2026 в 00:00 по Москве**. До этого показывается заглушка.

### Тестовый режим (в URL)

| Ссылка | Эффект |
|--------|--------|
| `?test=locked` | Принудительно заглушка |
| `?test=unlocked` | Принудительно игра (проверить до 11 июня) |

Пример: `https://antonkhar.github.io/moy-futbol/?test=unlocked`

Тексты — в `gameConfig.ts`: `unlockDateIso`, `lockedMessage`.

## Правила

- Матч длится **2 минуты** или до **3 голов**
- При голе — конфетти и праздничная фраза
- Победитель получает титул и конфетти

## Деплой на GitHub Pages (пошагово)

В проекте уже есть workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — после push игра публикуется автоматически.

### 1. Создайте репозиторий на GitHub

1. Зайдите на [github.com](https://github.com) → **New repository**
2. Имя, например: `moy-futbol` (запомните — оно будет в ссылке)
3. **Public**, без README (он уже есть локально)
4. Нажмите **Create repository**

### 2. Загрузите код

В папке проекта в терминале:

```bash
git init
git add .
git commit -m "Мой футбол — подарок-игра"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПО.git
git push -u origin main
```

Замените `ВАШ_ЛОГИН` и `ИМЯ_РЕПО` на свои значения.

### 3. Включите GitHub Pages

1. Репозиторий → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. После первого push откройте вкладку **Actions** — дождитесь зелёной галочки у «Deploy to GitHub Pages»

### 4. Ссылка для друга

Игра будет доступна по адресу:

```
https://ВАШ_ЛОГИН.github.io/ИМЯ_РЕПО/
```

Например: `https://nika.github.io/moy-futbol/`

Отправьте эту ссылку в поздравлении. На телефоне можно **Добавить на главный экран** (PWA).

### Обновление игры

После правок (лица, шутки, имя):

```bash
git add .
git commit -m "Обновил поздравление"
git push
```

Через 1–2 минуты сайт обновится сам.

## Другие способы отдать подарок

```bash
npm run build
```

Папка `dist/` — готовая игра для Netlify, архива или `npm run preview`.

## Стек

- [Vite](https://vitejs.dev/) + TypeScript
- [Phaser 4](https://phaser.io/) — игровой движок
- [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) — конфетти
- vite-plugin-pwa — офлайн и установка на телефон
