Forge Chat V19.6.3 - Auto scroll fix

Based on the V19.6.2 FAQ Fix package. Only chat/chat.js changed.

- Scrolls the real conversation viewport (.fc-chat-body), not the internal #fcMessages list.
- Moves to new user messages, loading dots and assistant responses automatically.
- Keeps Forge page/iframe scroll untouched.
- Keeps FAQ, visuals, suggested questions, D1/backend config unchanged.

Installation: back up your current chat/ folder, then replace it with this zip's chat/ directory.
