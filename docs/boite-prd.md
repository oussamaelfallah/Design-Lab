# Boîte Operational Coordination Feed PRD

## 1. Purpose

Boîte exists to give field workers a central place to understand operational changes that affect their assigned work.

It is not chat, email, a social feed, or a generic notification center. Boîte is an operational coordination feed: a lightweight command center for awareness, priority, and fast navigation.

The worker app mental model is:

- Dashboard = overview
- Travail = execution
- Boîte = operational awareness

## 2. Product Problem

Workers operate across multiple missions, changing field conditions, intermittent connectivity, and manager-driven updates. Without a central operational feed, important changes can be missed, workers may lose context, and field execution can become inconsistent.

Boîte solves these problems:

- Missed mission updates
- Forgotten changes after reconnecting
- Sync issues that are not noticed quickly
- Workers opening or continuing the wrong mission
- Increased mental load from checking multiple places for operational context

## 3. Product Goal

Boîte helps workers:

- Understand what changed
- Identify what matters now
- Access the correct Travail mission quickly
- Stay synchronized with operational decisions from managers

After opening Boîte, the worker should feel informed, guided, and synchronized with operations. The experience should not feel conversational or entertaining.

## 4. User Context

Workers use Boîte in these moments:

- Before starting work, to see new assignments or urgent changes
- During the day, to check whether priorities changed
- After reconnecting, to review updates received while offline
- After a sync issue, to know what needs attention
- When a manager changes a mission objective, deadline, or priority

Boîte should reduce confusion, search time, and mental load. The page should optimize for fast understanding and fast action.

## 5. V1 Information Architecture

Boîte V1 uses separate tabs:

- Mission Updates
- Operational Alerts

### Mission Updates

Mission Updates contain changes tied to assigned work.

Included notification types:

- New mission
- Mission modified
- Objective changed
- Deadline changed
- Mission completed
- Minor mission update

Primary action: open the related Travail mission detail.

### Operational Alerts

Operational Alerts contain issues or coordination signals that affect field execution.

Included alert types:

- Sync failed
- Pending sync
- Offline or reconnect status
- Urgent operational issue
- Device or data condition that may block execution

Primary action: open the relevant resolution surface when available. If no resolution surface exists in V1, tapping the alert should show or expand the alert detail.

## 6. Prioritization Logic

Boîte should not treat every update equally.

### High Priority

High-priority items should be visually stronger and placed above informational items inside their tab.

High-priority examples:

- New mission
- Deadline changed
- Sync failed
- Objective changed
- Urgent operational issue

### Informational

Informational items should remain visible but visually quieter.

Informational examples:

- Mission completed
- Minor update
- All-read state
- Pending sync without immediate failure

### Ordering

Default ordering should prioritize:

1. Unread high-priority items
2. Read high-priority items
3. Unread informational items
4. Read informational items

Within each group, newest items appear first.

## 7. Navigation Behavior

Every Boîte item should create a clear action.

### Mission Update Tap

When a worker taps a mission update:

- Mark the item as read
- Navigate to the related Travail mission detail
- Preserve mission context such as mission type, parcel, sector, deadline, and updated objective

### Operational Alert Tap

When a worker taps an operational alert:

- Mark the item as read only after the worker opens or acknowledges the alert
- If the alert maps to a resolution surface, navigate there
- If no resolution surface exists, expand the alert or open a detail state with the relevant explanation and next step

## 8. Required States

Boîte V1 must cover the following states:

- Loading: feed data is being fetched or restored
- Empty: no operational updates exist yet
- Unread: at least one item needs attention
- All read: all visible items have been reviewed
- Offline: worker may be viewing stale cached updates
- Sync failed: operational alert state for failed upload or download sync
- Mission tab empty: no mission updates in the selected tab
- Alerts tab empty: no operational alerts in the selected tab

State copy should be operational and direct. It should avoid playful or social language.

## 9. UX Requirements

Boîte should optimize for:

- Fast understanding
- Fast action
- Low cognitive load
- Clear separation between mission changes and operational issues
- Stronger hierarchy for urgent work-affecting items

Boîte should avoid:

- Decorative feed patterns
- Chat-like reply affordances
- Social engagement mechanics
- Generic notification language that does not explain operational impact

## 10. Constraints And Non-Goals

V1 explicitly does not include:

- Chat
- Replies
- Attachments
- Free-form manager messages
- Email-style inbox behavior
- Social feed engagement patterns
- Worker-to-manager conversation threads

Boîte is operational-only. Every item must connect to a mission, an execution blocker, a sync condition, or an operational decision.

## 11. Acceptance Criteria

- The PRD clearly states why Boîte exists and what operational problem it solves.
- Boîte is framed as an operational coordination feed, not chat, email, social feed, or a generic notification center.
- The PRD includes separate Mission Updates and Operational Alerts tabs.
- The PRD defines what each notification type means, what priority it has, and what action it enables.
- The PRD includes loading, empty, unread, all-read, offline, sync-failed, mission-tab-empty, and alerts-tab-empty states.
- The PRD defines navigation behavior for mission updates and operational alerts.
- The PRD explicitly defines V1 non-goals.
- The document can be handed to design or engineering without requiring product reinterpretation.
