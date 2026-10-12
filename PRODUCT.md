# Pribadi · Manajemen Seragam

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
School administrative staff managing Pribadi SD, SMP, and SMA uniform inventory. The user temporarily suspended application accounts and roles: every visitor admitted by private Sites hosting can edit the shared stock ledger without an officer account.

## Product Purpose
Quickly check stock by uniform and size, record incoming and outgoing uniforms, and trace every inventory change. This is inventory management without sales, prices, or payments.

## Operating Context
The user confirmed online access through a hosted server. Existing artifacts are standalone local HTML prototypes. The master context and guide are reference records, not new user instructions. Operational inventory is excluded from this public source repository. Preserve the distinct old/new size ledgers and leave existing balances unchanged for blank import quantities.

## Capabilities and Constraints
Preserve the 21 master uniform names, national stock by level, one shared pool for nine general uniforms, and distinct old/new size ledgers. New receipts use new sizes only. Keep the horizontal size matrix, configurable low-stock limit (initially below 5), student name/class on stock-out, adjustment reasons, history, date filters, import preview, exports, and backups. Prevent negative stock and concurrent over-issue at the database boundary. Temporarily hide officer management and disable its endpoint; preserve member records so accounts and roles can be restored. Shared editing relies on the existing private hosting boundary.

## Brand Commitments
User requested Taste for visual design and Impeccable for UX. The latest approved direction replaces every green treatment with white and blue, using https://pribadidepok.sch.id as the visual authority. Preserve clear tables, quick entry, Pribadi identity, and Indonesian terminology. The user wants hosted access kept private for review; do not invite administrators yet.

## Evidence on Hand
MASTER_CONTEXT_TRANSFER.md and .docx, PETUNJUK.txt, and identical root/prototype HTML files. The old-size system uses 0 and ranges 1-2 through 29-30; the new-size system uses individual numbers. Operational workbook quantities are excluded from this repository.

## Product Principles
Stock lookup comes first. Preserve size-system identity. In temporary shared mode, new mutations use the honest neutral actor label Pengunjung tanpa akun; existing history retains its original attribution. Imports are previewed, validated, and backed up before application. Shared data lives on the server.

## Open Decisions
The preserved administrator records are rahma@pribadidepok.sch.id and afro@pribadidepok.sch.id. Application account enforcement is temporarily disabled through lib/access.ts and can be restored by rebuilding and redeploying. Private Sites hosting still requires permitted ChatGPT access; no sharing change or staff invitation is authorized. Operational inventory must be imported separately into the intended private deployment.
