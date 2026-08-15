# UAT seed

Seed file: `supabase/seed/uat_seed.sql`

## How to run

1. Ensure migrations `000001`–`000006` (and optional `000007`) are applied.
2. Open **Supabase → SQL Editor**.
3. Paste and run the whole `uat_seed.sql`.
4. Re-running is OK — it deletes previous UAT rows first.

## Test accounts

Password for all: `UatTest123!`

| Email | Role |
|-------|------|
| `host.uat@sportsshare.hk` | Host — owns sample games |
| `player1.uat@sportsshare.hk` | Player — pending apply + reviews |
| `player2.uat@sportsshare.hk` | Player — hosts dodgebee game |
| `player3.uat@sportsshare.hk` | In full pickleball roster |
| `player4.uat@sportsshare.hk` | Waitlisted on full game |

## What you can test

- **搵場 list** — open / full / upcoming games with HK lat/lng
- **申請** — open basketball has a pending application
- **候補** — full pickleball + waitlisted player4; host remove someone → promote
- **完成場次** — badminton completed; attendance + public reviews
- **信用** — player1/2 have sample rating / attendance
- **好友** — player1 ↔ player2 accepted
