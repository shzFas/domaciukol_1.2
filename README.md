# 📋 Task Manager — Trello-style App

> Webová aplikace inspirovaná Trellem pro vizuální správu úkolů pomocí drag & drop.  
> Semester project — Unicorn Vysoká škola

---

## 📖 Vision

Task Manager je webová aplikace inspirovaná nástrojem **Trello**, která umožňuje uživatelům vizuálně organizovat úkoly pomocí přetahování (**drag & drop**). Úkoly jsou zobrazeny jako karty rozdělené do sloupců podle kategorie. Aplikace je určena pro kohokoli, kdo potřebuje přehledný a intuitivní nástroj pro správu každodenních úkolů — bez nutnosti registrace.

Aplikace je postavena na dvou základních entitách:

| Entita | Popis |
|--------|-------|
| **Task** | Karta obsahující název, volitelný popis, termín splnění a stav dokončení |
| **Category** | Sloupec na nástěnce, do kterého patří úkoly (např. *Nevyřízeno, Probíhá, Hotovo*) |

Každý úkol patří do jedné kategorie. Uživatel může úkoly přetahovat mezi sloupci, čímž mění jejich kategorii. Aplikace nevyžaduje registraci ani přihlášení — kdokoli ji může okamžitě začít používat.

---

## 🗂️ Entity Relationship Diagram

```
┌─────────────────────┐          ┌──────────────────────────┐
│      CATEGORY        │          │          TASK             │
├─────────────────────┤          ├──────────────────────────┤
│ id        (PK)      │  1    N  │ id            (PK)       │
│ name                │ ──────── │ name                     │
│ color               │ has many │ description              │
└─────────────────────┘          │ deadline                 │
                                 │ status (done/pending)    │
                                 │ category_id   (FK)       │
                                 └──────────────────────────┘
```

> **1:N** — Jedna kategorie může obsahovat mnoho úkolů. Každý úkol patří právě do jedné kategorie.

---

## ✅ Core Functional Requirements

### User Story 1 — Create a New Task

**Why we need this User Story**
- Bez této funkcionality nelze přidávat nové úkoly na nástěnku a aplikace nemá žádnou hodnotu.
- Uživatelé potřebují rychle vytvořit kartu úkolu a zařadit ji do příslušného sloupce.

**User Story Goal**
- Umožnit uživateli vytvořit novou kartu úkolu s názvem, volitelným popisem a termínem splnění a přiřadit ji do vybraného sloupce.
- Po vytvoření se karta zobrazí ve zvoleném sloupci na nástěnce.

**User Story Context**  
Uživatel otevře aplikaci Task Manager a chce přidat nový úkol do sloupce. Klikne na tlačítko pro přidání karty, vyplní potřebné údaje a uloží úkol.

**Initial Situation**  
Uživatel má otevřenou nástěnku v prohlížeči. Na nástěnce jsou zobrazeny sloupce (kategorie). Seznam úkolů je prázdný nebo obsahuje již existující karty.

**Scenario**

| Step | Action |
|------|--------|
| Step 1 | Uživatel klikne na tlačítko 'Přidat úkol' ve zvoleném sloupci. |
| Step 2 | Systém zobrazí formulář s poli: Název, Popis a Termín splnění. |
| Step 3 | Uživatel vyplní název úkolu, termín splnění a klikne na 'Uložit'. |
| Step 4 | Systém ověří zadané údaje a uloží úkol. |
| Step 5 | Nová karta úkolu se zobrazí ve zvoleném sloupci na nástěnce. |

