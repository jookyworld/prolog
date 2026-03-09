import SharedRoutineDetailScreen from "@/components/SharedRoutineDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SharedRoutineDetailScreen routineId={Number(id)} />;
}
