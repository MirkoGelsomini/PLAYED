// Wrapper per integrare Phaser.js nei giochi React

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
  let width = config.width || 900;
  let height = config.height || 600;
  if (container) {
    const rect = container.getBoundingClientRect();
    width = Math.floor(rect.width) || width;
    height = Math.floor(rect.height) || height;
  }

  // Scena base di Memory
  class MemoryScene extends Phaser.Scene {
    constructor() {
      super('MemoryScene');
      this.cards = [];
      this.flipped = [];
      this.moves = 0;
      this.timer = 0;
      this.timerEvent = null;
      this.ui = {};
    }
    preload() {
      // Nessuna immagine, solo grafica vettoriale
    }
    create() {
      // UI: contatore mosse e timer
      this.ui.movesText = this.add.text(20, 10, 'Mosse: 0', { fontSize: 20, color: '#2560A8', fontFamily: 'Nunito, Arial' });
      this.ui.timerText = this.add.text(width - 120, 10, 'Tempo: 0s', { fontSize: 20, color: '#2560A8', fontFamily: 'Nunito, Arial' });
      this.moves = 0;
      this.timer = 0;
      this.timerEvent = this.time.addEvent({ delay: 1000, callback: () => {
        this.timer++;
        this.ui.timerText.setText('Tempo: ' + this.timer + 's');
      }, callbackScope: this, loop: true });
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
        const y = 50 + margin + Math.floor(i / cols) * (cardH + margin) + cardH / 2;
        // Card container per flip 3D
        const cardContainer = this.add.container(x, y);
        // Retro
        const back = this.add.rectangle(0, 0, cardW, cardH, 0x4A90E2, 1).setStrokeStyle(3, 0x2560A8).setOrigin(0.5);
        back.setData('isBack', true);
        // Fronte
        const front = this.add.rectangle(0, 0, cardW, cardH, 0xF7C873, 1).setStrokeStyle(3, 0xE0E7EF).setOrigin(0.5);
        const label = this.add.text(0, 0, cardData[i].label, { fontSize: 28, color: '#2560A8', fontFamily: 'Nunito, Arial' }).setOrigin(0.5);
        front.setVisible(false);
        label.setVisible(false);
        // Ombra
        cardContainer.setDepth(1);
        cardContainer.setSize(cardW, cardH);
        cardContainer.add([back, front, label]);
        cardContainer.setInteractive(new Phaser.Geom.Rectangle(-cardW/2, -cardH/2, cardW, cardH), Phaser.Geom.Rectangle.Contains);
        cardContainer.setData({ value: cardData[i].pairId, flipped: false, idx: i, back, front, label });
        cardContainer.on('pointerdown', (pointer) => {
          if (pointer.leftButtonDown()) this.flipCard(cardContainer);
        });
        this.cards.push(cardContainer);
      }
      this.flipped = [];
      this.matchedCount = 0;
      this.totalPairs = cardData.length / 2;
    }
    flipCard(card) {
      if (card.getData('flipped') || this.flipped.length === 2) return;
      this.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 120,
        onComplete: () => {
          card.getData('back').setVisible(false);
          card.getData('front').setVisible(true);
          card.getData('label').setVisible(true);
          card.setData('flipped', true);
          this.tweens.add({
            targets: card,
            scaleX: 1,
            duration: 120,
            onComplete: () => {
              this.flipped.push(card);
              if (this.flipped.length === 2) {
                this.moves++;
                this.ui.movesText.setText('Mosse: ' + this.moves);
                this.time.delayedCall(700, () => this.checkMatch());
              }
            }
          });
        }
      });
    }
    checkMatch() {
      const [a, b] = this.flipped;
      if (a.getData('value') === b.getData('value')) {
        // Match: bagliore verde
        this.tweens.add({
          targets: [a, b],
          alpha: 0.5,
          duration: 300,
        });
        [a, b].forEach(card => {
          card.getData('front').setStrokeStyle(4, 0x4AE290);
        });
        this.matchedCount++;
        if (this.matchedCount === this.totalPairs) {
          this.time.delayedCall(600, () => this.showWinPopup());
        }
      } else {
        // Errore: shake rosso
        [a, b].forEach(card => {
          card.getData('front').setStrokeStyle(4, 0xF55A5A);
        });
        this.tweens.add({
          targets: [a, b],
          x: '+=10',
          yoyo: true,
          repeat: 3,
          duration: 60,
          onComplete: () => {
            [a, b].forEach(card => {
              card.getData('front').setStrokeStyle(3, 0xE0E7EF);
              card.getData('front').setVisible(false);
              card.getData('label').setVisible(false);
              card.getData('back').setVisible(true);
              card.setData('flipped', false);
            });
          }
        });
      }
      this.flipped = [];
    }
    showWinPopup() {
      this.timerEvent.remove();
      const popup = this.add.rectangle(width/2, height/2, 340, 180, 0xffffff, 0.98).setStrokeStyle(4, 0x4A90E2).setDepth(10);
      const text = this.add.text(width/2, height/2-30, 'Complimenti!', { fontSize: 32, color: '#4A90E2', fontFamily: 'Nunito, Arial', fontStyle: 'bold' }).setOrigin(0.5).setDepth(11);
      const stats = this.add.text(width/2, height/2+10, `Mosse: ${this.moves}\nTempo: ${this.timer}s`, { fontSize: 20, color: '#2560A8', fontFamily: 'Nunito, Arial', align: 'center' }).setOrigin(0.5).setDepth(11);
      const btn = this.add.text(width/2, height/2+60, 'Rigioca', { fontSize: 22, color: '#fff', backgroundColor: '#4A90E2', padding: { left: 18, right: 18, top: 8, bottom: 8 }, borderRadius: 8, fontFamily: 'Nunito, Arial', fontWeight: 700, align: 'center' })
        .setOrigin(0.5).setDepth(11).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.scene.restart());
      // Effetto celebrativo
      for (let i = 0; i < 18; i++) {
        const confetti = this.add.rectangle(width/2, height/2, 8, 18, Phaser.Display.Color.RandomRGB().color, 1).setDepth(12);
        this.tweens.add({
          targets: confetti,
          x: Phaser.Math.Between(width/2-120, width/2+120),
          y: height/2 + 120,
          angle: Phaser.Math.Between(-60, 60),
          duration: Phaser.Math.Between(700, 1200),
          delay: i*30,
          onComplete: () => confetti.destroy()
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