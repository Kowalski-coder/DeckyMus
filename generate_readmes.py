#!/usr/bin/env python3
import os
from pathlib import Path
import generate_translations

translations = generate_translations.translations

LANGS = [
    ("ru", "Русский"),
    ("en", "English"),
    ("de", "Deutsch"),
    ("fr", "Français"),
    ("es", "Español"),
    ("es-419", "Español (LatAm)"),
    ("it", "Italiano"),
    ("pt-BR", "Português (Brasil)"),
    ("pt", "Português"),
    ("pl", "Polski"),
    ("zh-CN", "简体中文"),
    ("zh-TW", "繁體中文"),
    ("ja", "日本語"),
    ("ko", "한국어"),
    ("uk", "Українська"),
    ("tr", "Türkçe"),
    ("cs", "Čeština"),
    ("da", "Dansk"),
    ("nl", "Nederlands"),
    ("fi", "Suomi"),
    ("el", "Ελληνικά"),
    ("hu", "Magyar"),
    ("no", "Norsk"),
    ("ro", "Română"),
    ("sv", "Svenska"),
    ("vi", "Tiếng Việt"),
    ("bg", "Български"),
    ("id", "Bahasa Indonesia"),
    ("th", "ไทย"),
]

docs_dir = Path("docs")
docs_dir.mkdir(exist_ok=True)

def build_lang_bar(current_code, is_root=False):
    parts = []
    for code, name in LANGS:
        if code == current_code:
            parts.append(f"<b>{name}</b>")
        else:
            if code == "ru":
                url = "README.md" if is_root else "../README.md"
            else:
                url = f"docs/README.{code}.md" if is_root else f"README.{code}.md"
            parts.append(f'<a href="{url}">{name}</a>')
    return "\n  •\n  ".join(parts)

