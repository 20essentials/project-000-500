export function init() {
  const $ = el => document.querySelector(el);
  const $$ = el => document.querySelectorAll(el);
  const $inputFiles = $('.input-files');
  const $containerNewImages = $('.docker-new-images');

  const $rows = $$('.row');

  let draggedElementCurrent = null;
  let parentDraggedElement = null;
  let currentDropZone = null;

  let startX = 0;
  let startY = 0;

  const initialImages = [
    'assets/angular.svg',
    'assets/astro.svg',
    'assets/css.svg',
    'assets/html5.svg',
    'assets/nextJs.svg',
    'assets/nodejs.svg',
    'assets/nuxt.svg',
    'assets/react.svg',
    'assets/tailwindcss.svg',
    'assets/typescript.svg',
    'assets/vue.svg',
    'assets/javascript.svg',
    'assets/markdown-dark.svg',
    'assets/playwright.svg',
    'assets/webcomponents.svg',
    'assets/reactquery.svg',
    'assets/preact.svg',
    'assets/threejs-dark.svg'
  ];

  let previewElement = null;

  function handleDragStart(e) {
    draggedElementCurrent = e.target;
    parentDraggedElement = draggedElementCurrent.parentNode;

    startX = e.clientX;
    startY = e.clientY;

    draggedElementCurrent.style.zIndex = '1000';
    draggedElementCurrent.style.willChange = 'transform';

    previewElement = draggedElementCurrent.cloneNode(true);
    previewElement.classList.add('drag-preview');

    [...$containerNewImages.querySelectorAll('.new-image')]
      .filter(el => el !== draggedElementCurrent)
      .forEach(el => el.classList.add('quieto'));
  }

  function handleDragEnd() {
    [...$$('.new-image')].forEach(el => el.classList.remove('quieto'));

    $rows.forEach(r => {
      r.classList.remove('row-over');
      r.querySelector('.drag-preview')?.remove();
    });

    $containerNewImages.classList.remove('row-over');
    $containerNewImages.querySelector('.drag-preview')?.remove();

    if (draggedElementCurrent) {
      draggedElementCurrent.style.transform = '';
      draggedElementCurrent.style.zIndex = '';
      draggedElementCurrent.style.willChange = '';
    }

    draggedElementCurrent = null;
    parentDraggedElement = null;
    currentDropZone = null;
    previewElement = null;
  }

  function createImg(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Tech';
    img.classList.add('new-image');
    img.style.touchAction = 'none';

    img.addEventListener('pointerdown', e => {
      handleDragStart(e);

      img.setPointerCapture(e.pointerId);

      const move = ev => {
        if (!draggedElementCurrent) return;

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        draggedElementCurrent.style.transform = `translate(${dx}px, ${dy}px)`;

        draggedElementCurrent.style.pointerEvents = 'none';
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        draggedElementCurrent.style.pointerEvents = '';

        const zone = el?.closest('.row') || el?.closest('.docker-new-images');

        if (!zone || zone === parentDraggedElement) return;

        if (zone === currentDropZone) return;

        if (currentDropZone) {
          currentDropZone.classList.remove('row-over');
          currentDropZone.querySelector('.drag-preview')?.remove();
        }

        currentDropZone = zone;
        zone.classList.add('row-over');

        if (!zone.querySelector('.drag-preview')) {
          zone.appendChild(previewElement);
        }
      };

      const up = ev => {
        img.releasePointerCapture(ev.pointerId);

        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);

        if (currentDropZone) {
          handleDrop({
            preventDefault() {},
            currentTarget: currentDropZone
          });
        }

        handleDragEnd();
      };

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });

    $containerNewImages.appendChild(img);
    return img;
  }

  function createFile(file) {
    const reader = new FileReader();
    reader.onload = e => createImg(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const { currentTarget } = e;

    if (!draggedElementCurrent || !parentDraggedElement) return;

    parentDraggedElement.removeChild(draggedElementCurrent);
    currentTarget.appendChild(draggedElementCurrent);

    currentTarget.classList.remove('row-over');
    currentTarget.querySelector('.drag-preview')?.remove();
  }

  function handleDragLeave(e) {
    e.preventDefault();
    const { currentTarget } = e;
    currentTarget.classList.remove('row-over');
    currentTarget.querySelector('.drag-preview')?.remove();
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  $rows.forEach(row => {
    row.addEventListener('dragover', handleDragOver);
    row.addEventListener('dragleave', handleDragLeave);
    row.addEventListener('drop', handleDrop);
  });

  $containerNewImages.addEventListener('dragover', handleDragOver);
  $containerNewImages.addEventListener('dragleave', handleDragLeave);
  $containerNewImages.addEventListener('drop', handleDrop);

  $inputFiles.addEventListener('change', e => {
    const files = e.target.files;
    if (files.length > 0) {
      Array.from(files).forEach(file => createFile(file));
    }
  });

  document.addEventListener('click', async e => {
    if (e.target.matches('.reset')) {
      if ($containerNewImages.children.length === 0) {
        initialImages.forEach(src => createImg(src));
      }
    }

    if (e.target.matches('.photo')) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        const track = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(track);
        const bitmap = await imageCapture.grabFrame();

        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);

        const imgURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'tier.png';
        downloadLink.href = imgURL;
        downloadLink.click();

        track.stop();
      } catch (error) {
        console.error(error);
      }
    }
  });
}
