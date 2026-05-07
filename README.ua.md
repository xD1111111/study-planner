# Study Planner

Мова: [English](README.md) | **Українська**

## Скриншот

![Скриншот Study Planner](docs/screenshot.png)

Якщо скриншот ще не відображається, додай зображення сайту як `docs/screenshot.png`.

## Огляд

Study Planner — це SvelteKit застосунок для організації навчальних завдань. Він дозволяє додавати завдання, вказувати предмети й дедлайни, позначати завдання виконаними, фільтрувати список, сортувати задачі та відстежувати прогрес через просту статистику.

Завдання зберігаються локально в браузері через `localStorage`, тому бекенд не потрібен.

## Можливості

- Додавання навчальних завдань із назвою, предметом, дедлайном і пріоритетом.
- Позначення завдань як виконаних або їх відновлення.
- Видалення завдань.
- Фільтрація за всіма, активними або виконаними завданнями.
- Сортування за датою створення, пріоритетом або дедлайном.
- Підсвічування прострочених активних завдань.
- Статистика: всього, виконано, активних і відсоток прогресу.
- Адаптивний інтерфейс для desktop і mobile.

## Технології

- SvelteKit
- Svelte 5
- TypeScript
- Tailwind CSS 4
- Vite
- ESLint
- Prettier

## Запуск проєкту

Встановити залежності:

```bash
npm install
```

Запустити dev-сервер:

```bash
npm run dev
```

Зібрати production build:

```bash
npm run build
```

Переглянути production build локально:

```bash
npm run preview
```

## Доступні команди

- `npm run dev`: запускає локальний dev-сервер.
- `npm run build`: створює production build.
- `npm run preview`: запускає локальний preview production build.
- `npm run check`: виконує SvelteKit sync і Svelte diagnostics.
- `npm run check:watch`: запускає diagnostics у watch mode.
- `npm run lint`: перевіряє форматування та запускає ESLint.
- `npm run format`: форматує файли через Prettier.

## Структура проєкту

```text
src/
  lib/
    components/
      PageHeader.svelte
      TaskCard.svelte
      TaskFilters.svelte
      TaskForm.svelte
      TaskList.svelte
      TaskStats.svelte
    styles.ts
    types.ts
  routes/
    +layout.svelte
    +page.svelte
  app.css
```

## Збереження даних

Завдання зберігаються в браузерному `localStorage` за ключем `study-planner-tasks`.

Оскільки застосунок використовує локальне сховище браузера, дані прив'язані до конкретного браузера й пристрою. Після очищення site data або переходу в інший браузер завдання не збережуться.

## Перевірки якості

Перед комітом варто запускати:

```bash
npm run check
npm run lint
npm run build
```

## Ліцензія

Проєкт ліцензовано під MIT License. Дивись [LICENSE](LICENSE).

## Сторонні бібліотеки

Прямі сторонні залежності перелічені у [THIRD_PARTY_LIBRARIES.md](THIRD_PARTY_LIBRARIES.md).
