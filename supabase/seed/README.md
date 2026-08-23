# UAT seed

Seed file: `supabase/seed/uat_seed.sql`

## How to run

1. Ensure migrations are applied (init → admin).
2. Open **Supabase → SQL Editor**.
3. Paste and run the whole `uat_seed.sql`.
4. Re-running is OK — it deletes previous UAT rows first.

## Test accounts

Password for all: `UatTest123!`

| Email | Nickname | Notes |
|-------|----------|-------|
| `host.uat@sportsshare.hk` | UAT Host | 多場放場主 |
| `player1.uat@sportsshare.hk` | UAT 阿明 | 申請／評分／私訊 |
| `player2.uat@sportsshare.hk` | UAT 小欣 | 開排球場、好友 |
| `player3.uat@sportsshare.hk` | UAT 志強 | 滿場名單 |
| `player4.uat@sportsshare.hk` | UAT 佳琪 | 候補 |
| `player5.uat@sportsshare.hk` | UAT 詠珊 | 羽球主／高評分 |
| `player6.uat@sportsshare.hk` | UAT 家豪 | 足球主 |
| `player7.uat@sportsshare.hk` | UAT 曉彤 | 乒乓／大埔 |
| `player8.uat@sportsshare.hk` | UAT 俊傑 | 網球／待接受好友 |
| `player9.uat@sportsshare.hk` | UAT 詩婷 | 排球／西貢 |

## Seed volume

- **10** members
- **8** HK venues
- **24** games（含 open／full／completed／cancelled／waitlist 示範）
- **5** direct chats + 多則訊息
- 若干 game chat 訊息、好友、skills、smart alerts

## What you can test

- **搵場 list** — 多運動／多區／距離排序
- **申請／候補** — open 籃球 pending；滿場匹克 + waitlist
- **完成場次** — 羽毛球 completed + attendance + reviews
- **對話** — 登入阿明／小欣等看私訊與場次群組
- **好友** — 已接受 + pending 申請
