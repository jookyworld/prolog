import WorkoutHistoryList from "@/components/WorkoutHistoryList";

export default function WorkoutHistoryScreen() {
  return <WorkoutHistoryList showBackButton={true} detailRoutePath="/(tabs)/profile/history" />;
}
