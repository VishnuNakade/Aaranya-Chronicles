import Story from '../screens/Story';
import { stories } from '../data/stories';
import { useProgress } from '../app/ProgressContext';
export default function StoryGate({ storyId, children }) {
  const { save, markStorySeen } = useProgress();
  if (!stories[storyId] || save.seenStories.includes(storyId)) return children;
  return <Story key={storyId} storyId={storyId} onComplete={() => markStorySeen(storyId)} />;
}