# Section titles in english/russian
SECTION_EXTRA = {
    "ru": ("🎮 Дополнительные особенности", "Управление громкостью, Quick Access Menu, геймпад и навигация", "📦 Установка"),
    "en": ("🎮 Additional Features", "Volume control, Quick Access Menu, Gamepad and Navigation", "📦 Installation"),
    "de": ("🎮 Zusätzliche Funktionen", "Lautstärkeregelung, Quick Access Menu, Gamepad und Navigation", "📦 Installation"),
    "fr": ("🎮 Fonctionnalités supplémentaires", "Contrôle du volume, Menu d'accès rapide, manette et navigation", "📦 Installation"),
    "es": ("🎮 Características adicionales", "Control de volumen, Menú de acceso rápido, mando y navegación", "📦 Instalación"),
    "es-419": ("🎮 Características adicionales", "Control de volumen, Menú de acceso rápido, mando y navegación", "📦 Instalación"),
    "it": ("🎮 Caratteristiche aggiuntive", "Controllo volume, Quick Access Menu, controller e navigazione", "📦 Installazione"),
    "pt-BR": ("🎮 Recursos adicionais", "Controle de volume, Quick Access Menu, controle e navegação", "📦 Instalação"),
    "pt": ("🎮 Recursos adicionais", "Controlo de volume, Quick Access Menu, comando e navegação", "📦 Instalação"),
    "pl": ("🎮 Dodatkowe funkcje", "Regulacja głośności, Quick Access Menu, kontroler i nawigacja", "📦 Instalacja"),
    "zh-CN": ("🎮 额外特性", "独立音量调节、快捷菜单 (QAM)、手柄控制与原生界面", "📦 安装指南"),
    "zh-TW": ("🎮 額外特性", "獨立音量調節、快捷選單 (QAM)、手把控制與原生介面", "📦 安裝指南"),
    "ja": ("🎮 追加機能", "音量調節、クイックアクセス、ゲームパッド対応", "📦 インストール"),
    "ko": ("🎮 추가 기능", "볼륨 조절, 퀵 액세스 메뉴 (QAM), 게임패드 컨트롤", "📦 설치 방법"),
    "uk": ("🎮 Додаткові можливості", "Керування гучністю, Quick Access Menu, геймпад та навігація", "📦 Встановлення"),
    "tr": ("🎮 Ek Özellikler", "Ses kontrolü, Hızlı Erişim Menüsü, oyun kumandası ve gezinme", "📦 Kurulum"),
    "cs": ("🎮 Další funkce", "Ovládání hlasitosti, Quick Access Menu, gamepad a navigace", "📦 Instalace"),
    "da": ("🎮 Yderligere funktioner", "Lydstyrkekontrol, Quick Access Menu, controller og navigation", "📦 Installation"),
    "nl": ("🎮 Extra functies", "Volumeregeling, Quick Access Menu, gamepad en navigatie", "📦 Installatie"),
    "fi": ("🎮 Lisäominaisuudet", "Äänenvoimakkuuden säätö, Quick Access Menu, ohjain ja navigointi", "📦 Asennus"),
    "el": ("🎮 Πρόσθετες λειτουργίες", "Έλεγχος έντασης, Quick Access Menu, χειριστήριο και πλοήγηση", "📦 Εγκατάσταση"),
    "hu": ("🎮 További funkciók", "Hangerőszabályzó, Quick Access Menu, kontroller és navigáció", "📦 Telepítés"),
    "no": ("🎮 Tilleggsfunksjoner", "Volumkontroll, Quick Access Menu, spillkontroller og navigasjon", "📦 Installasjon"),
    "ro": ("🎮 Caracteristici suplimentare", "Control volum, Quick Access Menu, gamepad și navigare", "📦 Instalare"),
    "sv": ("🎮 Ytterligare funktioner", "Volymkontroll, Quick Access Menu, handkontroll och navigering", "📦 Installation"),
    "vi": ("🎮 Tính năng bổ sung", "Điều chỉnh âm lượng, Menu truy cập nhanh, tay cầm và điều hướng", "📦 Cài đặt"),
    "bg": ("🎮 Допълнителни функции", "Контрол на звука, Меню за бърз достъп, геймпад и навигация", "📦 Инсталация"),
    "id": ("🎮 Fitur Tambahan", "Kontrol volume, Quick Access Menu, gamepad dan navigasi", "📦 Instalasi"),
    "th": ("🎮 คุณสมบัติเพิ่มเติม", "การควบคุมระดับเสียง, เมนูลัด (QAM), รองรับเกมแพด", "📦 การติดตั้ง"),
}

INSTALL_TEXTS = {
    "ru": """1. Скачайте архив **`DeckyMus.zip`** из последнего [Релиза](https://github.com/Kowalski-coder/DeckyMus/releases).
2. Поместите архив в папку `Загрузки` (`/home/deck/Downloads`) на Steam Deck.
3. Откройте меню **Decky Loader** на консоли.
4. Перейдите в **Настройки (шестерёнка) -> Разработчик -> Установить плагин из ZIP** (или выберите пункт *Install from ZIP*).
5. Выберите скачанный файл `DeckyMus.zip` и подтвердите установку.""",
    "en": """1. Download the **`DeckyMus.zip`** archive from the latest [Release](https://github.com/Kowalski-coder/DeckyMus/releases).
2. Place the archive into your Steam Deck's `Downloads` folder (`/home/deck/Downloads`).
3. Open the **Decky Loader** menu on your Steam Deck.
4. Go to **Settings (gear icon) -> Developer -> Install plugin from ZIP** (*Install from ZIP*).
5. Select the downloaded `DeckyMus.zip` file and confirm the installation."""
}

