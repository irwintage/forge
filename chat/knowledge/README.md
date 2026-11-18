# Forge Companion local knowledge

- `faq.json`: one `general` array and one `tools` object keyed by Forge tool ID.
- Each tool has `summary`, `capabilities`, and `faq` entries with `title`, `answer`, `type`, and optional `keywords`.
- Initial suggestions show overview / start / creative articles; follow-up suggestions rotate to other topics.
- `faq.bundle.js` is an identical data copy in JavaScript format for previews launched with `file://`.

To regenerate the fallback bundle after editing `faq.json`, run from the Forge root:

```python
import json
from pathlib import Path
p = Path('chat/knowledge/faq.json')
data = json.loads(p.read_text(encoding='utf-8'))
Path('chat/knowledge/faq.bundle.js').write_text(
    'window.FORGE_CHAT_FAQ = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',
    encoding='utf-8'
)
```

This file contains authored reference answers, not training data for an AI model. Keep answers concise and describe only implemented instrument features.
