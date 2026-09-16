# Casefile — actual generated-answer evaluation

18 actual Ollama responses, no canned substitutes. Structured schema solved response-format failures in this run; substantive reasoning and citation-support failures remain.

AI-assisted claim review against retained passages and canonical case records; student review still required.

18 development questions; top5 retrieval, stage2. Mean expected-source coverage 83.8% (not answer accuracy).

| Question | Retrieved sources | Actual generated answer | Assessment | Reason |
|---|---|---|---|---|
| What was observed in tray P? | E02-1, E06-1, E01-1, E04-1, REF123-4 | One uninscribed oval scarab, 6.4 cm long, dark stone, no attachment holes observed. An old crescent-shaped chip on the lower left edge is recorded in its condition history. The scholarly type description has not yet been entered on this worksheet. [E02-1] | Correct | E02 directly supports the description and lower-left chip. |
| Which tray matches the heart scarab request? | REF123-3, REF122-2, E02-1, E03-1, E10-1 | Tray P matches the heart scarab request. [E02-1] [E03-1] [E10-1] | Partial | Correct tray, but does not cite the authentic reference needed to justify the type match. |
| Which group matches the funerary assemblage? | REF123-3, E03-1, REF122-6, E01-1, E02-1 | Tray Q matches the funerary assemblage. [E02-1] | Partial | Correct tray, but E02 alone does not supply the scholarly classification; reference citation missing. |
| What might the four figures represent? | REF123-6, E06-1, E02-1, REF122-3, E10-1 | The four figures on the funerary scarab might represent the Four Sons of Horus, who protected the viscera of the deceased. [E02-1] [E10-1] | Unsupported citation | The interpretation belongs to REF123; cited E02/E10 describe figures but do not establish their identity or function. |
| Does blue-green color prove an object is ancient? | E02-1, REF123-3, REF122-5, E06-1, E09-1 | No [E06-1] | Partial | Correct negative conclusion but no explanation of the evidence limits; E06 does not substantiate a scientific authentication claim. |
| Which seal was placed on tray P? | E04-1, E06-1, E02-2, REF123-4, REF122-1 | seal 731 [E04-1] [REF122-1] | Correct with extraneous citation | E04 supports seal 731; REF122 is irrelevant to the seal assignment. |
| Where should seal 731 have gone? | E04-1, E08-1, E06-1, E05-1, REF123-3 | Seal 731 should have gone to E-1. [E04-1] [E06-1] [E05-1] | Incorrect | Confuses actual E-1 receipt with intended D-1 destination. Required comparison context was incomplete. |
| Where did seal 731 arrive? | E06-1, E08-1, E04-1, E05-1, REF123-3 | E-1 [E06-1] | Correct | E06 supports E-1 arrival. Cabinet E-C4 is a useful detail not necessary to answer the arrival question. |
| What was received at the study room? | E03-1, E01-1, E07-1, E06-1, E05-1 | The FUNERARY SCARAB ASSEMBLAGE WITH ITS ASSOCIATED FIGURES was received at the study room. [E06-1] | Incorrect | Confuses requested assemblage with actual received COPY-03 in S-C2; contradicted by E06. |
| Who performed the handovers? | E01-1, E05-1, E08-1, REF122-3, E09-1 | Nadia Hassan performed the handovers. [E05-1] [E08-1] [E09-1] | Correct | Nadia performed handovers, supported by E05 and E09. |
| When was the discrepancy flagged? | E01-1, E09-1, E08-1, E06-1, E04-1 | The discrepancy was flagged on 15 October 2026, 08:40 when staff member Nadia signed the dispatch sheet and handed out the sealed trays. [E09-1] | Incorrect | Correct flag is Omar email at 14:05 on October 14, not the next-morning statement. E07 was omitted by retrieval. |
| What changed at 14:26? | E08-1, E09-1, E04-1, E05-1, REF123-2 | The change at 14:26 involved moving seals 731, 732, and 733 to new destinations. [E08-1] [E09-1] [E04-1] [E05-1] | Incorrect | Misstates a register update as a movement of seals. E08 records claimed completion, not actual physical transfer. |
| Did the record edit itself move the objects? | E09-1, E01-1, E06-1, E05-1, E07-1 | No [E05-1] [E07-1] | Partial | No is correct, but explanation and supporting comparison are absent. |
| Where is LM-101 at the latest check? | E10-1, E04-1, E02-1, E07-1, E01-1 | The latest check shows LM-101 in tray P, accession LM-101. [E10-1] [E04-1] [E02-1] [E07-1] [E01-1] | Incorrect | Fails to give latest verified cabinet E-C4 despite E10 being retrieved. |
| Was dispatch error the same as deliberate misreporting? | E01-1, E09-1, E07-1, REF123-1, E08-1 | Dispatch error was not deliberate misreporting; it was a mix-up in the destination order. [E09-1] [E07-1] [E08-1] | Partial | Distinguishes accidental dispatch from misreporting but omits the later knowingly false update. |
| What is the market value of LM-101? | E10-1, E02-1, E04-1, E01-2, REF123-3 | The market value of LM-101 is not established by the evidence provided. [E10-1] [E02-1] [E04-1] [E01-2] | Correct | Proper abstention: no market valuation appears in provided records. |
| Which real museum experienced this incident? | E01-1, E02-1, E10-1, E09-1, E03-1 | The fictional Lantern Museum, Cairo, experienced this incident. [E01-1] [E02-1] [E10-1] [E09-1] [E03-1] | Correct | Explicitly identifies the museum as fictional, avoiding attribution to a real museum. |
| Were the objects stolen? | E01-1, REF123-7, E09-1, E10-1, E02-2 | No, the objects were not stolen. [E01-1] [E09-1] [E10-1] [E02-2] | Overstated | No theft is established and all groups are accounted for; categorical no theft occurred is stronger than the evidence supports. |

## Failure analysis and mitigation
- Structured output restricts citation IDs to retrieved IDs. All 18 model calls returned valid structure in this run. This does not establish semantic support.
- The model confuses intended and actual destinations (Q07/Q09), and register claims with physical events (Q12). The interface exposes exact passages and separates observations from interpretation; it does not silently correct the model with expected answers.
- Missing cross-document context affected Q07/Q11. Top5 retrieval and document diversification do not guarantee all needed evidence.
- Q14 failed despite the relevant record being present: a generation reasoning failure, not just retrieval.
- Type answers omitted the scholarly citation; Q04 cited the wrong documents. Source-ID validation cannot detect these support errors.
- Q18 overclaims certainty. Prompt instructions preserve uncertainty, but are not a guarantee.
- Next improvement: evaluate a stronger model or constrained evidence quotation with the same held-out methodology. Optional Groq is configured but untested; do not claim it fixes the measured results.

## Reproduction
Run python scripts/evaluate.py --generate. New runs mark judgments pending; do not transfer these assessments to different outputs automatically. json-mode-baseline.json retains the earlier real run. This is a development set, not a held-out benchmark.
