# SWISSO KAFFEE — Офіційний презентаційний каталог

Преміальний презентаційний веб-каталог швейцарсько-німецької кави **SWISSO KAFFEE** та лінійки **HIMMEL KAFFEE** («Geprüfte Qualität»).

## 🌟 Особливості сайту
- **4 тематичні розділи продукції**:
  - ☕ **Зернова кава** (*Geröstete Kaffeebohnen*) — Swisso Barista, Crema, Espresso, Reich Rösten, Himmel Klassisch, Crema, Espresso.
  - ☕ **Мелена кава** (*Gemahlener Kaffee*) — Swisso Mild, Reich Rösten, Himmel Platin.
  - ☕ **Розчинна сублімована кава** (*Gefriergetrocknet*) — скляні банки та дойпаки лінійок Swisso та Himmel Gold.
  - ☕ **Капучино та кавові напої** (*Instant-Kaffeegetränk*) — 14 оригінальних смаків (Amaretto, Dubai Chocolate, Salted Caramel, Pistachio, Irish Cream тощо).
- **Справжні студійні фотографії**: 34 найменування оригінальної продукції з фотографіями упаковки.
- **Інтерактивний Lightbox**: перегляд будь-якої пачки у великому форматі при натисканні на фото.
- **Інтерактивний Coffee Quiz**: підбір ідеального бленду відповідно до смакових вподобань.
- **Відгуки покупців**: порожній блок за замовчуванням із можливістю залишити новий відгук та збереженням у `localStorage`.
- **Без інтернет-кошика та цін**: чистий презентаційний іміджевий формат.

## 🚀 Запуск проекту
Відкрийте `index.html` у будь-якому браузері або запустіть локальний сервер:
```bash
# Python
python -m http.server 8085
```
Сайт відкриється за адресою `http://localhost:8085`.

## 📁 Структура проекту
```
├── assets/
│   ├── images/          # Графічні елементи, фони, іконки
│   └── products/        # Фотографії продукції за 4 категоріями
│       ├── beans/
│       ├── ground/
│       ├── instant/
│       └── cappuccino/
├── index.html           # Головна сторінка каталогу
├── styles.css           # Стилі та дизайн-система (Dark Espresso / Gold)
├── script.js            # Інтерактивність (Quiz, Lightbox, Відгуки, FAQ)
└── README.md            # Опис проекту
```
