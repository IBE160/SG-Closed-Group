# Story 5.3: Azure OpenAI Email Parsing (Phase 1 - Manual Pilot)

Status: done

## Story

As a **dispatcher**,
I want to **paste email content into a chatbot that extracts bonfire data**,
so that **I don't have to manually type every field**.

## Acceptance Criteria

1. **[AC5.3.1]** AI extracts: name, phone, address, bonfire size, date/time, notes, municipality
2. **[AC5.3.2]** Extracted data displayed for review and editing
3. **[AC5.3.3]** Can approve or modify data before creating POI
4. **[AC5.3.4]** AI extraction accuracy > 90% for complete emails
5. **[AC5.3.5]** Incomplete extractions flagged for manual completion

## Tasks / Subtasks

- [x] **Task 1: Create /api/ai/extract-bonfire POST endpoint**
- [x] **Task 2: Integrate Azure OpenAI API (GPT-4)**
- [x] **Task 3: Prompt engineering for Norwegian text**
- [x] **Task 4: Return structured JSON with confidence scores**
- [x] **Task 5: Display extracted data in editable form**
- [x] **Task 6: Test with real email samples**

## Dev Notes

### Technical Notes

- Extract structured data: `{ name, phone, address, municipality, size, date_from, date_to, notes, confidence }`
- Flag low-confidence extractions (< 0.8) for manual review
- Reference PRD FR5.1: Phase 1 Manual Chatbot Pilot

### References

- [Source: docs/epics.md#Story-5.3]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
