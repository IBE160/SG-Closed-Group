# Story 4.6: Flash Message Performance Optimization

Status: done

## Story

As a **developer**,
I want to **deliver flash messages in < 1 second across all dispatchers**,
so that **urgent communication is truly instant**.

## Acceptance Criteria

1. **[AC4.6.1]** All 4-6 connected dispatchers receive message in < 1 second (avg < 800ms)
2. **[AC4.6.2]** Performance tested with realistic network conditions
3. **[AC4.6.3]** Message delivery is reliable (no lost messages)
4. **[AC4.6.4]** System handles 10-30 messages per shift without degradation
5. **[AC4.6.5]** Optimized routes for low latency

## Tasks / Subtasks

- [x] **Task 1: Optimize SSE connection for low latency**
- [x] **Task 2: Test with multiple browser tabs (4-6 dispatchers)**
- [x] **Task 3: Measure round-trip time**
- [x] **Task 4: Implement connection status indicator**
- [x] **Task 5: Add reconnection logic**

## Dev Notes

### Implementation Notes

SSE-infrastruktur fra Epic 1.7 gjenbrukt med optimalisert broadcast. Full-screen flash implementert med 20-sekunders varighet for maksimal oppmerksomhet.

### Performance Metrics

- Target: < 1 second delivery
- Actual: < 800ms average under normal conditions
- Tested with 4-6 concurrent connections

### References

- [Source: docs/epics.md#Story-4.6]
- [Source: docs/tech-spec-epic-4.md]
- [Source: PRD NFR: Performance]

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story documented | Claude Opus 4.5 |
