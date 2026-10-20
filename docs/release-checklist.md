# Team release checklist

Status: **hold for provider configuration and final load evidence**. Deployment authorization already exists. A checked implementation gate is not proof of a public deployment.

- [x] P01–P05 baseline reconciled; P06 activated in an isolated worktree.
- [x] OVH resources, networks, proxy integration and sibling isolation inspected.
- [x] Nonroot immutable image built on Linux; Compose validates.
- [x] Local operational tests: encrypted WAL backup, authenticated restore, deletion replay, expiry/redaction, real SQLITE_FULL and pre-commit process kill.
- [x] Isolated OVH process recovery, prior-image rollback and separate-volume restore preserve the synthetic table/round/vote.
- [x] Twenty real clients enforce capacity; concurrent vote/reveal preserves frozen results.
- [x] Twenty runtime-disposal cycles leave no rooms retained; measured heap growth after warmup is under 1 MiB.
- [x] PT/EN operator/privacy notice and distributed third-party notices implemented; mobile privacy page has no overflow at 360 px.
- [ ] Thirty-minute 5×20 load completed with p95 ≤200 ms and zero lost acknowledgments.
- [ ] Final immutable artifact/source commit and CI recorded.
- [ ] Approved hostname and DNS configured; TLS certificate/origin validated.
- [ ] Exact OVH region, private contact and provider/processing terms confirmed for this team.
- [ ] Dedicated private off-host destination configured; upload/download/restore verified using real provider credentials.
- [ ] Backup key escrow stored outside OVH; daily job, retention, monitoring and failure handling verified.
- [ ] Final production `/privacy` build activated with verified facts.
- [ ] Public HTTPS/WSS smoke with two isolated browser identities, reveal/clear/reconnect and mobile layout.
- [ ] Production backup/rollback rehearsal and sibling health comparison recorded.

Do not archive P06 while any release item remains unresolved. Physical-device/screen-reader testing and actual browser 200% zoom are not certified by viewport emulation; keep those limitations explicit in acceptance evidence.
