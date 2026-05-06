# Google / Gmail Integration Groundwork

Business Gmail: `risetutoringluton@gmail.com`

This project is intentionally **not** connected to Gmail yet. The UI only shows a placeholder integration card and a settings page so the product is ready for the next phase without pretending email is live.

## Planned architecture

- Use Google OAuth for the RISE Dashboard admin account.
- Never expose refresh tokens to the browser.
- Store OAuth tokens server-side only.
- Send parent reports through the Gmail API or Google Workspace API.
- Optionally attach the rendered PDF later, if needed.
- Fetch parent replies from Gmail threads.
- Match replies using:
  - parent email
  - report ID
  - Tutor Key
  - Gmail thread ID
  - Gmail message ID
- Save matched replies in `parent_replies`.
- Surface replies in the Reports tab and the student overview page.

## Suggested future database notes

If we expand the schema later, these columns may be useful:

- `gmail_thread_id`
- `gmail_message_id`
- `sent_via`
- `email_html`
- `email_plain_text`

## Security notes

- Keep OAuth tokens server-side only.
- Do not hardcode credentials in the client.
- Do not ship fake connected states.
- Do not send parent replies through the browser.
- Use least-privilege Gmail scopes and store only what is needed.

## Product flow

1. Tutor drafts a report in RISE Dashboard.
2. The app generates a polished parent email preview.
3. A future Gmail integration sends the email server-side.
4. Replies from parents are matched back to the right student/report.
5. Replies appear in RISE Dashboard for the tutor to review.
