# SCREEN_MAPPING.md

# Mapping between original Next.js routes/components and HTML replica

| Original Route/Component | Source Path                               | HTML Implementation               | Status                    |
| ------------------------ | ----------------------------------------- | --------------------------------- | ------------------------- |
| Login/Landing            | src/routes/index(1).tsx                   | Login screen in index.html/app.js | Replicated                |
| Staff Layout/AppShell    | src/components/aifa/AppShell.tsx          | Sidebar + header layout           | Replicated                |
| Staff Overview           | src/routes/staff.index.tsx                | Overview view                     | Replicated                |
| Rooms                    | src/routes/staff.rooms.tsx                | Rooms grid view                   | Replicated                |
| Reservations             | src/routes/staff.reservations.tsx         | Reservations table                | Replicated                |
| Guest Feedback           | src/routes/staff.feedback.tsx             | Feedback list                     | Replicated                |
| Supervisor               | src/routes/staff.supervisor.tsx           | Supervisor overview               | Replicated                |
| Settings                 | src/routes/staff.settings.tsx             | Settings view                     | Replicated                |
| Guest Kiosk              | src/routes/guest.tsx                      | Guest welcome                     | Replicated                |
| Room Grid                | src/components/aifa/RoomGrid.tsx          | Room grid rendering               | Core structure replicated |
| Reservations Table       | src/components/aifa/ReservationsTable.tsx | Table rendering                   | Core structure replicated |
| Feedback View            | src/components/aifa/FeedbackView.tsx      | List rendering                    | Core structure replicated |
