import { ClassDetail } from '../pages/ClassDetail';
import { SidePanel } from './SidePanel';

/** SANDBOX D, desktop only: the "What to expect" detail in the shared right side panel. */
export function DetailPanel() {
  return (
    <SidePanel label="Class details">
      <ClassDetail panel />
    </SidePanel>
  );
}