EXTRA_BULLETS = {
    "ru": """* 🎚️ **Независимая регулировка громкости**: Регулятор громкости плеера в боковом меню (QAM) и вертикальный ползунок во вкладке «Плеер», независимый от системной громкости SteamOS.
* ⚡ **Интеграция в Quick Access Menu (QAM)**: Управление воспроизведением (Play/Pause, следующий/предыдущий трек, случайный порядок, повтор) прямо во время игры.
* 🌐 **Мультиязычность (29 языков)**: Полная поддержка всех 29 языков Steam с автоматическим определением языка системы и возможностью ручного выбора в настройках.""",
    "en": """* 🎚️ **Independent Volume Control**: Dedicated volume slider in Quick Access Menu (QAM) and a vertical slider in the "Now Playing" tab, independent from SteamOS master volume.
* ⚡ **Quick Access Menu (QAM) Integration**: Full playback control (Play/Pause, Next/Prev, Shuffle, Repeat modes) right over any running game.
* 🌐 **Multilingual (29 Languages)**: Complete support for all 29 Steam languages with automatic SteamOS language detection and manual switching in Settings."""
}

def generate_content(lang_code, is_root=False):
    t = translations.get(lang_code, translations["en"])
    preview_path = "assets/preview.png" if is_root else "../assets/preview.png"
    lang_bar = build_lang_bar(lang_code, is_root=is_root)
    
    extra_title, extra_sub, install_title = SECTION_EXTRA.get(lang_code, SECTION_EXTRA["en"])
    install_body = INSTALL_TEXTS.get(lang_code, INSTALL_TEXTS["en"])
    bullets = EXTRA_BULLETS.get(lang_code, EXTRA_BULLETS["en"])
    
    return f"""# DeckyMus 🎵

<p align="center">
  <img src="{preview_path}" alt="DeckyMus Preview" width="850">
</p>

<p align="center">
  <b>{t['aboutTagline']}</b>
</p>

<p align="center">
  {lang_bar}
</p>

---

## 🌟 {t['featuresTitle']}

| { 'Плитка' if lang_code == 'ru' else 'Feature' } | { 'Описание' if lang_code == 'ru' else 'Description' } |
| :--- | :--- |
| 🎧 **{t['featBackgroundTitle']}** | {t['featBackgroundDesc']} |
| 📁 **{t['featLocalTitle']}** | {t['featLocalDesc']} |
| 💜 **{t['featVkTitle']}** | {t['featVkDesc']} |
| 🟡 **{t['featYandexTitle']}** | {t['featYandexDesc']} |
| 🔴 **{t['featYtTitle']}** | {t['featYtDesc']} |
| 💾 **{t['featDownloadTitle']}** | {t['featDownloadDesc']} |

---

## {extra_title}

{bullets}

---

## 🛠 {t['techInfoTitle']}

* **{t['techAudioEngine']}** MPV Headless IPC (PipeWire / ALSA)
* **{t['techInterface']}** SteamOS Native React UI (`@decky/ui`)
* **{t['techConversion']}** FFmpeg & Mutagen ID3
* **{t['techCreatedFor']}**

---

## {install_title}

{install_body}

---

## ☕ Support the Project / Поддержка проекта

<p align="center">
  <a href="https://boosty.to/kowalski1997/donate">
    <img src="https://img.shields.io/badge/Support_Author-Boosty-orange?style=for-the-badge&logo=boosty&logoColor=white" alt="Support on Boosty" height="42">
  </a>
</p>

<p align="center">
  👉 <b><a href="https://boosty.to/kowalski1997/donate">Поддержать автора на Boosty (Donate)</a></b> 🧡
</p>
"""

# Generate root README.md (Russian)
root_content = generate_content("ru", is_root=True)
Path("README.md").write_text(root_content, encoding="utf-8")
print("Generated README.md (Russian)")

# Generate docs/README.<lang>.md for all languages
for code, name in LANGS:
    content = generate_content(code, is_root=False)
    out_file = docs_dir / f"README.{code}.md"
    out_file.write_text(content, encoding="utf-8")
    print(f"Generated docs/README.{code}.md ({name})")

print("All READMEs generated successfully!")
