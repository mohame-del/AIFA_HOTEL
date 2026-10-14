<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Project rules

- Frontend-only prototype: all hotel data lives in an in-memory reducer (src/lib/hotel), never a backend — the brief forbids backends and databases.
- Business rules (validation, status transitions) live in src/lib/hotel/logic.ts as pure functions with tests — keeps UI thin and rules verifiable.
- Staff dialogs/drawers are rendered once by StaffUIProvider and opened via useStaffUI() — avoids prop drilling across pages.
