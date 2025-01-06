const express = require('express');
    const http = require('http');
    const { Server } = require('socket.io');
    const puppeteer = require('puppeteer');

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    app.use(express.static('public'));

    let browser;
    let page;

    async function setupBrowser() {
      browser = await puppeteer.launch({ headless: "new" });
      page = await browser.newPage();
      await page.goto('about:blank');
      page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    }

    io.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('loadURL', async (url) => {
        try {
          await page.goto(url, { waitUntil: 'networkidle2' });
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error loading URL:', error);
          socket.emit('error', 'Failed to load URL');
        }
      });

      socket.on('input', async (inputData) => {
        try {
          await page.focus(inputData.selector);
          await page.keyboard.type(inputData.text);
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error typing:', error);
          socket.emit('error', 'Failed to type');
        }
      });

      socket.on('click', async (clickData) => {
        try {
          await page.click(clickData.selector);
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error clicking:', error);
          socket.emit('error', 'Failed to click');
        }
      });

      socket.on('hover', async (hoverData) => {
        try {
          await page.hover(hoverData.selector);
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error hovering:', error);
          socket.emit('error', 'Failed to hover');
        }
      });

      socket.on('focus', async (focusData) => {
        try {
          await page.focus(focusData.selector);
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error focusing:', error);
          socket.emit('error', 'Failed to focus');
        }
      });

      socket.on('keydown', async (keyData) => {
        try {
          await page.focus(keyData.selector);
          await page.keyboard.press(keyData.key);
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error keydown:', error);
          socket.emit('error', 'Failed to keydown');
        }
      });

      socket.on('contextmenu', async (menuData) => {
        try {
          await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.dispatchEvent(new MouseEvent('contextmenu', {
                bubbles: true,
                cancelable: true,
                view: window
              }));
            }
          }, menuData.selector);
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error contextmenu:', error);
          socket.emit('error', 'Failed to contextmenu');
        }
      });

      socket.on('scroll', async (scrollData) => {
        try {
          await page.evaluate((deltaY) => {
            window.scrollBy(0, deltaY);
          }, scrollData.deltaY);
          const screenshot = await page.screenshot({ encoding: 'base64' });
          socket.emit('pageUpdate', screenshot);
        } catch (error) {
          console.error('Error scrolling:', error);
          socket.emit('error', 'Failed to scroll');
        }
      });

      socket.on('getElements', async () => {
        try {
          const elements = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            return Array.from(allElements).map(el => {
              const rect = el.getBoundingClientRect();
              return {
                tagName: el.tagName,
                className: el.className,
                id: el.id,
                textContent: el.textContent.trim().substring(0, 50),
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                isInput: el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
              };
            });
          });
          socket.emit('elements', elements);
        } catch (error) {
          console.error('Error getting elements:', error);
          socket.emit('error', 'Failed to get elements');
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    (async () => {
      await setupBrowser();
      server.listen(3000, () => {
        console.log('Server listening on http://localhost:3000');
      });
    })();
