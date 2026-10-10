# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- A project image and a purpose are now required to submit a project. The one-line pitch is optional and lives under "Additional Details". The required fields share one layout: the image on the left and the title, purpose, category and type on the right, with the same labels and inline errors.
- Project cards fall back to the purpose when a project has no one-line pitch, and the detail page and review modal skip the pitch section when it is empty.

## [0.2.0] - 2026-10-09

### Added

- Search for existing students by name when inviting teammates to a project, instead of typing an ID by hand.
- "Send invites" button on a project so teammates can be invited without leaving the form.
- Each invited teammate shows their status (pending, accepted, or declined) and updates automatically while the form is open.

### Changed

- Shorter submission flow: two steps (Project and Confirm) instead of five. Solo projects no longer go through a team step, and optional details are tucked into a collapsible section.
- Buttons are no longer disabled when something is missing. Errors appear next to the field and the first one is focused.
- Project images now use clearer alt text for screen readers.
- Change image upload ratio to 1:1 (square) on project submission.

## [0.1.0] - 2026-10-07

### Added

- Landing page with project previews, FAQ, an interactive map of Philippine technology business incubators, and a nearest-incubator finder.
- Sign in with Google and role selection for students, sponsors, and admins.
- Student and sponsor onboarding, profiles, and dashboards.
- Project submission with drafts, teammates, ownership declaration, and a thesis paper or pitch deck upload.
- Project images, with square covers on project cards and a compact project detail page.
- Optional live demo, repository, and license fields, and a longer purpose with a character counter.
- Project verification results shown to students and admin reviewers.
- Admin review queue to publish, return, or reject projects.
- Discover page for browsing projects across all user roles, with search and sorting.
- Upvotes, watchlists, saved searches, and notifications.
- Sponsor tools to follow projects and show interest.
- Branded social preview image and improved search engine optimization.
- Netlify and Docker setup.

### Changed

- Consistent Bree Serif typography and updated toast design.
- Improved layouts and button hierarchy on small screens.
- Clearer form requirements, labels, and landing page wording that match what is available today.
- Show the project uploader's name and hide the upvote count on the detail page.

### Fixed

- Remove the public admin option and block users from assigning themselves admin.
- Align personal details labels and values on the profile.
- Remove the upvote UI from admin pages.
- Replace the GitHub icon with a generic code icon.
- Fix header logo, favicon, and browser tab title.
