# ⚽ Typer Liga — Astro + Supabase + Netlify

Aplikacja do typowania wyników meczów dla grupy znajomych.

---

## 🚀 Krok po kroku – pierwsze uruchomienie

### 1. Supabase — baza danych

1. Wejdź na [supabase.com](https://supabase.com) i utwórz nowe konto (lub zaloguj się).
2. Kliknij **New project**, wybierz nazwę, hasło i region (np. `eu-central-1`).
3. Poczekaj ~2 minuty aż projekt się uruchomi.
4. W lewym menu wybierz **SQL Editor** → **New query**.
5. Wklej całą zawartość pliku `supabase-schema.sql` i kliknij **Run**.

#### Klucze API
1. Przejdź do **Project Settings → API**.
2. Skopiuj:
   - `Project URL` → `PUBLIC_SUPABASE_URL`
   - `anon / public` key → `PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

#### Konto admina
1. W Supabase: **Authentication → Users → Add user** (wyłącz "Auto Confirm"?)
2. Podaj email i hasło admina, kliknij **Create user**.
3. Skopiuj `UUID` nowego użytkownika.
4. Wróć do **SQL Editor** i uruchom:
```sql
insert into public.profiles (id, nick, role) values
  ('WKLEJ-UUID', 'Admin', 'admin')
on conflict (id) do update set role = 'admin', nick = 'Admin';
```

---

### 2. Repozytorium GitHub

```bash
# W folderze typer-liga:
git init
git add .
git commit -m "init: typer liga"

# Utwórz nowe repo na GitHub i push:
git remote add origin https://github.com/TWOJ-NICK/typer-liga.git
git push -u origin main
```

---

### 3. Netlify — hosting

1. Wejdź na [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**.
2. Wybierz swoje repo na GitHub.
3. Ustawienia build (powinny się auto-wykryć):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Przejdź do **Site settings → Environment variables** i dodaj:

| Klucz | Wartość |
|---|---|
| `PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` |

5. Kliknij **Deploy site**. Po 2-3 minutach strona będzie dostępna!

---

### 4. Lokalne uruchomienie (development)

```bash
# Skopiuj plik środowiskowy
cp .env.example .env
# Uzupełnij .env swoimi kluczami z Supabase

npm install
npm run dev
# Otwórz http://localhost:4321
```

---

## 🎮 Jak korzystać

### Admin
- Loguje się emailem i hasłem ustawionym w Supabase.
- W panelu **Admin** dodaje mecze (drużyny + data/godzina).
- Przed meczem może zmienić status na 🔴 **Na żywo** (blokuje typy).
- Po meczu wpisuje wynik → tabela rankingowa aktualizuje się automatycznie.
- Dodaje i usuwa uczestników (tworzą konto emailem + hasłem).

### Gracz
- Loguje się emailem i hasłem nadanym przez admina.
- Przed startem meczu podaje typ (wynik np. 2:1).
- Po starcie — typ jest zablokowany.
- Po zakończeniu meczu widzi typy wszystkich i swoje punkty.

---

## 📊 System punktacji

| Wynik | Punkty |
|---|---|
| ⭐ Dokładny wynik (np. 2:1 = 2:1) | **3 pkt** |
| ✓ Właściwy zwycięzca lub remis | **1 pkt** |
| ✗ Błędny typ | **0 pkt** |

---

## 🏗 Struktura projektu

```
typer-liga/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Ranking
│   │   ├── mecze.astro          # Mecze + typy
│   │   ├── admin.astro          # Panel admina
│   │   ├── login.astro          # Logowanie
│   │   └── api/
│   │       ├── login.js
│   │       ├── logout.js
│   │       ├── predict.js
│   │       └── admin/
│   │           ├── add-match.js
│   │           ├── update-match.js
│   │           ├── delete-match.js
│   │           ├── add-user.js
│   │           └── delete-user.js
│   ├── layouts/Layout.astro
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── auth.js
│   │   └── scoring.js
│   └── styles/global.css
├── supabase-schema.sql          # SQL do wklejenia w Supabase
├── astro.config.mjs
├── netlify.toml
└── .env.example
```
