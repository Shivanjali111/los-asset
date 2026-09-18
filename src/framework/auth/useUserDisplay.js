/**
 * DISPLAY IDENTITY HOOK: Dashboard calls this to populate Sidebar's user prop.
 * Reads the existing Amplify session -> maps the email to a compatibility display label.
 * Returns the default label while loading or when the session cannot be read.
 * App still owns authentication and route protection; this hook only supplies display text.
 */
import { fetchAuthSession } from "aws-amplify/auth";
import useAsyncResource from "../../shared/hooks/useAsyncResource";
import { DEFAULT_LOGGED_IN_USER, getLoggedInUserDisplay } from "./userDisplay";

async function loadDisplay() {
  const session = await fetchAuthSession();
  return getLoggedInUserDisplay(session.tokens?.idToken?.payload?.email);
}
export default function useUserDisplay() {
  const { data } = useAsyncResource(loadDisplay);
  return data || DEFAULT_LOGGED_IN_USER;
}
