import os
import shutil

src_dir = r"assets\coffee_photos"
products_dir = r"assets\products"

mapping = {
    # Beans
    "beans": [
        ("WhatsApp Image 2026-09-18 at 09.44.12.jpeg", "swisso_barista_1kg.jpg", "Swisso Barista 100% Arabica", "1 кг", "Зернова"),
        ("WhatsApp Image 2026-09-18 at 09.44.13 (1).jpeg", "swisso_crema_1kg.jpg", "Swisso Crema 100% Arabica", "1 кг", "Зернова"),
        ("WhatsApp Image 2026-09-18 at 09.44.13 (4).jpeg", "swisso_espresso_1kg.jpg", "Swisso Espresso 100% Arabica", "1 кг", "Зернова"),
        ("WhatsApp Image 2026-09-18 at 09.44.12 (3).jpeg", "swisso_reich_rosten_1kg.jpg", "Swisso Reich Rösten 100% Arabica", "1 кг", "Зернова"),
        ("WhatsApp Image 2026-09-18 at 09.44.09 (4).jpeg", "swisso_reich_rosten_500g.jpg", "Swisso Reich Rösten 100% Arabica", "500 г", "Зернова"),
        ("WhatsApp Image 2026-09-18 at 09.44.05 (3).jpeg", "himmel_crema_500g.jpg", "Himmel Crema 100% Arabica", "500 г", "Зернова"),
        ("WhatsApp Image 2026-09-18 at 09.44.05 (2).jpeg", "himmel_espresso_500g.jpg", "Himmel Espresso 100% Arabica", "500 г", "Зернова"),
        ("WhatsApp Image 2026-09-18 at 09.44.13 (6).jpeg", "himmel_klassisch_1kg.jpg", "Himmel Klassisch", "1 кг", "Зернова"),
    ],
    # Ground
    "ground": [
        ("WhatsApp Image 2026-09-18 at 09.44.12 (1).jpeg", "swisso_mild_500g.jpg", "Swisso Mild 100% Arabica Gemahlen", "500 г", "Мелена"),
        ("WhatsApp Image 2026-09-18 at 09.44.14 (1).jpeg", "swisso_reich_rosten_250g.jpg", "Swisso Reich Rösten 100% Arabica Gemahlen", "250 г", "Мелена"),
        ("WhatsApp Image 2026-09-18 at 09.44.12 (2).jpeg", "swisso_reich_rosten_500g.jpg", "Swisso Reich Rösten 100% Arabica Gemahlen", "500 г", "Мелена"),
        ("WhatsApp Image 2026-09-18 at 09.44.10.jpeg", "himmel_platin_250g.jpg", "Himmel Platin Gemahlen", "250 г", "Мелена"),
        ("WhatsApp Image 2026-09-18 at 09.44.13 (5).jpeg", "himmel_platin_500g.jpg", "Himmel Platin Gemahlen", "500 г", "Мелена"),
    ],
    # Instant
    "instant": [
        ("WhatsApp Image 2026-09-18 at 09.44.11 (1).jpeg", "swisso_barista_jar_200g.jpg", "Swisso Barista Gefriergetrocknet", "200 г", "Розчинна"),
        ("WhatsApp Image 2026-09-18 at 09.44.13.jpeg", "swisso_reich_rosten_jar_200g.jpg", "Swisso Reich Rösten Gefriergetrocknet", "200 г", "Розчинна"),
        ("WhatsApp Image 2026-09-18 at 09.44.12 (4).jpeg", "swisso_reich_rosten_jar_100g.jpg", "Swisso Reich Rösten Gefriergetrocknet", "100 г", "Розчинна"),
        ("WhatsApp Image 2026-09-18 at 09.44.11 (2).jpeg", "swisso_reich_rosten_jar_50g.jpg", "Swisso Reich Rösten Gefriergetrocknet", "50 г", "Розчинна"),
        ("WhatsApp Image 2026-09-18 at 09.44.14.jpeg", "swisso_reich_rosten_pouch_120g.jpg", "Swisso Reich Rösten Pouch", "120 г", "Розчинна"),
        ("WhatsApp Image 2026-09-18 at 09.44.13 (2).jpeg", "himmel_gold_jar_100g.jpg", "Himmel Gold Gefriergetrocknet", "100 г", "Розчинна"),
        ("WhatsApp Image 2026-09-18 at 09.44.13 (3).jpeg", "himmel_gold_jar_200g.jpg", "Himmel Gold Gefriergetrocknet", "200 г", "Розчинна"),
    ],
    # Cappuccino & specialty
    "cappuccino": [
        ("WhatsApp Image 2026-09-18 at 09.44.09 (2).jpeg", "swisso_cappuccino_amaretto_1kg.jpg", "Swisso Cappuccino Amaretto", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.05 (1).jpeg", "swisso_cappuccino_dubai_1kg.jpg", "Swisso Cappuccino Dubai Style Schokolade (Limited Edition)", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.05.jpeg", "swisso_cappuccino_salted_caramel_1kg.jpg", "Swisso Cappuccino Gesalzenes Karamell", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.09 (1).jpeg", "swisso_cappuccino_caramel_1kg.jpg", "Swisso Cappuccino Karamell", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.08 (1).jpeg", "swisso_cappuccino_hazelnut_1kg.jpg", "Swisso Cappuccino Haselnuss", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.08 (2).jpeg", "swisso_cappuccino_pistachio_1kg.jpg", "Swisso Cappuccino Pistazie", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.08 (3).jpeg", "swisso_cappuccino_vanilla_1kg.jpg", "Swisso Cappuccino Vanille", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.08 (4).jpeg", "swisso_cappuccino_kakaonote_1kg.jpg", "Swisso Cappuccino Kakaonote", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.08 (5).jpeg", "swisso_cappuccino_irish_cream_1kg.jpg", "Swisso Cappuccino Irish Cream", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.08.jpeg", "swisso_cappuccino_white_1kg.jpg", "Swisso Cappuccino White", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.07.jpeg", "swisso_cappuccino_wiener_melange_1kg.jpg", "Swisso Cappuccino Wiener Melange", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.09 (3).jpeg", "swisso_cappuccino_tiramisu_1kg.jpg", "Swisso Cappuccino Tiramisu", "1 кг", "Капучино"),
        ("WhatsApp Image 2026-09-18 at 09.44.09.jpeg", "swisso_trink_schokolade_1kg.jpg", "Swisso Trink-Schokolade", "1 кг", "Шоколадний напій"),
        ("WhatsApp Image 2026-09-18 at 09.44.11.jpeg", "swisso_creamer_200g.jpg", "Swisso Creamer Kaffeeweißer", "200 г", "Вершки"),
    ]
}

total_copied = 0
for cat, items in mapping.items():
    target_folder = os.path.join(products_dir, cat)
    os.makedirs(target_folder, exist_ok=True)
    for src_file, dest_file, title, weight, kind in items:
        src_path = os.path.join(src_dir, src_file)
        dest_path = os.path.join(target_folder, dest_file)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dest_path)
            total_copied += 1
            print(f"[{cat}] Copied {src_file} -> {dest_file}")
        else:
            print(f"MISSING: {src_path}")

print(f"\nDone! Copied {total_copied} product photos.")
