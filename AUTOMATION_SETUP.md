# WhatsApp request handoff

No automation service is needed. This release uses no webhook, WhatsApp Business API, SMS, OTP or email sender.

After review, the website prepares `https://wa.me/<owner-number>?text=<encoded-full-request>`. WhatsApp opens where supported, and **the customer must tap Send manually**. The website cannot verify sending or confirm a booking. The owner replies to confirm availability, menu and price and handles invoices personally.

The message includes name, phone, date, guests, occasion, service, venue, package, actual dishes for each included choice, exclusions, additions, notes/dietary needs and a quote disclaimer. Copy-message and call fallbacks are provided.

Change the recipient in **Owner dashboard → Business & prices → WhatsApp number**, using country code and digits only. Save, preview and publish. Tests inspect the complete link without sending any message.

The superseded webhook proposal survives only in the pre-redesign backup archive.
