import SharedRoutineDetailScreen from "@/components/SharedRoutineDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function ProfileSharedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SharedRoutineDetailScreen routineId={Number(id)} />;
}
