# ESO Energy Mobile

React Native mobile client for the ESO Energy platform. Handles utility token vending, automated meter tracking (Power Shield), and real-time solar inverter telemetry.
📲 **Download & Test the Android App (.APK):** [Click Here to Download](https://drive.google.com/file/d/1sjvFaq4hrjm-fIc2ZfJfn969NZvyFHSG/view?usp=drivesdk)
## Tech Stack

- React Native / Expo (TypeScript)
- NativeWind / Tailwind CSS
- Supabase (PostgreSQL, RLS)
- Monnify & Anchor APIs

## Core Features

- Live solar inverter telemetry tracking solar generation, battery bank health, and grid status.
- Power Shield background checks for low token balances with automated alerts.
- Role-based access control backed entirely by Supabase RLS policies.
- Virtual account creation and automated bill vending with built-in idempotency to prevent duplicate charges.

## Running Locally

1. Clone the repo:
   ```bash
   git clone [https://github.com/esoamerica4742/eso-energy-mobile.git](https://github.com/esoamerica4742/eso-energy-mobile.git)