**Activity Diagram**
```
        👤 User                    ⚙️ System
    ───────────────             ───────────────
          ●
          │
    ┌─────▼─────┐
    │Click 'Přidat│──────────► ┌─────────────┐
    │   úkol'   │             │Zobrazí formul│
    └───────────┘             │ Název, Termín│
                              └──────┬───────┘
    ┌───────────┐◄────────────────────┘
    │ Vyplní    │
    │ název,    │
    │ termín    │
    └─────┬─────┘
          │
    ┌─────▼─────┐
    │Click'Uložit│──────────► ┌─────────────┐
    └───────────┘             │  Validace?  │◆
                              └──┬───────┬──┘
                              ok │       │ chyba
                                 ▼       ▼
                          ┌──────────┐ ┌─────────┐
                          │Uloží,    │ │ Zobrazí │
                          │zobrazí   │ │  chybu  │
                          │na nástěnc│ └─────────┘
                          └────┬─────┘
                               │
                               ◎
```

---

### User Story 2 — Move Task (Drag & Drop)

**Why we need this User Story**
- Bez této funkcionality nelze vizuálně měnit stav úkolu a aplikace se neliší od obyčejného seznamu.
- Přetahování karet mezi sloupci je hlavní funkce aplikace — umožňuje intuitivně řídit průběh práce.

**User Story Goal**
- Umožnit uživateli přetáhnout kartu úkolu z jednoho sloupce do druhého, čímž se změní kategorie úkolu.
- Po přesunutí se karta okamžitě zobrazí v novém sloupci a změna se uloží.

**User Story Context**  
Uživatel otevře Task Manager a chce přesunout úkol do jiného sloupce, protože se změnil jeho stav. Uchopí kartu a přetáhne ji do cílového sloupce.

**Initial Situation**  
Uživatel má otevřenou nástěnku s několika sloupci a kartami úkolů. Jeden z úkolů je třeba přesunout do jiného sloupce.

**Scenario**

| Step | Action |
|------|--------|
| Step 1 | Uživatel uchopí kartu úkolu kliknutím a podržením. |
| Step 2 | Systém vizuálně zvýrazní možné cílové sloupce. |
| Step 3 | Uživatel přetáhne kartu nad cílový sloupec. |
| Step 4 | Systém zvýrazní cílový sloupec jako místo pro vložení. |
| Step 5 | Uživatel pustí kartu — systém aktualizuje kategorii a zobrazí kartu v novém sloupci. |

**Activity Diagram**
```
        👤 User                    ⚙️ System
    ───────────────             ───────────────
          ●
          │
    ┌─────▼──────┐
    │Uchopí kartu│──────────► ┌──────────────┐
    │(klik+podržen│            │Zvýrazní možné│
    └────────────┘            │  sloupce     │
                              └──────┬───────┘
    ┌────────────┐◄────────────────────┘
    │Přetáhne nad│
    │cíl. sloupec│──────────► ┌──────────────┐
    └────────────┘            │Zvýrazní cíl. │
                              │   sloupec    │
    ┌────────────┐◄────────────────────┘
    │ Pustí kartu│──────────► ┌──────────────┐
    └────────────┘            │Aktualizuje   │
                              │kategorii v DB│
                              └──────┬───────┘
                              ┌──────▼───────┐
                              │Zobrazí kartu │
                              │v novém sloupci
                              └──────┬───────┘
                                     │
                                     ◎
```

---

### User Story 3 — Mark Task as Completed

**Why we need this User Story**
- Bez této funkcionality nelze sledovat dokončené úkoly a nástěnka neodráží skutečný stav práce.
- Označení úkolu jako hotového udržuje nástěnku přehlednou a motivuje uživatele.

**User Story Goal**
- Umožnit uživateli označit kartu úkolu jako dokončenou jednou akcí.
- Dokončené karty jsou vizuálně odlišeny od nedokončených.

**User Story Context**  
Uživatel otevře Task Manager a chce označit dokončený úkol jako hotový. Potřebuje aktualizovat stav karty, aby nástěnka odrážela skutečný pokrok.

**Initial Situation**  
Uživatel má otevřenou nástěnku se seznamem karet. Jedna z karet má stav 'Nevyřízeno' a uživatel ji právě dokončil.

