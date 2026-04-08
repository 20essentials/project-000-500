const isMobile =
  /android|iphone|ipad|ipod|windows phone|mobile/i.test(navigator.userAgent) ||
  window.matchMedia('(pointer: coarse)').matches;

async function init() {
  if (isMobile) {
    const mobileModule = await import('./script-mobile.js');
    mobileModule.init();
  } else {
    const desktopModule = await import('./script-desktop.js');
    desktopModule.init();
  }
}

init();
