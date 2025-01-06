document.addEventListener('DOMContentLoaded', () => {
      const urlInput = document.getElementById('url-input');
      const goButton = document.getElementById('go-button');
      const browserIframe = document.getElementById('browser-iframe');

      goButton.addEventListener('click', () => {
        const url = urlInput.value;
        if (url) {
          browserIframe.src = url;
        }
      });
    });
