import definePlugin from "@utils/types";
import { addMessagePreSendListener, removeMessagePreSendListener, MessageSendListener } from "@api/MessageEvents";

let uwuEnabled = true;
let preSendListener: MessageSendListener | null = null;
let mutationObserver: MutationObserver | null = null;
let injectionInterval: number | null = null;


function findIconBarContainer(): HTMLElement | null {
  let plusButton = document.querySelector('button[aria-label="Add a file"]')
                 || document.querySelector('button[class*="attachButton"]');
  if (plusButton) {
    return plusButton.parentElement as HTMLElement;
  }

  const buttonsContainer = document.querySelector('div[class*="buttons-"]');
  if (buttonsContainer) {
    return buttonsContainer as HTMLElement;
  }

  return null;
}

function injectButton() {
    const container = findIconBarContainer();
    if (container) {
        if (!document.getElementById("uwu")) {
            const button = document.createElement("button");
            button.id = "uwu";
            button.textContent = ":3";

            button.style.marginLeft = "8px";
            button.style.padding = "4px 8px";
            button.style.fontSize = "0.9em";
            button.style.borderRadius = "4px";
            button.style.cursor = "pointer";
            button.style.backgroundColor = uwuEnabled ? "#ff69b4" : "#808080";
            button.style.color = "white";
            button.style.border = "none";
            button.style.outline = "none";
            button.title = "uwu";

            button.onclick = () => {
                uwuEnabled = !uwuEnabled;
                button.style.backgroundColor = uwuEnabled ? "#ff69b4" : "#808080";
            };

            container.appendChild(button);
        }
    }
}


export default definePlugin({
  name: "UwUify",
  description: "Adds a cute little button for making your messages so much cutier :3",
  authors: [{ name: "coolinventor", id: 932850914203688970n }],

  start() {
    preSendListener = addMessagePreSendListener(async (channelId, message, extra) => {
      if (typeof message.content === "string" && message.content.trim().length > 0) {
        if (uwuEnabled) {
          try {
            const response = await fetch("http://localhost:3001/uwu", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: message.content })
            });
            if (!response.ok) {
              console.error("3: ", response.status);
            } else {
              const data = await response.json();
              if (data?.uwu) {
                message.content = data.uwu;
              } else {
                console.warn("3: ", data);
              }
            }
          } catch (err) {
            console.error("3: ", err);
          }
        } else {
        }
      }
      return; 
    }) as MessageSendListener;

    mutationObserver = new MutationObserver(() => {
      injectButton();
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    injectionInterval = window.setInterval(() => {
      injectButton();
    }, 3000);
  },

  stop() {
    if (preSendListener) {
      removeMessagePreSendListener(preSendListener);
    }
    if (mutationObserver) {
      mutationObserver.disconnect();
    }
    if (injectionInterval) {
      clearInterval(injectionInterval);
    }
    const existing = document.getElementById("uwu");
    if (existing) existing.remove();
  },
});
