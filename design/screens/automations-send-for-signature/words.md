# Words — automations-send-for-signature

Every string in each frame, in reading order, exactly as drawn (English, sentence case). The app sidebar and the profile header are left out (they are the existing chrome). Names, dates, file names and counts are sample data, not copy. The spec quotes the copy that matters; where they differ, the spec wins.


## A01-AddStep
_A01 · Send for signature in the quick step list — a working step now_

- Contract for new joiners
- Draft
- Test run
- Save draft
- Turn on
- When
- a start date is set
- , noddo
- sends the employment contract
- to sign,
- waits until it’s signed
- , then
- tells HR Admin
- A start date is set
- Every person, once
- Send for signature
- Employment contract
- The person, then their manager · 30 days to sign
- Wait until
- The contract is signed
- At most 30 days, then stop and tell HR Admin
- Send a notification
- Tell HR Admin
- Search
- Send an email
- Create a task
- New
- All steps

## A02-SignStep
_A02 · The step’s settings: template; who signs and time to sign read-only from the template; Who sees what_

- Contract for new joiners
- Draft
- Test run
- Save draft
- Turn on
- When
- a start date is set
- , noddo
- sends the employment contract
- to sign,
- waits until it’s signed
- , then
- tells HR Admin
- A start date is set
- Every person, once
- Send for signature
- Employment contract
- The person, then their manager · 30 days to sign
- Wait until
- The contract is signed
- At most 30 days, then stop and tell HR Admin
- Send a notification
- Tell HR Admin
- Step 1
- Template
- The document is made for the person when the step runs, and filed in their Documents under Contracts.
- Who signs
- The person
- Their manager
- Set on the template.
- Open the template
- Time to sign
- 30 days
- from the template
- Who sees what
- Example · nothing is sent
- In Lena’s inbox · the person
- A
- Signature requested
- Acme asks you to sign Employment contract by 17 Dec.
- Then Marta, her manager, gets the same when it’s her turn. Guests get it by email.

## A03-WaitSigned
_A03 · Wait until: one field “Wait for” — the document from step 1 is signed_

- Contract for new joiners
- Draft
- Test run
- Save draft
- Turn on
- When
- a start date is set
- , noddo
- sends the employment contract
- to sign,
- waits until it’s signed
- , then
- tells HR Admin
- A start date is set
- Every person, once
- Send for signature
- Employment contract
- The person, then their manager · 30 days to sign
- Wait until
- The contract is signed
- At most 30 days, then stop and tell HR Admin
- Send a notification
- Tell HR Admin
- Step 2
- Wait for
- Employment contract is signed
- From step 1. Signed means everyone has signed.
- Wait at most
- days
- If it’s not signed by then
- Go on with the next steps
- Stop
- Stop and tell someone
- Declined or cancelled counts as not signed: the run doesn’t wait for the date.
- Tell
- HR Admin

## A04-TestRun
_A04 · Test run: Would send for signature; Send the document to me; Send it to me_

- Contract for new joiners
- Draft
- Test run
- Save draft
- Turn on
- When
- a start date is set
- , noddo
- sends the employment contract
- to sign,
- waits until it’s signed
- , then
- tells HR Admin
- A start date is set
- Every person, once
- Send for signature
- Employment contract
- The person, then their manager · 30 days to sign
- Wait until
- The contract is signed
- At most 30 days, then stop and tell HR Admin
- Send a notification
- Tell HR Admin
- Nothing is sent or changed.
- Try it on
- LK
- Lena Kowalska · starts 1 Dec
- What would happen
- Lena’s start date is set
- Starts it
- Would send for signature
- Employment contract — Lena signs first, then Marta Nowak, her manager. 30 days to sign.
- Send the document to me
- Would wait until it’s signed
- At most 30 days
- HR Admin gets a notification
- Would go to Ulia Tykoon, Jonas Petrauskas
- Send it to me

## A05-Notify
_A05 · The notification after signing, with Who sees what; new field “document”_

- Contract for new joiners
- Draft
- Test run
- Save draft
- Turn on
- When
- a start date is set
- , noddo
- sends the employment contract
- to sign,
- waits until it’s signed
- , then
- tells HR Admin
- A start date is set
- Every person, once
- Send for signature
- Employment contract
- The person, then their manager · 30 days to sign
- Wait until
- The contract is signed
- At most 30 days, then stop and tell HR Admin
- Send a notification
- Tell HR Admin
- Step 3
- Who gets it
- HR Admin
- Message
- first name
- last name
- signed
- document
- . Everyone has signed, the copy is in their Documents.
- Type @ to insert a field.
- Who sees what
- Example · nothing is sent
- In Ulia’s inbox · HR Admin
- LK
- Lena Kowalska signed Employment contract. Everyone has signed, the copy is in their Documents.
