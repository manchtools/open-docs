---
title: Card Demo
---

# Card Demo

{% card title="X" icon="<svg onload=alert(1)></svg>" %}
A card whose icon attribute carries a malicious inline SVG.
{% /card %}
