import { Redirect } from 'expo-router';

/** @deprecated Prefer /billing/utility-history/electricity */
export default function ElectricityHistoryRedirect() {
  return <Redirect href="/billing/utility-history/electricity" />;
}
