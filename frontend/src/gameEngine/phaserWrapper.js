// Wrapper per integrare Phaser.js nei giochi React
// Da implementare: logica di mounting e comunicazione tra React e Phaser 

import Phaser from 'phaser';

// Funzione per montare una scena Phaser in un container DOM
export default function phaserWrapper(container, config = {}, pairs = []) {
  if (!container) return;

  // Distruggi eventuali istanze precedenti
  if (container._phaserGame) {
    container._phaserGame.destroy(true);
    container._phaserGame = null;
  }

  // Dimensioni
  const width = config.width || 600;
  const height = config.height || 400;

  // Scena base di Memory
  class MemoryScene extends Phaser.Scene {
    constructor() {
      super('MemoryScene');
      this.cards = [];
      this.flipped = [];
    }
    preload() {
      // Carica asset (qui solo placeholder colorati)
      // In futuro: this.load.image('lion', 'path/to/lion.png')
    }
    create() {
      // Usa pairs per generare le carte
      let cardData = [];
      if (pairs && pairs.length > 0) {
        pairs.forEach((pair, idx) => {
          cardData.push({ label: pair.front, pairId: idx });
          cardData.push({ label: pair.back, pairId: idx });
        });
      } else {
        // fallback: numeri
        const pairsCount = config.pairs || 4;
        for (let i = 0; i < pairsCount; i++) {
          cardData.push({ label: i, pairId: i });
          cardData.push({ label: i, pairId: i });
        }
      }
      // Mischia
      Phaser.Utils.Array.Shuffle(cardData);
      // Layout griglia
      const cols = Math.ceil(Math.sqrt(cardData.length));
      const rows = Math.ceil(cardData.length / cols);
      const cardW = 80, cardH = 100, margin = 20;
      this.cards = [];
      for (let i = 0; i < cardData.length; i++) {
        const x = margin + (i % cols) * (cardW + margin) + cardW / 2;
        const y = margin + Math.floor(i / cols) * (cardH + margin) + cardH / 2;
        const card = this.add.rectangle(x, y, cardW, cardH, 0x4A90E2).setInteractive();
        card.setData({ value: cardData[i].pairId, label: cardData[i].label, flipped: false, idx: i });
        card.on('pointerdown', () => this.flipCard(card));
        this.cards.push(card);
        // Testo nascosto (valore/label)
        card.text = this.add.text(x, y, cardData[i].label, { fontSize: 24, color: '#fff' }).setOrigin(0.5).setVisible(false);
      }
      this.flipped = [];
    }
    flipCard(card) {
      if (card.getData('flipped') || this.flipped.length === 2) return;
      card.setFillStyle(0xF5A623);
      card.text.setVisible(true);
      card.setData('flipped', true);
      this.flipped.push(card);
      if (this.flipped.length === 2) {
        this.time.delayedCall(700, () => {
          const [a, b] = this.flipped;
          if (a.getData('value') === b.getData('value')) {
            // Match trovato
            a.setAlpha(0.5);
            b.setAlpha(0.5);
          } else {
            // Ritorna coperta
            a.setFillStyle(0x4A90E2);
            b.setFillStyle(0x4A90E2);
            a.text.setVisible(false);
            b.text.setVisible(false);
            a.setData('flipped', false);
            b.setData('flipped', false);
          }
          this.flipped = [];
        });
      }
    }
  }

  // Configurazione Phaser
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width,
    height,
    backgroundColor: '#eee',
    parent: container,
    scene: MemoryScene,
    scale: { mode: Phaser.Scale.NONE },
  });
  container._phaserGame = game;
} 