**Scenario**

| Step | Action |
|------|--------|
| Step 1 | Uživatel najde kartu úkolu na nástěnce. |
| Step 2 | Uživatel klikne na zaškrtávací políčko nebo tlačítko 'Označit jako hotové'. |
| Step 3 | Systém aktualizuje stav úkolu z 'Nevyřízeno' na 'Hotovo'. |
| Step 4 | Systém vizuálně označí kartu — přeškrtnutí + zelené ✓. |
| Step 5 | Karta zůstane viditelná na nástěnce, ale je vizuálně odlišena. |

**Activity Diagram**
```
        👤 User                    ⚙️ System
    ───────────────             ───────────────
          ●
          │
    ┌─────▼──────┐
    │Najde kartu │
    │na nástěnce │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │Klikne      │──────────► ┌──────────────┐
    │'Označit    │            │Aktualizuje   │
    │jako hotové'│            │stav → Hotovo │
    └────────────┘            └──────┬───────┘
                              ┌──────▼───────┐
                              │Zobrazí přeškr│
                              │tnutí + zel. ✓│
                              └──────┬───────┘
    ┌────────────┐◄────────────────────┘
    │Vidí kartu  │
    │dokončenou ✓│
    └─────┬──────┘
          │
          ◎
```

---

### User Story 4 — Delete a Task

**Why we need this User Story**
- Bez této funkcionality se na nástěnce hromadí zastaralé karty, které znepřehledňují zobrazení.
- Uživatelé potřebují odstranit karty, které již nejsou relevantní nebo byly vytvořeny omylem.

**User Story Goal**
- Trvale odstranit kartu úkolu z nástěnky tak, aby se již nezobrazovala v žádném sloupci.
- Potvrzovací krok zabraňuje náhodnému smazání.

**User Story Context**  
Uživatel otevře Task Manager a chce odstranit úkol, který již není relevantní. Potřebuje vyčistit nástěnku od nepotřebných karet.

**Initial Situation**  
Uživatel má otevřenou nástěnku. Na nástěnce existuje karta úkolu, kterou chce trvale odstranit.

**Scenario**

| Step | Action |
|------|--------|
| Step 1 | Uživatel najde kartu úkolu na nástěnce. |
| Step 2 | Uživatel klikne na tlačítko 'Smazat' (ikona koše) na kartě. |
| Step 3 | Systém zobrazí potvrzovací dialog: *'Opravdu chcete tento úkol smazat? Tuto akci nelze vrátit zpět.'* |
| Step 4 | Uživatel potvrdí smazání kliknutím na 'Smazat'. |
| Step 5 | Systém odstraní kartu a nástěnka se okamžitě aktualizuje. |

**Activity Diagram**
```
        👤 User                    ⚙️ System
    ───────────────             ───────────────
          ●
          │
    ┌─────▼──────┐
    │Najde kartu,│──────────► ┌──────────────┐
    │klikne 🗑   │            │Zobrazí potvrz│
    └────────────┘            │   ovací dialog│
                              └──────┬───────┘
                              ┌──────▼───────┐
                              │  Potvrdit?  ◆│
                              └──┬───────┬───┘
                          potvrdit│       │zrušit
                                 ▼       ▼
                          ┌──────────┐ ┌──────────┐
                          │Odstraní  │ │Karta zůst│
                          │úkol z DB │ │na nástěnce
                          └────┬─────┘ └──────────┘
                          ┌────▼─────┐
                          │Aktualizuj│
                          │e nástěnku│
                          └────┬─────┘
                               │
                               ◎
```

---

## 🛠️ Tech Stack

- **Frontend:** React
- **Backend:** Node.js
- **Database:** MongoDB

---

## 🚀 Getting Started

```bash
# Clone repository
git clone https://github.com/shzFas/domaciukol_1.2.git

# Install dependencies
npm install

# Run the app
npm start
```
