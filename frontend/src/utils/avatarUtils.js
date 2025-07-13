// Utility per gestire gli avatar in modo consistente
export const getAvatarUrl = (avatar) => {
  // Se non c'è avatar, usa l'icona utente di default
  if (!avatar) {
    return defaultUserIcon;
  }
  
  // Se l'avatar è già un URL completo (inizia con http o data:), usalo direttamente
  if (avatar.startsWith('http') || avatar.startsWith('data:')) {
    return avatar;
  }
  
  // Se l'avatar è solo il nome del file (es: "cat.png"), aggiungi il percorso
  if (avatar.includes('.png') || avatar.includes('.jpg') || avatar.includes('.jpeg')) {
    return `/avatar/${avatar}`;
  }
  
  // Fallback all'icona utente di default
  return defaultUserIcon;
};

// Avatar di default disponibili
export const defaultAvatars = [
  '/avatar/cat.png',
  '/avatar/dog.png',
  '/avatar/lion.png',
  '/avatar/panda.png',
  '/avatar/fox.png',
];

// Icona utente di default (SVG inline per evitare dipendenze esterne)
export const defaultUserIcon = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6c757d">
  <circle cx="12" cy="8" r="4"/>
  <path d="M12 14c-6.1 0-8 4-8 4v2h16v-2s-1.9-4-8-4z"/>
</svg>
`)}`; 