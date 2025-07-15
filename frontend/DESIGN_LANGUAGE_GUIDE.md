# 🌿 Design Language Naturale - Played

## 📋 Panoramica

Il design language naturale di Played è stato creato specificamente per ragazzi di scuola primaria e secondaria (6-14 anni), con un focus su colori e forme che richiamano la natura per creare un ambiente di apprendimento sereno e coinvolgente.

## 🎨 Palette Colori

### Colori Primari
- **Verde Bosco** `#4A7C59` - Calma, crescita, apprendimento
- **Azzurro Cielo** `#5B9BD5` - Chiarezza, fiducia, apertura mentale  
- **Giallo Sole** `#F4D03F` - Energia, positività, attenzione

### Colori Secondari
- **Arancione Terra** `#E67E22` - Stabilità, calore, sicurezza
- **Verde Foglia** `#7DCE82` - Freschezza, successo, vitalità
- **Marrone Legno** `#8B7355` - Naturalità, solidità, comfort

### Colori Accenti
- **Rosa Fiore** `#F8BBD9` - Gentilezza, creatività
- **Viola Lavanda** `#9B59B6` - Immaginazione, saggezza

### Gradienti Naturali
- `var(--gradient-primary)` - Verde Bosco → Verde Foglia
- `var(--gradient-sky)` - Azzurro Cielo → Azzurro Chiaro
- `var(--gradient-sun)` - Giallo Sole → Giallo Chiaro
- `var(--gradient-earth)` - Arancione Terra → Arancione Chiaro

## 🔘 Componenti

### Bottoni
```jsx
// Primario (default)
<Button>Testo Bottone</Button>

// Secondario
<Button variant="secondary">Testo Bottone</Button>

// Accento
<Button variant="accent">Testo Bottone</Button>
```

### Card
```html
<div class="natural-card">
  Contenuto della card
</div>
```

### Badge
```html
<span class="natural-badge">Badge</span>
```

### Input
```html
<input class="natural-input" type="text" placeholder="Inserisci testo">
```

## 🎯 Utility Classes

### Backgrounds
- `.bg-natural-primary` - Gradiente verde
- `.bg-natural-sky` - Gradiente azzurro
- `.bg-natural-sun` - Gradiente giallo
- `.bg-natural-earth` - Gradiente arancione

### Text Colors
- `.text-natural-primary` - Verde bosco
- `.text-natural-sky` - Azzurro cielo
- `.text-natural-sun` - Giallo sole
- `.text-natural-earth` - Arancione terra
- `.text-natural-wood` - Marrone legno

### Borders
- `.border-natural-primary` - Bordo verde bosco
- `.border-natural-leaf` - Bordo verde foglia
- `.border-natural-sky` - Bordo azzurro cielo

### Shadows
- `.shadow-natural-soft` - Ombra leggera
- `.shadow-natural-medium` - Ombra media
- `.shadow-natural-strong` - Ombra forte

## ✨ Animazioni

### Classi di Animazione
- `.animate-natural-fade-in` - Fade in dall'alto
- `.animate-natural-pulse` - Pulsazione continua
- `.animate-natural-bounce` - Rimbalzo singolo

### Transizioni
- `var(--transition-fast)` - 0.2s per interazioni immediate
- `var(--transition-medium)` - 0.3s per transizioni più fluide

## 📏 Spaziatura

Sistema basato su 8px:
- `var(--spacing-xs)` - 4px
- `var(--spacing-s)` - 8px
- `var(--spacing-m)` - 16px
- `var(--spacing-l)` - 24px
- `var(--spacing-xl)` - 32px
- `var(--spacing-xxl)` - 48px

## 🔄 Border Radius

- `var(--border-radius-small)` - 12px (pietre piccole)
- `var(--border-radius-medium)` - 20px (pietre medie)
- `var(--border-radius-large)` - 28px (pietre grandi)
- `var(--border-radius-xl)` - 36px (rocce)

## 🎨 Principi di Design

### 1. Accessibilità Cognitiva
- Contrasto alto per facilitare la lettura
- Elementi grandi per target motorio
- Feedback immediato per ogni azione

### 2. Engagement Emotivo
- Colori caldi per creare comfort
- Forme arrotondate per sicurezza
- Micro-interazioni per mantenere l'attenzione

### 3. Coerenza Visiva
- Gerarchia chiara per guidare l'occhio
- Spazio bianco per respirazione
- Consistenza per prevedibilità

## 📱 Responsive Design

Il design system si adatta automaticamente ai dispositivi mobili:
- Padding ridotto su schermi piccoli
- Font size ottimizzato per touch
- Border radius adattivo

## ♿ Accessibilità

- Focus visibile con outline colorato
- Contrasto WCAG AA compliant
- Text shadow per migliorare la leggibilità
- Transizioni ridotte per utenti con preferenze di movimento

## 🚀 Utilizzo

1. **Importa il design system**:
   ```jsx
   import './styles/design-system.css';
   ```

2. **Usa le variabili CSS**:
   ```css
   .mio-componente {
     background: var(--gradient-primary);
     color: var(--white-cloud);
     border-radius: var(--border-radius-medium);
   }
   ```

3. **Applica le utility classes**:
   ```html
   <div class="natural-card bg-natural-sky text-natural-primary">
     Contenuto
   </div>
   ```

## 🎯 Benefici

- **Coerenza Visiva**: Tutti i componenti seguono le stesse regole
- **Scalabilità**: Facile aggiungere nuovi elementi
- **Accessibilità**: Design inclusivo per diverse abilità
- **Brand Recognition**: Identità visiva distintiva
- **User Experience**: Navigazione intuitiva e piacevole 