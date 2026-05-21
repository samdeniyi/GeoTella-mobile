import { Redirect } from 'expo-router';

// Placeholder so the Tabs navigator can render an "Add" tab in this position.
// The visible button overrides tabBarButton and pushes the modal `/(app)/add`,
// so this redirect only fires if the route is reached programmatically.
export default function AddButtonPlaceholder() {
  return <Redirect href="/(app)/add" />;
}
