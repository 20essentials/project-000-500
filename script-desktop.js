export function init() {
  const $ = el => document.querySelector(el);
  const $$ = el => document.querySelectorAll(el);
  const $inputFiles = $('.input-files');
  const $containerNewImages = $('.docker-new-images');

  const $rows = $$('.row');
  let draggedElementCurrent = null;
  let parentDraggedElement = null;

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

  function handleDragStart(e) {
    draggedElementCurrent = e.target;
    parentDraggedElement = draggedElementCurrent.parentNode;
    e.dataTransfer.setData('text/plain', draggedElementCurrent.src);
    [...$containerNewImages.querySelectorAll('.new-image')]
      .filter(el => el !== draggedElementCurrent)
      .forEach(el => el.classList.add('quieto'));
    [...$containerNewImages.querySelectorAll('.new-image')]
      .filter(el => el !== draggedElementCurrent)
      .forEach(el => el.classList.add('quieto'));
  }

  function handleDragEnd() {
    [...parentDraggedElement.querySelectorAll('.new-image')]
      .filter(el => el !== draggedElementCurrent)
      .forEach(el => el.classList.remove('quieto'));
    [...$containerNewImages.querySelectorAll('.new-image')]
      .filter(el => el !== draggedElementCurrent)
      .forEach(el => el.classList.remove('quieto'));
    draggedElementCurrent = null;
    parentDraggedElement = null;
  }

  function createImg(src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Tech';
    img.classList.add('new-image');
    img.draggable = true;
    img.addEventListener('dragstart', handleDragStart);
    img.addEventListener('dragend', handleDragEnd);
    img.addEventListener('touchstart', handleDragEnd);
    img.addEventListener('touchend', handleDragEnd);
    $containerNewImages.appendChild(img);
    return img;
  }

  function createFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const src = e.target.result;
      const newImg = createImg(src);
      return newImg;
    };

    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const { currentTarget, dataTransfer } = e;
    if (draggedElementCurrent && parentDraggedElement) {
      parentDraggedElement.removeChild(draggedElementCurrent);
    }

    if (draggedElementCurrent) {
      const src = dataTransfer.getData('text/plain');
      const imgElement = createImg(src);
      currentTarget.appendChild(imgElement);
    }

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

    const { currentTarget } = e;
    if (currentTarget === parentDraggedElement) return;

    currentTarget.classList.add('row-over');
    const dragPreview = $('.drag-preview');

    if (draggedElementCurrent && !dragPreview) {
      const previewElement = draggedElementCurrent.cloneNode(true);
      previewElement.classList.add('drag-preview');
      currentTarget.appendChild(previewElement);
    }
  }

  $rows.forEach(row => {
    row.addEventListener('drop', handleDrop);
    row.addEventListener('dragleave', handleDragLeave);
    row.addEventListener('dragover', handleDragOver);
  });

  $containerNewImages.addEventListener('drop', handleDrop);
  $containerNewImages.addEventListener('dragleave', handleDragLeave);
  $containerNewImages.addEventListener('dragover', handleDragOver);

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
        console.error('Error al capturar la pantalla:', error);
      }
    }
  });
}
