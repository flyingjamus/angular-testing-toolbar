# Page snapshot

```yaml
- generic [ref=e2]:
  - generic "Dashboard" [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - button "Go back" [ref=e7] [cursor=pointer]:
            - generic [ref=e8]: ←
          - heading "Dashboard" [level=1] [ref=e9]
        - generic [ref=e11]: This is a very long chip label that should truncate with ellipsis
      - navigation [ref=e14]:
        - link "Home" [ref=e15] [cursor=pointer]:
          - /url: "#"
        - link "Products" [ref=e16] [cursor=pointer]:
          - /url: "#"
        - link "About" [ref=e17] [cursor=pointer]:
          - /url: "#"
      - generic [ref=e18]:
        - button "Settings" [ref=e19] [cursor=pointer]
        - button "Profile" [ref=e20] [cursor=pointer]
  - main [ref=e21]:
    - heading "Topbar Component Demo" [level=2] [ref=e22]
    - paragraph [ref=e23]: "The topbar above demonstrates:"
    - list [ref=e24]:
      - listitem [ref=e25]: Back button (left, before title)
      - listitem [ref=e26]: Title ("Dashboard")
      - listitem [ref=e27]: Left content (Chip with ellipsis - min 40px, max 280px)
      - listitem [ref=e28]: Center content (Navigation - wraps to second line when no room)
      - listitem [ref=e29]: Right content (Settings and Profile buttons)
    - paragraph [ref=e30]:
      - strong [ref=e31]: Resize the browser
      - text: to see the center nav wrap to a second line when the chip reaches its minimum width.
```